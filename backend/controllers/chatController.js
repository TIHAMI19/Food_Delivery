import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import User from "../models/User.js"

// Ensure a conversation exists between a customer and the first available admin
export const ensureConversation = async (req, res) => {
  try {
    const user = req.user
    if (!user) return res.status(401).json({ message: "Unauthorized" })

    let customerId
    let adminId

    if (user.role === "admin") {
      adminId = user._id
      customerId = req.body.customerId
      if (!customerId) return res.status(400).json({ message: "customerId is required" })
    } else if (user.role === "customer") {
      customerId = user._id
      const admin = await User.findOne({ role: "admin", isActive: true }).select("_id")
      if (!admin) return res.status(404).json({ message: "No admin available" })
      adminId = admin._id
    } else {
      return res.status(403).json({ message: "Only customers and admins can start chats" })
    }

    let convo = await Conversation.findOne({ customer: customerId, admin: adminId })
    if (!convo) {
      convo = await Conversation.create({ customer: customerId, admin: adminId })
    }

    const populated = await Conversation.findById(convo._id)
      .populate("customer", "name email")
      .populate("admin", "name email")

    res.json({ conversation: populated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to ensure conversation" })
  }
}

export const getMyConversations = async (req, res) => {
  try {
    const user = req.user
    const filter =
      user.role === "admin"
        ? { admin: user._id }
        : user.role === "customer"
        ? { customer: user._id }
        : null
    if (!filter) return res.status(403).json({ message: "Not allowed" })

    const convos = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .populate("customer", "name email")
      .populate("admin", "name email")

    res.json({ conversations: convos })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to fetch conversations" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const convo = await Conversation.findById(id)
    if (!convo) return res.status(404).json({ message: "Conversation not found" })
    if (!convo.customer.equals(user._id) && !convo.admin.equals(user._id)) {
      return res.status(403).json({ message: "Not allowed" })
    }

    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .populate("receiver", "name role")

    res.json({ messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to fetch messages" })
  }
}

export const postMessage = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const user = req.user

    if (!content || !content.trim()) return res.status(400).json({ message: "Message is required" })

    const convo = await Conversation.findById(id)
    if (!convo) return res.status(404).json({ message: "Conversation not found" })
    if (!convo.customer.equals(user._id) && !convo.admin.equals(user._id)) {
      return res.status(403).json({ message: "Not allowed" })
    }

    const receiver = convo.customer.equals(user._id) ? convo.admin : convo.customer
    const message = await Message.create({ conversation: id, sender: user._id, receiver, content: content.trim() })

    convo.lastMessage = content.trim()
    convo.lastMessageAt = new Date()
    await convo.save()

    // Emit to socket layer via global io if available
    if (global.io) {
      global.io.to(String(convo._id)).emit("chat:new_message", {
        _id: message._id,
        conversation: String(convo._id),
        content: message.content,
        sender: String(user._id),
        receiver: String(receiver),
        createdAt: message.createdAt,
      })
    }

    res.status(201).json({ message })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to send message" })
  }
}

export const markRead = async (req, res) => {
  try {
    const { id } = req.params // conversation id
    const user = req.user
    const convo = await Conversation.findById(id)
    if (!convo) return res.status(404).json({ message: "Conversation not found" })
    if (!convo.customer.equals(user._id) && !convo.admin.equals(user._id)) {
      return res.status(403).json({ message: "Not allowed" })
    }
    await Message.updateMany({ conversation: id, receiver: user._id, readAt: null }, { $set: { readAt: new Date() } })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to mark as read" })
  }
}

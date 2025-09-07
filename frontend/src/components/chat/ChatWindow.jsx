import { useEffect, useRef, useState } from "react"
import { chatAPI } from "../../services/api"
import Cookies from "js-cookie"
import { io } from "socket.io-client"
import { useAuth } from "../../contexts/AuthContext"

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"

export default function ChatWindow({ conversation, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const socketRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!conversation?._id) return
    let mounted = true
    const token = Cookies.get("auth_token")
    const socket = io(SOCKET_URL, { auth: { token } })
    socketRef.current = socket

    chatAPI.getMessages(conversation._id).then((res) => {
      if (!mounted) return
      setMessages(res.messages || [])
      setTimeout(scrollToBottom, 0)
    })

    socket.on("connect", () => {
      socket.emit("chat:join", conversation._id)
    })

    socket.on("chat:new_message", (msg) => {
      if (msg.conversation === conversation._id) {
        setMessages((prev) => {
          // Prevent duplicates if the same message arrives more than once
          if (prev.some((m) => String(m._id) === String(msg._id))) return prev
          return [...prev, msg]
        })
        setTimeout(scrollToBottom, 0)
      }
    })

    return () => {
      mounted = false
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?._id])

  const scrollToBottom = () => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  const send = async (e) => {
    e?.preventDefault()
    if (!input.trim()) return
    await chatAPI.sendMessage(conversation._id, input.trim())
    // Do not push locally; rely on socket 'chat:new_message' to avoid duplicates
    setInput("")
    setTimeout(scrollToBottom, 0)
  }

  const isMine = (m) => String(m.sender?._id || m.sender) === String(user._id)

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-orange-50 dark:bg-gray-800 dark:border-gray-800">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Support Chat</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Chat with {user.role === "admin" ? "Customer" : "Admin"}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {messages.map((m) => (
          <div key={m._id} className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isMine(m)
                  ? "bg-orange-500 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              }`}
            >
              <div>{m.content}</div>
              <div className={`mt-1 text-[10px] ${isMine(m) ? "text-orange-100" : "text-gray-400 dark:text-gray-500"}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-3 border-t bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e)
            }}
          />
          <button
            type="submit"
            className="rounded-lg bg-orange-500 text-white px-4 py-2 hover:bg-orange-600 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

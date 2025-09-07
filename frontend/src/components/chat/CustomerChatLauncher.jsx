import { useEffect, useState } from "react"
import { chatAPI } from "../../services/api"
import ChatWindow from "./ChatWindow"
import { useAuth } from "../../contexts/AuthContext"

export default function CustomerChatLauncher() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") return
    // Pre-create conversation so the first message is seamless
    chatAPI
      .ensureConversation()
      .then((res) => setConversation(res.conversation))
      .catch(() => {})
  }, [isAuthenticated, user?.role])

  if (!isAuthenticated || user?.role !== "customer") return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && conversation ? (
        <div className="w-[360px] h-[520px]">
          <ChatWindow conversation={conversation} onClose={() => setOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 flex items-center gap-2"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
          Chat with Admin
        </button>
      )}
    </div>
  )
}

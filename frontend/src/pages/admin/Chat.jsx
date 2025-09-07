import { useEffect, useState } from "react"
import { chatAPI } from "../../services/api"
import ChatWindow from "../../components/chat/ChatWindow"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"

export default function AdminChatPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    chatAPI.getConversations().then((res) => {
      setConversations(res.conversations)
      setActive(res.conversations[0] || null)
    })
  }, [])

  if (user?.role !== "admin") {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <p className="text-gray-600 dark:text-gray-300">Unauthorized</p>
        <Link to="/" className="text-orange-600 hover:underline">Go home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Customer Support</h1>
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-4 bg-white border rounded-lg h-[620px] overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">Conversations</div>
          <div className="divide-y h-full overflow-y-auto dark:divide-gray-800">
            {conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => setActive(c)}
                className={`w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors ${
                  active?._id === c._id ? "bg-orange-50 dark:bg-gray-800" : ""
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{c.customer?.name || "Customer"}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{c.lastMessage || "New chat"}</div>
              </button>
            ))}
          </div>
        </aside>
        <section className="col-span-8 h-[620px]">
          {active ? (
            <ChatWindow conversation={active} onClose={() => setActive(null)} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">Select a conversation</div>
          )}
        </section>
      </div>
    </div>
  )
}

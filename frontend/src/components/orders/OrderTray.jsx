import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import Cookies from "js-cookie"
import { io } from "socket.io-client"
import { useAuth } from "../../contexts/AuthContext"
import { orderAPI } from "../../services/api"

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"

export default function OrderTray() {
  const { isAuthenticated } = useAuth()
  const socketRef = useRef(null)
  const [cards, setCards] = useState([])

  useEffect(() => {
    if (!isAuthenticated) return
    // Preload current active orders into the tray
    orderAPI
      .getUserOrders()
      .then((res) => {
        const orders = Array.isArray(res?.orders) ? res.orders : []
        const actives = orders.filter((o) => !["delivered", "cancelled"].includes(o.status))
        setCards(
          actives.slice(0, 3).map((o) => ({
            orderId: String(o._id),
            restaurantName: o.restaurant?.name,
            items: (o.items || []).map((it) => it.menuItem?.name).filter(Boolean),
            status: o.status,
          }))
        )
      })
      .catch(() => {})
    const token = Cookies.get("auth_token")
    const socket = io(SOCKET_URL, { auth: { token } })
    socketRef.current = socket

    const upsert = (data) => {
      setCards((prev) => {
        const idx = prev.findIndex((c) => c.orderId === data.orderId)
        const next = [...prev]
        if (idx >= 0) next[idx] = { ...next[idx], ...data }
        else next.unshift(data)
        return next.slice(0, 3)
      })
    }

    socket.on("order:created", (payload) => upsert({
      orderId: payload.orderId,
      restaurantName: payload.restaurant?.name,
      items: payload.items,
      status: payload.status,
    }))

    socket.on("order:status_updated", (payload) => {
      if (payload.status === "delivered") {
        setCards((prev) => prev.filter((c) => c.orderId !== payload.orderId))
      } else {
        upsert({
          orderId: payload.orderId,
          status: payload.status,
          restaurantName: payload.restaurant?.name ?? undefined,
        })
      }
    })

    return () => socket.disconnect()
  }, [isAuthenticated])

  if (!isAuthenticated || cards.length === 0) return null

  return (
    <div className="fixed bottom-16 left-4 z-50 space-y-3">
      {cards.map((c) => (
        <Link
          key={c.orderId}
          to={`/orders/${c.orderId}`}
          className="block w-72 rounded-lg shadow-lg border border-orange-600 bg-orange-100 p-3 hover:bg-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-colors cursor-pointer"
          aria-label={`Track order ${c.orderId.slice(-6)}`}
          title="Track order"
        >
          <div className="text-xs text-orange-700">Order #{c.orderId.slice(-6)}</div>
          <div className="font-semibold text-orange-900">{c.restaurantName || "Your order"}</div>
          {Array.isArray(c.items) && c.items.length > 0 && (
            <div className="text-sm text-orange-800/80 truncate">
              {c.items.slice(0, 3).join(", ")}
              {c.items.length > 3 ? "…" : ""}
            </div>
          )}
          <div className="mt-2 inline-flex text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800">
            {c.status?.replace(/_/g, " ")}
          </div>
        </Link>
      ))}
    </div>
  )
}

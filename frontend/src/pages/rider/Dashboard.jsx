"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

export default function RiderDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 5.0,
    totalDeliveries: 0,
  })
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRiderOrders()
    fetchRiderStats()
  }, [])

  const fetchRiderOrders = async () => {
    try {
      // Mock data for now
      setOrders([
        {
          _id: "1",
          orderNumber: "ORD-001",
          restaurant: { name: "Pizza Palace", address: "123 Main St" },
          customer: { name: "John Doe", phone: "+1234567890" },
          deliveryAddress: "456 Oak Ave",
          status: "assigned",
          total: 25.99,
          estimatedTime: "25 mins",
        },
        {
          _id: "2",
          orderNumber: "ORD-002",
          restaurant: { name: "Burger Barn", address: "789 Pine St" },
          customer: { name: "Jane Smith", phone: "+1987654321" },
          deliveryAddress: "321 Elm St",
          status: "picked_up",
          total: 18.5,
          estimatedTime: "15 mins",
        },
      ])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setLoading(false)
    }
  }

  const fetchRiderStats = async () => {
    try {
      // Mock data for now
      setStats({
        todayDeliveries: 8,
        todayEarnings: 156.75,
        rating: 4.8,
        totalDeliveries: 247,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Mock API call
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)))
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const toggleAvailability = async () => {
    try {
      // Mock API call
      setIsAvailable(!isAvailable)
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "picked_up":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "assigned":
        return "picked_up"
      case "picked_up":
        return "delivered"
      default:
        return currentStatus
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "assigned":
        return "Pick Up"
      case "picked_up":
        return "Mark Delivered"
      case "delivered":
        return "Completed"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Available:</span>
                <button
                  onClick={toggleAvailability}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAvailable ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAvailable ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.todayEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-500">No active orders</p>
                <p className="text-sm text-gray-400">New orders will appear here when available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{order.restaurant.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Pickup Address:</p>
                        <p className="font-medium">{order.restaurant.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Delivery Address:</p>
                        <p className="font-medium">{order.deliveryAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer:</p>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Total:</p>
                        <p className="font-medium">${order.total}</p>
                        <p className="text-sm text-gray-500">ETA: {order.estimatedTime}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {order.status !== "delivered" && (
                        <button
                          onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {getStatusText(order.status)}
                        </button>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Call Customer
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Navigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { FiSearch, FiClock, FiStar } from "react-icons/fi"
import { useEffect, useState } from "react"
import { marketingAPI, notificationsAPI } from "../services/api"
import Cookies from "js-cookie"
import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const [bannerUrl, setBannerUrl] = useState("")
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    let mounted = true
    marketingAPI
      .getBanner()
      .then(({ banner }) => {
        if (mounted && banner?.imageUrl) setBannerUrl(banner.imageUrl)
      })
      .catch(() => {})
    // Load recent notifications (optional)
    if (isAuthenticated) {
      notificationsAPI
        .list(5)
        .then(({ notifications }) => {
          if (mounted && Array.isArray(notifications)) {
            setNotifications(
              notifications.map((n) => ({
                id: String(n._id),
                message: `Order ${String(n.payload.orderId).slice(-6)} is now ${n.payload.status.replace(/_/g, " ")}`,
                restaurantName: n.payload.restaurant?.name,
                at: n.createdAt,
              }))
            )
          }
        })
        .catch(() => {})
    }
    return () => {
      mounted = false
    }
  }, [isAuthenticated])

  // Realtime order status notifications
  useEffect(() => {
    if (!isAuthenticated) return
    const token = Cookies.get("auth_token")
    const socket = io(SOCKET_URL, { auth: { token } })
    socket.on("order:status_updated", (payload) => {
      setNotifications((prev) => [
        {
          id: `${payload.orderId}:${payload.updatedAt}`,
          message: `Order ${payload.orderId.slice(-6)} is now ${payload.status.replace(/_/g, " ")}`,
          restaurantName: payload.restaurant?.name,
          at: payload.updatedAt,
        },
        ...prev,
      ].slice(0, 5))
    })
    return () => socket.disconnect()
  }, [isAuthenticated])

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section
        className="text-white py-20"
        style={
          bannerUrl
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!bannerUrl && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 absolute inset-0 -z-10" />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black dark:text-white">Delicious Food, Delivered Fast</h1>
            <p className="text-xl md:text-2xl mb-8 text-black dark:text-white">
              Order from your favorite restaurants and get it delivered to your doorstep
            </p>

            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg text-black dark:text-white">Welcome back, {user?.name}!</p>
                <Link
                  to="/restaurants"
                  className="inline-block bg-black text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Browse Restaurants
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/restaurants"
                  className="inline-block border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Browse Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Notifications Section (only when logged in and there are notifications) */}
      {isAuthenticated && notifications.length > 0 && (
        <section className="py-6 bg-yellow-50 border-y border-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-3">Updates on your orders</h2>
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-center justify-between bg-white rounded-md p-3 shadow-sm border border-yellow-100 dark:bg-gray-900 dark:border-gray-800">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {n.message}
                    {n.restaurantName ? ` at ${n.restaurantName}` : ""}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(n.at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Features Section */}
  <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">Why Choose FoodDelivery?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">We make food ordering simple, fast, and reliable</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
              <p className="text-gray-600 dark:text-gray-300">Find your favorite restaurants and dishes with our powerful search</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">Get your food delivered hot and fresh in 30 minutes or less</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
              <p className="text-gray-600 dark:text-gray-300">Partner restaurants are carefully selected for quality and taste</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">Ready to Order?</h2>
      <p className="text-lg text-gray-600 mb-8 dark:text-gray-300">
            Join thousands of satisfied customers who trust us with their meals
          </p>
          <Link to="/restaurants" className="btn-primary text-lg py-3 px-8">
            Start Ordering Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

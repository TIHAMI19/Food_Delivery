import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./hooks/useCart"
import Navbar from "./components/layout/Navbar"
import { ThemeProvider } from "./contexts/ThemeContext"
import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Restaurants from "./pages/customer/Restaurants"
import RestaurantDetails from "./pages/customer/RestaurantDetails"
import Search from "./pages/customer/Search"
import Checkout from "./pages/customer/Checkout"
import OrderTracking from "./pages/customer/OrderTracking"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminMenu from "./pages/admin/Menu"
import AdminOrders from "./pages/admin/Orders"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Profile from "./pages/Profile"
import RiderDashboard from "./pages/rider/Dashboard"
import AdminRestaurants from "./pages/admin/AdminRestaurants"
import AdminChatPage from "./pages/admin/Chat"
import AdminMarketing from "./pages/admin/Marketing"
import AdminCoupons from "./pages/admin/Coupons"
import CustomerChatLauncher from "./components/chat/CustomerChatLauncher"
import OrderTray from "./components/orders/OrderTray"
import UserOrders from "./pages/customer/Orders"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurants/:id" element={<RestaurantDetails />} />
              <Route path="/search" element={<Search />} />

              {/* Protected Customer Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <UserOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/restaurants"
                element={
                  <ProtectedRoute role="admin">
                    <AdminRestaurants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute role="admin">
                    <AdminMenu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute role="admin">
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/chat"
                element={
                  <ProtectedRoute role="admin">
                    <AdminChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/marketing"
                element={
                  <ProtectedRoute role="admin">
                    <AdminMarketing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute role="admin">
                    <AdminCoupons />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/rider/dashboard"
                element={
                  <ProtectedRoute role="rider">
                    <RiderDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <CustomerChatLauncher />
        </div>
  <OrderTray />
      </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

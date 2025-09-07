"use client";

import { useState, useEffect } from "react"; // Added useEffect import
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSearch,
  FiShoppingCart,
  FiHome,
  FiTruck,
  FiPackage, // Added package icon for order tracking
  FiSun,
  FiMoon,
} from "react-icons/fi";

// ADDED: Cookie utility functions
const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState(null); // ADDED: State for order number
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  // ADDED: Effect to check for current order number in cookies
  useEffect(() => {
    const orderNumber = getCookie("currentOrderNumber");
    if (orderNumber) {
      setCurrentOrderNumber(orderNumber);
    }
  }, []);

  const handleLogout = () => {
    logout();
    clearCart();
    navigate("/");
    setShowUserMenu(false);
  };

  const cartItemCount = getCartItemCount();

  return (
  <nav className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg sticky top-0 z-50 border-b border-orange-600 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-white rounded-lg p-2 mr-3 group-hover:scale-105 transition-transform">
                <FiTruck className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                FoodDelivery
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/restaurants"
              className="text-white hover:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2"
            >
              <FiHome className="w-4 h-4" />
              Restaurants
            </Link>
            <Link
              to="/search"
              className="text-white hover:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              Search
            </Link>

            {isAuthenticated && cartItemCount > 0 && (
              <Link
                to="/checkout"
                className="relative text-white hover:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2"
              >
                <FiShoppingCart className="w-4 h-4" />
                Cart
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-orange-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-white hover:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
              >
                Orders
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="text-white hover:text-orange-100 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2"
              title={isDark ? "Switch to light" : "Switch to dark"}
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 bg-white/5"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="font-medium">{user?.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </p>
                    </div>

                    {/* ADDED: Current Order Tracking Link */}
                    {currentOrderNumber && (
                      <Link
                        to={`/orders/${currentOrderNumber}`}
                        className="block px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiPackage className="w-4 h-4 inline mr-3" />
                        Track Current Order
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser className="w-4 h-4 inline mr-3" />
                      Profile
                    </Link>
                    {(user?.role === "admin" ||
                      user?.role === "restaurant_owner") && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Dashboard
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            to="/admin/chat"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Chat
                          </Link>
                        )}
                        {user?.role === "admin" && (
                          <Link
                            to="/admin/marketing"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Marketing
                          </Link>
                        )}
                        {user?.role === "admin" && (
                          <Link
                            to="/admin/coupons"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Coupons
                          </Link>
                        )}
                        <Link
                          to="/admin/restaurants"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Add New Restaurant
                        </Link>
                        <Link
                          to="/admin/menu"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Menu Management
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Orders
                        </Link>
                      </>
                    )}
                    {user?.role === "rider" && (
                      <Link
                        to="/rider/dashboard"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiTruck className="w-4 h-4 inline mr-3" />
                        Rider Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 inline mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-white hover:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-orange-100 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="ml-2 text-white hover:text-orange-100 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              {isDark ? <FiSun className="h-6 w-6" /> : <FiMoon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-sm rounded-lg mx-4 mb-4">
              <Link
                to="/restaurants"
                className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                to="/search"
                className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Search
              </Link>

              {/* ADDED: Mobile version of order tracking link */}
              {currentOrderNumber && (
                <Link
                  to={`/orders/${currentOrderNumber}`}
                  className="text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <FiPackage className="w-4 h-4" />
                  Track Current Order
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Orders
                </Link>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to="/admin/chat"
                  className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Chat
                </Link>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to="/admin/marketing"
                  className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Marketing
                </Link>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to="/admin/coupons"
                  className="block text-white hover:text-orange-100 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Coupons
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
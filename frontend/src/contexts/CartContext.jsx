"use client"

import { createContext, useContext, useState } from "react"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [currentRestaurant, setCurrentRestaurant] = useState(null)

  const addToCart = (item, restaurantId, restaurantName) => {
    if (currentRestaurant && currentRestaurant.id !== restaurantId) {
      const confirmSwitch = window.confirm(
        `You have items from ${currentRestaurant.name}. Adding items from ${restaurantName} will clear your current cart. Continue?`,
      )
      if (confirmSwitch) {
        setCartItems([{ ...item, quantity: 1, restaurantId }])
        setCurrentRestaurant({ id: restaurantId, name: restaurantName })
      }
      return
    }

    if (!currentRestaurant) {
      setCurrentRestaurant({ id: restaurantId, name: restaurantName })
    }

    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem._id === item._id)
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1, restaurantId }]
    })
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems((prev) => prev.map((item) => (item._id === itemId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newItems = prev.filter((item) => item._id !== itemId)
      if (newItems.length === 0) {
        setCurrentRestaurant(null)
      }
      return newItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    setCurrentRestaurant(null)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const value = {
    cartItems,
    currentRestaurant,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

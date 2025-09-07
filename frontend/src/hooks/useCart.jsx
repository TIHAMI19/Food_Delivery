"use client"

import { createContext, useContext, useReducer } from "react"

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item._id === action.payload._id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === action.payload._id ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
      }

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        restaurant: null,
      }

    case "SET_RESTAURANT":
      return {
        ...state,
        restaurant: action.payload,
        items: state.restaurant && state.restaurant._id !== action.payload._id ? [] : state.items,
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    restaurant: null,
  })

  const addItem = (item, restaurant) => {
    if (restaurant) {
      dispatch({ type: "SET_RESTAURANT", payload: restaurant })
    }
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (itemId) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId })
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } })
    }
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

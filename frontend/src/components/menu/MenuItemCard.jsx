"use client"

import { useState } from "react"
import { FiPlus, FiMinus, FiStar } from "react-icons/fi"

const MenuItemCard = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [showDetails, setShowDetails] = useState(false)

  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      quantity,
    })
    setQuantity(1)
  }

  return (
    <div className="menu-item-card">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <div className="flex items-center gap-1 text-sm">
              <FiStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {item.dietary?.map((diet) => (
              <span key={diet} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                {diet}
              </span>
            ))}
            {item.spiceLevel && item.spiceLevel !== "Mild" && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                {item.spiceLevel}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
              <span className="text-sm text-gray-600">• {item.preparationTime} min</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-transparent dark:border-gray-700">
                <button
                  aria-label="Decrease quantity"
                  title="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiMinus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  title="Increase quantity"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn-primary text-sm px-4 py-2">
                Add ${(item.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>

          {item.ingredients && item.ingredients.length > 0 && (
            <button onClick={() => setShowDetails(!showDetails)} className="text-accent text-sm mt-2 hover:underline">
              {showDetails ? "Hide" : "Show"} ingredients
            </button>
          )}

          {showDetails && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Ingredients:</strong> {item.ingredients.join(", ")}
              </p>
              {item.allergens && item.allergens.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  <strong>Allergens:</strong> {item.allergens.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={item.image || `/placeholder.svg?height=96&width=96&query=${encodeURIComponent(item.name)}`}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

export default MenuItemCard

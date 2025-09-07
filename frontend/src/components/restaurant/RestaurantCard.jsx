import { Link } from "react-router-dom"
import { FiStar, FiClock, FiMapPin, FiTruck } from "react-icons/fi"

const RestaurantCard = ({ restaurant }) => {
  const {
    _id,
    name,
    description,
    cuisine,
    image,
  rating,
  totalReviews,
    priceRange,
    deliveryTime,
    deliveryFee,
    address,
  } = restaurant

  const getImageSrc = () => {
    // If missing or placeholder format, use local placeholder
    if (!image || /placeholder\.svg/i.test(image)) return "/placeholder.svg"
    // Absolute URL
    if (/^https?:\/\//i.test(image)) return image
    // Build backend absolute URL for relative paths
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    const origin = base.replace(/\/api\/?$/, "")
    const path = image.startsWith("/") ? image : `/${image}`
    return `${origin}${path}`
  }

  return (
    <Link to={`/restaurants/${_id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-[1.02] border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={getImageSrc()}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-lg dark:bg-gray-900/90 dark:text-gray-100">
            {priceRange}
          </div>
          <div className="absolute top-3 left-3">
            {deliveryFee === 0 ? (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Free Delivery
              </div>
            ) : (
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                <FiTruck className="w-3 h-3" />${deliveryFee.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors dark:text-gray-100">
              {name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg dark:bg-yellow-900/30">
              <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {Number.isFinite(Number(rating)) ? Number(rating).toFixed(1) : "0.0"}
              </span>
              <span className="text-gray-500 text-xs dark:text-gray-300">({Number.isFinite(Number(totalReviews)) ? Number(totalReviews) : 0})</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed dark:text-gray-300">{description}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {cuisine.slice(0, 3).map((type, index) => (
              <span
                key={type}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  index === 0
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                    : index === 1
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {type}
              </span>
            ))}
            {cuisine.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium dark:bg-gray-800 dark:text-gray-300">
                +{cuisine.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {deliveryTime.min}-{deliveryTime.max} min
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <span>{address.city}</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform group-hover:scale-[1.02]">
            View Menu
          </button>
        </div>
      </div>
    </Link>
  )
}

export default RestaurantCard

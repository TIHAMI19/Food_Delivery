import { FiStar } from "react-icons/fi";

const RatingStars = ({ rating, size = "sm", className = "" }) => {
  const starSize =
    size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";

  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default RatingStars;

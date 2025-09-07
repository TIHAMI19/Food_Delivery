import { useState } from "react";
import { FiStar, FiX, FiImage } from "react-icons/fi";
import LoadingSpinner from "../ui/LoadingSpinner";

const ReviewForm = ({ review, onSubmit, onCancel, isLoading, submitError }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || "");
  const [hoverRating, setHoverRating] = useState(0);
  const minLen = 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-500 rounded-lg max-w-md w-full p-6 shadow-lg ring-1 ring-black/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {review ? "Edit Review" : "Write a Review"}
          </h3>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl focus:outline-none"
                >
                  <FiStar
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Share your experience with this restaurant..."
              required
            />
            <div className="mt-1 text-xs flex justify-between">
              <span className={comment.length < minLen ? "text-red-600" : "text-gray-500"}>
                {comment.length < minLen
                  ? `Minimum ${minLen} characters`
                  : "Looks good"}
              </span>
              <span className="text-gray-400">{comment.length} / 500</span>
            </div>
            {submitError && (
              <p className="text-red-600 text-sm mt-2">{submitError}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-foreground border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0 || comment.length < minLen}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : review ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
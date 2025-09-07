import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import RatingStars from "../../components/restaurant/RatingStars"
import { orderAPI, reviewAPI } from "../../services/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import OrderStatusBadge from "../../components/admin/OrderStatusBadge"
import ReviewForm from "../../components/restaurant/ReviewForm"

const Orders = () => {
  const [tab, setTab] = useState("current")
  const [showReviewFor, setShowReviewFor] = useState(null) // restaurantId to review
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: () => orderAPI.getUserOrders(),
  })

  const createReview = useMutation({
    mutationFn: ({ restaurantId, rating, comment, orderId }) => reviewAPI.create(restaurantId, { rating, comment, orderId }).then((r) => r.data || r),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["user-orders"] })
      await qc.invalidateQueries({ queryKey: ["restaurants"], exact: false })
      setShowReviewFor(null)
      setSelectedOrderId(null)
      setSubmitError("")
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Failed to submit review"
      setSubmitError(msg)
    }
  })

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!showReviewFor || !selectedOrderId) return
    setIsSubmitting(true)
    try {
      await createReview.mutateAsync({ restaurantId: showReviewFor, rating, comment, orderId: selectedOrderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const all = data?.orders || []
  const orders =
    tab === "scheduled"
      ? all.filter((o) => o.orderType === "scheduled")
      : tab === "current"
      ? all.filter((o) => ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(o.status))
      : all.filter((o) => o.status === "delivered" || o.status === "cancelled")

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: "current", label: "Current" },
          { key: "scheduled", label: "Scheduled" },
          { key: "past", label: "Past" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded ${tab === t.key ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-600 py-10">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={o.restaurant?.image} alt={o.restaurant?.name} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <div className="font-medium">{o.restaurant?.name}</div>
                    <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                    {o.orderType === "scheduled" && o.scheduledFor && (
                      <div className="mt-1 inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        <span>Scheduled</span>
                        <span className="text-blue-900 font-medium">{new Date(o.scheduledFor).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div >
                div<OrderStatusBadge status={o.status} />
              </div>
              <div className="mt-3 text-sm text-gray-700">
                {o.items?.slice(0, 3).map((i) => i.menuItem?.name).join(", ")} {o.items?.length > 3 ? "…" : ""}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="font-semibold">
                  ${o.total?.toFixed(2)}
                  {o.fulfillmentMethod && (
                    <span
                      className={`ml-3 inline-flex items-center text-xs px-2 py-0.5 rounded ${
                        o.fulfillmentMethod === "pickup" ? "bg-green-300 text-green-900" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {o.fulfillmentMethod === "delivery" && "Delivery"}
                      {o.fulfillmentMethod === "pickup" && "Pick up"}
                      {o.fulfillmentMethod === "dine_in" && "Dine in"}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <Link to={`/orders/${o._id}`} className="text-orange-600 hover:underline">
                    View details
                  </Link>
                  {o.status === "delivered" && !o.myReview && (
                    <button
                      className="text-sm px-3 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100"
                      onClick={() => { setShowReviewFor(o.restaurant?._id); setSelectedOrderId(o._id); setSubmitError(""); }}
                    >
                      Review restaurant
                    </button>
                  )}
                  {o.status === "delivered" && o.myReview && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <RatingStars rating={o.myReview.rating} size="sm" />
                      <span className="font-medium">{o.myReview.rating.toFixed(1)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="italic max-w-[300px] truncate" title={o.myReview.comment}>{o.myReview.comment}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    {showReviewFor && (
        <ReviewForm
          onSubmit={handleSubmitReview}
          onCancel={() => { setShowReviewFor(null); setSelectedOrderId(null); setSubmitError(""); }}
          isLoading={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  )
}

export default Orders

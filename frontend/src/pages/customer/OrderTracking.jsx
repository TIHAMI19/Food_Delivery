"use client"

import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { FiClock, FiMapPin, FiPhone, FiCheckCircle } from "react-icons/fi"
import { orderAPI } from "../../services/api"
import OrderStatusBadge from "../../components/admin/OrderStatusBadge"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const OrderTracking = () => {
  const { id } = useParams()

  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderAPI.getById(id),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const order = orderData?.order

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: FiCheckCircle },
    { key: "confirmed", label: "Confirmed", icon: FiCheckCircle },
    { key: "preparing", label: "Preparing", icon: FiClock },
    { key: "ready", label: "Ready", icon: FiCheckCircle },
    { key: "out_for_delivery", label: "Out for Delivery", icon: FiMapPin },
    { key: "delivered", label: "Delivered", icon: FiCheckCircle },
  ]

  const getCurrentStepIndex = () => {
    if (!order) return 0
    return statusSteps.findIndex((step) => step.key === order.status)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Order not found</h2>
          <p className="text-muted-foreground">
            The order you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
        </div>

        {/* Order Status Timeline */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Order Status</h2>

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isReached = index <= currentStepIndex // done or current
                const isCurrent = index === currentStepIndex

                const circleBase = "w-10 h-10 rounded-full flex items-center justify-center mb-2"
                const circleColor = isReached
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-400"
                const circleRing = isCurrent ? " ring-4 ring-orange-200" : ""

                const labelClass = isCurrent
                  ? "text-orange-600"
                  : isReached
                  ? "text-gray-900"
                  : "text-gray-400"

                return (
                  <div key={step.key} className="flex flex-col items-center relative">
                    <div className={`${circleBase} ${circleColor}${circleRing}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium ${labelClass}`}>{step.label}</span>

                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-5 left-full w-full h-0.5 ${
                          index < currentStepIndex ? "bg-orange-500" : "bg-gray-200"
                        }`}
                        style={{ width: "calc(100% - 2.5rem)" }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Order Details</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <img
                  src={
                    order.restaurant.image ||
                    `/placeholder.svg?height=48&width=48&query=${encodeURIComponent(order.restaurant.name) || "/placeholder.svg"}`
                  }
                  alt={order.restaurant.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-foreground">{order.restaurant.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FiPhone className="w-3 h-3" />
                    <span>{order.restaurant.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Items Ordered</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground">${order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Delivery Information</h2>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Delivery Address</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{order.deliveryAddress.street}</p>
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                  {order.deliveryAddress.instructions && (
                    <p className="mt-2">
                      <strong>Instructions:</strong> {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Estimated Delivery Time</h4>
                <div className="flex items-center gap-2 text-sm">
                  <FiClock className="w-4 h-4 text-accent" />
                  <span className="text-foreground">{new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</span>
                </div>
              </div>

              {order.actualDeliveryTime && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Delivered At</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-foreground">{new Date(order.actualDeliveryTime).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-foreground mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground capitalize">{order.paymentMethod.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking

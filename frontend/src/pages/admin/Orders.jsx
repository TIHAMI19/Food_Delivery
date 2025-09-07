"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FiEye, FiClock, FiFilter } from "react-icons/fi"
import { orderAPI } from "../../services/api"
import OrderStatusBadge from "../../components/admin/OrderStatusBadge"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const Orders = () => {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-orders", selectedStatus],
    queryFn: () => orderAPI.getAdminOrders({ status: selectedStatus === "all" ? undefined : selectedStatus }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"])
    },
  })

  const orders = ordersData?.orders || []

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const nextStatusMap = {
    pending: "confirmed",
    confirmed: "preparing",
    preparing: "ready",
    ready: "out_for_delivery",
    out_for_delivery: "delivered",
  }

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus })
  }

  const getStatusActions = (order) => {
    const actions = []
    const nextStatus = nextStatusMap[order.status]

    if (nextStatus) {
      actions.push({
        label: `Mark as ${nextStatus.replace("_", " ")}`,
        status: nextStatus,
        variant: "primary",
      })
    }

    if (["pending", "confirmed"].includes(order.status)) {
      actions.push({
        label: "Cancel Order",
        status: "cancelled",
        variant: "destructive",
      })
    }

    return actions
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error loading orders</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage incoming orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === option.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <FiClock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {selectedStatus === "all" ? "No orders have been placed yet." : `No ${selectedStatus} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Customer</h4>
                    <p className="text-sm text-muted-foreground">{order.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress.street}
                      <br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                    </p>
                    {order.deliveryAddress.instructions && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Instructions:</strong> {order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.menuItem?.name || "Unknown Item"}
                        </span>
                        <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Estimated delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-secondary text-sm px-3 py-1 flex items-center gap-1"
                    >
                      <FiEye className="w-3 h-3" />
                      View Details
                    </button>
                    {getStatusActions(order).map((action) => (
                      <button
                        key={action.status}
                        onClick={() => handleStatusUpdate(order._id, action.status)}
                        disabled={updateStatusMutation.isPending}
                        className={`text-sm px-3 py-1 rounded-lg font-medium transition-colors ${
                          action.variant === "destructive"
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "btn-primary"
                        }`}
                      >
                        {updateStatusMutation.isPending ? "Updating..." : action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Order #{selectedOrder.orderNumber}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Status:</strong> <OrderStatusBadge status={selectedOrder.status} />
                    </div>
                    <div>
                      <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
                    </div>
                    <div>
                      <strong>Payment:</strong> {selectedOrder.paymentMethod.replace("_", " ")}
                    </div>
                    <div>
                      <strong>Payment Status:</strong> {selectedOrder.paymentStatus}
                    </div>
                  </div>
                  {/* Add more detailed order information here */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders

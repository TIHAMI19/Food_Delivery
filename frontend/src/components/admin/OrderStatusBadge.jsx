const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
    preparing: { bg: "bg-orange-100", text: "text-orange-800", label: "Preparing" },
    ready: { bg: "bg-orange-100", text: "text-orange-800", label: "Ready" },
    out_for_delivery: { bg: "bg-orange-100", text: "text-orange-800", label: "Out for Delivery" },
    delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}

export default OrderStatusBadge

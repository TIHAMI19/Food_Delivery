const StatsCard = ({ title, value, change, icon: Icon, trend = "up" }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${trend === "up" ? "text-orange-600" : "text-red-600"}`}>
              {trend === "up" ? "+" : ""}
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="bg-orange-100 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard

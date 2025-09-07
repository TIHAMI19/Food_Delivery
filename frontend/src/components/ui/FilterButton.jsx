"use client"

const FilterButton = ({ active, onClick, children, count }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
        active
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
      }`}
    >
      {children}
      {count && <span className="ml-1">({count})</span>}
    </button>
  )
}

export default FilterButton

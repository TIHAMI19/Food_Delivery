"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { FiSearch, FiFilter, FiTrendingUp } from "react-icons/fi"
import { searchAPI } from "../../services/api"
import RestaurantCard from "../../components/restaurant/RestaurantCard"
import MenuItemCard from "../../components/menu/MenuItemCard"
import FilterButton from "../../components/ui/FilterButton"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [filters, setFilters] = useState({
    type: "all",
    maxPrice: "",
    cuisine: [],
    dietary: [],
    rating: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", query, filters],
    queryFn: () => searchAPI.search({ q: query, ...filters }),
    enabled: query.length >= 2,
  })

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["popular-searches"],
    queryFn: () => searchAPI.getPopularSearches(),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  const handleFilterChange = (type, value) => {
    setFilters((prev) => {
      if (type === "cuisine" || type === "dietary") {
        const currentValues = prev[type]
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value]
        return { ...prev, [type]: newValues }
      }
      return { ...prev, [type]: value }
    })
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      maxPrice: "",
      cuisine: [],
      dietary: [],
      rating: "",
    })
  }

  const handlePopularSearch = (searchTerm) => {
    setQuery(searchTerm)
    setSearchParams({ q: searchTerm })
  }

  const cuisineTypes = ["Italian", "Chinese", "Indian", "Mexican", "American", "Thai", "Japanese", "Mediterranean"]
  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Food & Restaurants</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for restaurants, dishes, or cuisines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-10 pr-4 py-3 text-lg"
            />
            <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2">
              Search
            </button>
          </form>

          {/* Filter Toggle */}
          {query && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {["all", "restaurants", "menu"].map((type) => (
                    <FilterButton
                      key={type}
                      active={filters.type === type}
                      onClick={() => handleFilterChange("type", type)}
                    >
                      {type === "all" ? "All" : type === "restaurants" ? "Restaurants" : "Menu Items"}
                    </FilterButton>
                  ))}
                </div>

                {(filters.cuisine.length > 0 || filters.dietary.length > 0 || filters.rating || filters.maxPrice) && (
                  <button onClick={clearFilters} className="text-accent hover:underline text-sm">
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && query && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg space-y-4">
              {/* Cuisine Filters */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {cuisineTypes.map((cuisine) => (
                    <FilterButton
                      key={cuisine}
                      active={filters.cuisine.includes(cuisine)}
                      onClick={() => handleFilterChange("cuisine", cuisine)}
                    >
                      {cuisine}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Dietary Filters */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Dietary Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((dietary) => (
                    <FilterButton
                      key={dietary}
                      active={filters.dietary.includes(dietary)}
                      onClick={() => handleFilterChange("dietary", dietary)}
                    >
                      {dietary}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Price and Rating Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Maximum Price</h3>
                  <input
                    type="number"
                    placeholder="Enter max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Minimum Rating</h3>
                  <div className="flex gap-2">
                    {["4.0", "4.5"].map((rating) => (
                      <FilterButton
                        key={rating}
                        active={filters.rating === rating}
                        onClick={() => handleFilterChange("rating", filters.rating === rating ? "" : rating)}
                      >
                        {rating}+ stars
                      </FilterButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!query ? (
          /* Popular Searches */
          <div className="space-y-8">
            {!popularLoading && popularData && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FiTrendingUp className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Popular Cuisines</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularData.popularCuisines?.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => handlePopularSearch(cuisine)}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Restaurants</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularData.trendingRestaurants?.map((restaurant) => (
                      <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search failed</h3>
            <p className="text-gray-600">Please try again with different search terms.</p>
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Search Results for "{query}"</h2>
              <p className="text-gray-600">{searchResults?.results?.total || 0} results found</p>
            </div>

            {searchResults?.results?.total === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <>
                {/* Restaurants */}
                {searchResults?.results?.restaurants?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Restaurants ({searchResults.results.restaurants.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {searchResults.results.restaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                {searchResults?.results?.menuItems?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Menu Items ({searchResults.results.menuItems.length})
                    </h3>
                    <div className="space-y-4">
                      {searchResults.results.menuItems.map((item) => (
                        <MenuItemCard key={item._id} item={item} onAddToCart={() => {}} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search

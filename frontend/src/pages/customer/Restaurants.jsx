"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiFilter, FiMapPin, FiTrendingUp } from "react-icons/fi";
import { restaurantAPI } from "../../services/api";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import FilterButton from "../../components/ui/FilterButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const Restaurants = () => {
  const [filters, setFilters] = useState({
    search: "",
    cuisine: [],
    priceRange: [],
    rating: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.search ||
    filters.cuisine.length > 0 ||
    filters.priceRange.length > 0 ||
    filters.rating ||
    filters.location;

  const {
    data: restaurantsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["restaurants", filters],
    queryFn: async () => {
      console.log("Restaurants API call with filters:", filters);

      const apiFilters = {};
      if (filters.search) apiFilters.search = filters.search;
      if (filters.cuisine.length > 0)
        apiFilters.cuisine = filters.cuisine.join(",");
      if (filters.priceRange.length > 0)
        apiFilters.priceRange = filters.priceRange.join(",");
      if (filters.rating) apiFilters.rating = filters.rating;
      if (filters.location) apiFilters.location = filters.location;

      console.log("Converted API filters:", apiFilters);

      try {
        const response = await restaurantAPI.getAll(apiFilters);
        console.log("Restaurants API response:", response);

        // Handle different possible response structures
        if (response && typeof response === "object") {
          // If response has restaurants array directly
          if (Array.isArray(response.restaurants)) {
            return {
              restaurants: response.restaurants,
              total: response.total || response.restaurants.length,
            };
          }
          // If response is directly an array
          else if (Array.isArray(response)) {
            return {
              restaurants: response,
              total: response.length,
            };
          }
          // If response has data property
          else if (response.data && Array.isArray(response.data)) {
            return {
              restaurants: response.data,
              total: response.total || response.data.length,
            };
          }
        }

        console.log("Unexpected response structure:", response);
        return { restaurants: [], total: 0 };
      } catch (err) {
        console.error("Restaurants API error:", err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const cuisineTypes = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "American",
    "Thai",
    "Japanese",
    "Mediterranean",
  ];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];

  const handleFilterChange = (type, value) => {
    setFilters((prev) => {
      if (type === "cuisine" || type === "priceRange") {
        const currentValues = prev[type];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [type]: newValues };
      }
      return { ...prev, [type]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      cuisine: [],
      priceRange: [],
      rating: "",
      location: "",
    });
  };

  if (error) {
    console.error("Restaurants query error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message?.includes("ERR_CONNECTION_REFUSED")
              ? "Cannot connect to server. Please make sure the backend is running on port 5000."
              : "Failed to load restaurants. Please try again."}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => refetch()}
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
            <p className="text-xs text-gray-500">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Food
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Order from the best restaurants in your area and get it delivered
              fresh to your door
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg bg-white text-gray-900 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Popular Searches */}
          <div className="text-center">
            <p className="text-orange-100 mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Pizza", "Sushi", "Burgers", "Thai", "Indian"].map((term) => (
                <button
                  key={term}
                  onClick={() => handleFilterChange("search", term)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

  <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {filters.cuisine.length +
                    filters.priceRange.length +
                    (filters.rating ? 1 : 0)}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6 animate-fade-in dark:bg-gray-800">
              {/* Cuisine Filters */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 dark:text-gray-100">
                  <FiTrendingUp className="w-4 h-4 text-orange-500" />
                  Cuisine
                </h3>
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

              {/* Price Range Filters */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
                  Price Range
                </h3>
                <div className="flex gap-2">
                  {priceRanges.map((range) => (
                    <FilterButton
                      key={range}
                      active={filters.priceRange.includes(range)}
                      onClick={() => handleFilterChange("priceRange", range)}
                    >
                      {range}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
                  Minimum Rating
                </h3>
                <div className="flex gap-2">
                  {["4.0", "4.5"].map((rating) => (
                    <FilterButton
                      key={rating}
                      active={filters.rating === rating}
                      onClick={() =>
                        handleFilterChange(
                          "rating",
                          filters.rating === rating ? "" : rating
                        )
                      }
                    >
                      {rating}+ stars
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4 dark:text-gray-300">
              Finding the best restaurants for you...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 dark:text-gray-100">
                  {hasActiveFilters
                    ? `${
                        restaurantsData?.total ||
                        restaurantsData?.restaurants?.length ||
                        0
                      } restaurants found`
                    : `All Restaurants (${
                        restaurantsData?.total ||
                        restaurantsData?.restaurants?.length ||
                        0
                      })`}
                </h2>
                {filters.search && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Results for "
                    <span className="font-medium text-orange-600">
                      {filters.search}
                    </span>
                    "
                  </p>
                )}
                {hasActiveFilters && !filters.search && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Filtered by:{" "}
                    {[
                      ...filters.cuisine,
                      ...filters.priceRange,
                      filters.rating && `${filters.rating}+ stars`,
                      filters.location,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FiMapPin className="w-4 h-4" />
                <span>Delivering to your area</span>
              </div>
            </div>

            {!restaurantsData?.restaurants ||
            restaurantsData.restaurants.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-gray-800">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  {hasActiveFilters
                    ? "No restaurants match your filters"
                    : "No restaurants available"}
                </h3>
                <p className="text-gray-600 mb-6 dark:text-gray-300">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search terms to find more options."
                    : "We're working on adding restaurants to your area. Please check back soon!"}
                </p>
                <div className="space-y-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Show All Restaurants
                    </button>
                  )}
                  <button
                    onClick={() => refetch()}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors ml-2"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurantsData.restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
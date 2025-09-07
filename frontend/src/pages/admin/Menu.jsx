"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import { menuAPI, restaurantAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import MenuItemForm from "../../components/admin/MenuItemForm";

const Menu = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["user-restaurants"],
    queryFn: () => {
      if (user?.role === "admin") {
        return restaurantAPI.getAll(); // Admin gets all restaurants
      } else {
        return restaurantAPI.getAll({ owner: user._id }); // Restaurant owner gets only their restaurants
      }
    },
    enabled: user?.role === "restaurant_owner" || user?.role === "admin",
  });

  useEffect(() => {
    if (
      user?.role === "admin" &&
      restaurantsData?.restaurants?.length > 0 &&
      !selectedRestaurant
    ) {
      setSelectedRestaurant(restaurantsData.restaurants[0]._id);
    }
  }, [restaurantsData, user?.role, selectedRestaurant]);

  const userRestaurant =
    user?.role === "admin"
      ? restaurantsData?.restaurants?.find((r) => r._id === selectedRestaurant)
      : restaurantsData?.restaurants?.[0]; // Restaurant owner gets their first restaurant
  const restaurantId = userRestaurant?._id;

  // console.log("Menu Debug:", {
  //   userRole: user?.role,
  //   selectedRestaurant,
  //   restaurantsCount: restaurantsData?.restaurants?.length,
  //   restaurantId,
  //   restaurantsLoading,
  // });

  const {
    data: menuData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => menuAPI.getByRestaurant(restaurantId),
    enabled: !!restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: menuAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["menu", restaurantId]);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["menu", restaurantId]);
      setShowForm(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: menuAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["menu", restaurantId]);
    },
  });

  const menuItems = menuData?.menuItems || [];
  const groupedMenu = menuData?.groupedMenu || {};

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(groupedMenu);

  const handleSubmit = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data });
    } else {
      createMutation.mutate({ ...data, restaurant: restaurantId });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteMutation.mutate(item._id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (restaurantsLoading && user?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error loading menu
          </h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === "admin"
                ? "Manage restaurant menus"
                : "Manage your restaurant's menu items"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!restaurantId}
          >
            <FiPlus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>

        {/* Restaurant Selector for Admin Users */}
        {user?.role === "admin" && restaurantsData?.restaurants?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Restaurant
            </label>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {restaurantsData.restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search and Filters */}
        {restaurantId && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({menuItems.length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category} ({groupedMenu[category]?.length || 0})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message when no restaurant is selected for admin */}
        {!restaurantId && user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Restaurant
            </h3>
            <p className="text-gray-600">
              Choose a restaurant above to manage its menu items.
            </p>
          </div>
        )}

        {/* Menu Items */}
        {restaurantId && filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters."
                : "Start by adding your first menu item."}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          restaurantId && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        item.image ||
                        `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(
                          item.name
                        )}`
                      }
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {item.preparationTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Form Modal */}
        {showForm && (
          <MenuItemForm
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default Menu;
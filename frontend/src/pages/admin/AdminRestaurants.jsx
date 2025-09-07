"use client";

import { useState, useEffect } from "react";
import AddRestaurantForm from "../../components/admin/AddRestaurantForm";

const AdminRestaurants = () => {
  const [activeTab, setActiveTab] = useState("add-restaurant");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  });

  const getAuthTokenFromCookies = () => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth_token" || name === "authToken") {
        return value;
      }
    }
    return null;
  };

  const validateAdminAuth = async () => {
    try {
      const token = getAuthTokenFromCookies();

      if (!token) {
        setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
        return {
          isValid: false,
          message: "No authentication token found. Please log in.",
        };
      }

      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const isAdmin = userData.user?.role === "admin";

        setAuthStatus({
          isAuthenticated: true,
          isAdmin,
          user: userData.user,
        });

        if (!isAdmin) {
          return { isValid: false, message: "Admin privileges required." };
        }

        return { isValid: true, token, user: userData.user };
      } else {
        setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
        return {
          isValid: false,
          message: "Authentication failed. Please log in again.",
        };
      }
    } catch (error) {
      console.error("[v0] Auth validation error:", error);
      setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
      return {
        isValid: false,
        message: "Network error during authentication.",
      };
    }
  };

  useEffect(() => {
    if (activeTab === "manage-restaurants") {
      fetchRestaurants();
    }
  }, [activeTab]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const authResult = await validateAdminAuth();

      if (!authResult.isValid) {
        console.error("[v0] Auth failed:", authResult.message);
        setLoading(false);
        return;
      }

      console.log("[v0] Fetching restaurants as admin:", authResult.user?.name);

      const response = await fetch("/api/restaurants", {
        headers: {
          Authorization: `Bearer ${authResult.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRestaurants(data.restaurants || []);
      } else {
        console.error("[v0] Failed to fetch restaurants:", response.status);
      }
    } catch (error) {
      console.error("[v0] Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) {
      return;
    }

    try {
      const authResult = await validateAdminAuth();

      if (!authResult.isValid) {
        alert(authResult.message);
        return;
      }

      console.log("[v0] Deleting restaurant as admin:", authResult.user?.name);

      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authResult.token}`,
        },
      });

      if (response.ok) {
        setRestaurants((prev) => prev.filter((r) => r._id !== restaurantId));
        alert("Restaurant deleted successfully");
      } else {
        if (response.status === 401) {
          alert("Authentication failed. Please log in as admin.");
        } else if (response.status === 403) {
          alert("Access denied. Admin privileges required.");
        } else {
          alert("Error deleting restaurant");
        }
      }
    } catch (error) {
      console.error("[v0] Network error:", error);
      alert("Network error. Please try again.");
    }
  };

  const toggleRestaurantStatus = async (restaurantId, currentStatus) => {
    try {
      const authResult = await validateAdminAuth();

      if (!authResult.isValid) {
        alert(authResult.message);
        return;
      }

      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authResult.token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setRestaurants((prev) =>
          prev.map((r) =>
            r._id === restaurantId ? { ...r, isActive: !currentStatus } : r
          )
        );
      } else {
        if (response.status === 401) {
          alert("Authentication failed. Please log in as admin.");
        } else if (response.status === 403) {
          alert("Access denied. Admin privileges required.");
        } else {
          alert("Error updating restaurant status");
        }
      }
    } catch (error) {
      console.error("[v0] Network error:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Restaurant Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Manage restaurants and their information
        </p>
        {authStatus.user && (
          <p className="text-sm text-green-600 mt-2">
            Logged in as: {authStatus.user.name} ({authStatus.user.role})
          </p>
        )}
        {!authStatus.isAuthenticated && (
          <p className="text-sm text-red-600 mt-2">
            Please log in with admin credentials to access this dashboard
          </p>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "add-restaurant"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("add-restaurant")}
        >
          Add Restaurant
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "manage-restaurants"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("manage-restaurants")}
        >
          Manage Restaurants
        </button>
      </div>

      <div className="min-h-96">
        {activeTab === "add-restaurant" && <AddRestaurantForm />}

        {activeTab === "manage-restaurants" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                All Restaurants
              </h2>
              <button
                onClick={fetchRestaurants}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading restaurants...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No restaurants found. Add your first restaurant!
                    </p>
                  </div>
                ) : (
                  restaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            restaurant.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {restaurant.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Cuisine:</span>{" "}
                          {restaurant.cuisine?.join(", ") || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {restaurant.address?.street},{" "}
                          {restaurant.address?.city}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {restaurant.phone}
                        </p>
                        <p>
                          <span className="font-medium">Price Range:</span>{" "}
                          {restaurant.priceRange}
                        </p>
                        <p>
                          <span className="font-medium">Delivery Time:</span>{" "}
                          {restaurant.deliveryTime?.min}-
                          {restaurant.deliveryTime?.max} mins
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            toggleRestaurantStatus(
                              restaurant._id,
                              restaurant.isActive
                            )
                          }
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            restaurant.isActive
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {restaurant.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteRestaurant(restaurant._id)}
                          className="flex-1 px-3 py-2 text-sm font-medium bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurants;
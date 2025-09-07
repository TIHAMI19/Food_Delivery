"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiStar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiShoppingCart,
  FiMenu,
  FiMessageSquare,
} from "react-icons/fi";
import { restaurantAPI } from "../../services/api";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";
import MenuItemCard from "../../components/menu/MenuItemCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    restaurant: cartRestaurant,
    addItem,
    getCartTotal,
    getCartItemCount,
  } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("menu"); // New state for tab switching

  const {
    data: restaurantData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => restaurantAPI.getById(id),
  });

  const restaurant = restaurantData?.restaurant;
  const menuItems = restaurantData?.menuItems || [];

  // Group menu items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);
  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : groupedMenu[selectedCategory] || [];

  const addToCart = (item) => {
    addItem(item, restaurant);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  // Mock reviews data (you can replace this with actual API call)
  const mockReviews = [
    {
      id: 1,
      user: "John D.",
      rating: 5,
      comment: "Amazing food and great service! The pasta was incredible.",
      date: "2024-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      user: "Sarah M.",
      rating: 4,
      comment: "Good food, but delivery took a bit longer than expected.",
      date: "2024-01-10",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      user: "Mike R.",
      rating: 5,
      comment: "Best restaurant in the area! Highly recommended.",
      date: "2024-01-05",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Restaurant not found
          </h2>
          <p className="text-muted-foreground">
            The restaurant you're looking for doesn't exist or is unavailable.
          </p>
        </div>
      </div>
    );
  }

  const renderMenuContent = () => (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Menu</h2>
        <span className="text-muted-foreground">{menuItems.length} items</span>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
              }`}
            >
              {category} ({groupedMenu[category]?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No menu items available in this category.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuItemCard key={item._id} item={item} onAddToCart={addToCart} />
          ))
        )}
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
        <span className="text-muted-foreground">
          {restaurant.totalReviews} reviews
        </span>
      </div>

      {/* Reviews Summary */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">
              {restaurant.rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(restaurant.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {restaurant.totalReviews} reviews
            </div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-3">{rating}</span>
                <FiStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${
                        rating === 5
                          ? 60
                          : rating === 4
                          ? 25
                          : rating === 3
                          ? 10
                          : rating === 2
                          ? 3
                          : 2
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {rating === 5
                    ? "60%"
                    : rating === 4
                    ? "25%"
                    : rating === 3
                    ? "10%"
                    : rating === 2
                    ? "3%"
                    : "2%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <img
                src={review.avatar}
                alt={review.user}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {review.user}
                    </h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Reviews Button */}
      <div className="text-center mt-6">
        <button className="btn-outline">Load More Reviews</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <img
          src={
            restaurant.image ||
            `/placeholder.svg?height=320&width=800&query=${
              encodeURIComponent(restaurant.name + " restaurant") ||
              "/placeholder.svg"
            }`
          }
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {restaurant.name}
            </h1>
            <p className="text-lg opacity-90 mb-4">{restaurant.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="opacity-75">
                  ({restaurant.totalReviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                <span>
                  {restaurant.deliveryTime.min}-{restaurant.deliveryTime.max}{" "}
                  min
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" />
                <span>
                  {restaurant.address.street}, {restaurant.address.city}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FiPhone className="w-4 h-4" />
                <span>{restaurant.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisine.map((type) => (
                <span
                  key={type}
                  className="bg-accent/10 text-accent px-3 py-1 rounded-full font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Price range: {restaurant.priceRange}</span>
              <span>
                Delivery:{" "}
                {restaurant.deliveryFee === 0
                  ? "Free"
                  : `$${restaurant.deliveryFee.toFixed(2)}`}
              </span>
              <span>Minimum order: ${restaurant.minimumOrder.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "menu"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FiMenu className="w-4 h-4" />
              Menu
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FiMessageSquare className="w-4 h-4" />
              Reviews ({restaurant.totalReviews})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          {activeTab === "menu" ? renderMenuContent() : renderReviewsContent()}

          {/* Cart Sidebar - Only show for menu tab */}
          {activeTab === "menu" &&
            items.length > 0 &&
            cartRestaurant?._id === restaurant?._id && (
              <div className="lg:w-80">
                <div className="sticky top-4 bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FiShoppingCart className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">
                      Your Order ({getCartItemCount()} items)
                    </h3>
                  </div>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-muted-foreground text-xs">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium">
                        {restaurant.deliveryFee === 0
                          ? "Free"
                          : `$${restaurant.deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-lg font-bold">
                      <span>Total</span>
                      <span>
                        ${(getCartTotal() + restaurant.deliveryFee).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="btn-primary w-full"
                      disabled={getCartTotal() < restaurant.minimumOrder}
                    >
                      {getCartTotal() < restaurant.minimumOrder
                        ? `Minimum order $${restaurant.minimumOrder.toFixed(2)}`
                        : "Proceed to Checkout"}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
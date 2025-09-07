"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { orderAPI, couponsAPI } from "../../services/api";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";
import PaymentForm from "../payment/PaymentForm";

const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const removeCookie = (name) => {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

const CheckoutForm = () => {
  const { user } = useAuth();
  const { items, restaurant, getCartTotal, clearCart, removeItem } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [notification, setNotification] = useState(null);
  const [orderType, setOrderType] = useState("instant");
  const [scheduledFor, setScheduledFor] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); // { code, discount }
  const [couponError, setCouponError] = useState("");

  // Show notification for 5 seconds
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      deliveryAddress: {
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        zipCode: user?.address?.zipCode || "",
        instructions: "",
      },
    },
  });

  // Set user address on load
  useEffect(() => {
    if (user?.address) {
      setValue("deliveryAddress.street", user.address.street);
      setValue("deliveryAddress.city", user.address.city);
      setValue("deliveryAddress.state", user.address.state);
      setValue("deliveryAddress.zipCode", user.address.zipCode);
    }
  }, [user, setValue]);

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => orderAPI.create(orderData),
    onSuccess: (data) => {
      clearCart();

      // ADDED: Save order number to cookie for tracking
      if (data.order && data.order._id) {
        setCookie("currentOrderNumber", data.order._id, 1); // Expires in 1 day
      }

      showNotification("Order placed successfully!", "success");
      navigate(`/orders/${data.order._id}`);
    },
    onError: (error) => {
      console.error(
        "Order creation failed:",
        error.response?.data || error.message
      );
      setServerErrors(error.response?.data?.errors);
      setIsSubmitting(false);
      showNotification(
        error.response?.data?.message || "Failed to create order",
        "error"
      );
    },
  });

  const subtotal = getCartTotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const tax = subtotal * 0.08;
  const discount = couponApplied?.discount || 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee + tax;

  const onAddressSubmit = (data) => {
    if (total < restaurant.minimumOrder) {
      showNotification(
        `Minimum order amount is $${restaurant.minimumOrder.toFixed(2)}`,
        "error"
      );
      return;
    }

    setOrderData({
      restaurantId: restaurant._id,
      items: items.map((item) => ({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || "",
      })),
      deliveryAddress: data.deliveryAddress,
      customerId: user?._id,
  fulfillmentMethod,
  orderType,
  scheduledFor: orderType === "scheduled" ? new Date(scheduledFor).toISOString() : undefined,
  couponCode: couponApplied?.code || undefined,
    });
    setCurrentStep(2);
  };

  const onPaymentSuccess = async (paymentResult) => {
    setIsSubmitting(true);
    setServerErrors(null);

    try {
      if (!orderData?.restaurantId) throw new Error("No restaurant selected");
      if (!orderData?.items?.length) throw new Error("Your cart is empty");
      if (total < restaurant.minimumOrder) {
        throw new Error(
          `Minimum order amount is $${restaurant.minimumOrder.toFixed(2)}`
        );
      }

      const methodMap = { card: "credit_card", paypal: "paypal", cash: "cash" };
      const finalOrderData = {
        ...orderData,
        subtotal,
        deliveryFee,
        tax,
  total,
        estimatedDeliveryTime: new Date(
          Date.now() + (restaurant.deliveryTime?.max || 45) * 60000
        ),
        paymentMethod: methodMap[paymentResult.method] || "credit_card",
        paymentStatus: "paid",
        paymentDetails: {
          transactionId: paymentResult.transactionId,
          amount: total,
          currency: "USD",
        },
      };

      await createOrderMutation.mutateAsync(finalOrderData);
    } catch (error) {
      console.error("Order submission failed:", error);
      setIsSubmitting(false);
      showNotification(
        error.message || "Failed to process your order",
        "error"
      );
    }
  };

  const tryApplyCoupon = async () => {
    setCouponError("");
    setCouponApplied(null);
    const code = couponCode.trim();
    if (!code) return;
    try {
      const { valid, discount, reason } = await couponsAPI.validate({
        code,
        subtotal,
        restaurantId: restaurant?._id,
      });
      if (!valid || !discount) {
        setCouponError(reason || "Coupon not applicable");
        return;
      }
      setCouponApplied({ code: code.toUpperCase(), discount });
    } catch (e) {
      setCouponError(e.response?.data?.message || "Failed to validate coupon");
    }
  };

  const onPaymentCancel = () => {
    setCurrentStep(1);
    showNotification("Payment cancelled", "info");
  };

  if (!restaurant || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some items to your cart before checking out.
        </p>
        <button
          onClick={() => navigate("/restaurants")}
          className="btn-primary"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-md flex items-center ${
            notification.type === "error"
              ? "bg-red-50 text-red-800"
              : notification.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {notification.type === "error" ? (
            <FiAlertCircle className="w-5 h-5 mr-2" />
          ) : notification.type === "success" ? (
            <FiCheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <FiInfo className="w-5 h-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header with Steps */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center text-accent hover:text-accent/80 mr-4"
            >
              <FiArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Fulfillment Method */}
        <div className="mt-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">How would you like to get your food?</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFulfillmentMethod("delivery")}
              className={`px-4 py-2 rounded border ${fulfillmentMethod === "delivery" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"}`}
            >
              Delivery (default)
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentMethod("pickup")}
              className={`px-4 py-2 rounded border ${fulfillmentMethod === "pickup" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"}`}
            >
              Pick up
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentMethod("dine_in")}
              className={`px-4 py-2 rounded border ${fulfillmentMethod === "dine_in" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"}`}
            >
              Dine in
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center ${
              currentStep >= 1 ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <span className="ml-2">Address</span>
          </div>

          <div
            className={`w-8 h-0.5 ${
              currentStep >= 2 ? "bg-accent" : "bg-muted"
            }`}
          ></div>

          <div
            className={`flex items-center ${
              currentStep >= 2 ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span className="ml-2">Payment</span>
          </div>
        </div>
      </div>

      {/* Server error display */}
      {serverErrors && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There were errors with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(serverErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <form
              onSubmit={handleSubmit(onAddressSubmit)}
              className="space-y-6"
            >
              {/* Delivery Address */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <FiMapPin className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Street Address
                    </label>
                    <input
                      {...register("deliveryAddress.street", {
                        required: "Street address is required",
                      })}
                      className="input-field"
                      placeholder="Enter your street address"
                    />
                    {errors.deliveryAddress?.street && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.deliveryAddress.street.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        City
                      </label>
                      <input
                        {...register("deliveryAddress.city", {
                          required: "City is required",
                        })}
                        className="input-field"
                        placeholder="City"
                      />
                      {errors.deliveryAddress?.city && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.deliveryAddress.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        State
                      </label>
                      <input
                        {...register("deliveryAddress.state", {
                          required: "State is required",
                        })}
                        className="input-field"
                        placeholder="State"
                      />
                      {errors.deliveryAddress?.state && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.deliveryAddress.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      ZIP Code
                    </label>
                    <input
                      {...register("deliveryAddress.zipCode", {
                        required: "ZIP code is required",
                      })}
                      className="input-field"
                      placeholder="ZIP Code"
                    />
                    {errors.deliveryAddress?.zipCode && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.deliveryAddress.zipCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      {...register("deliveryAddress.instructions")}
                      className="input-field"
                      rows={3}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>

              {/* Order Timing */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <FiClock className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-semibold text-foreground">Order Time</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="orderType"
                        value="instant"
                        checked={orderType === "instant"}
                        onChange={() => setOrderType("instant")}
                      />
                      <span>Instant order</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="orderType"
                        value="scheduled"
                        checked={orderType === "scheduled"}
                        onChange={() => setOrderType("scheduled")}
                      />
                      <span>Order for later</span>
                    </label>
                  </div>
                  {orderType === "scheduled" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Choose date & time
                        </label>
                        <input
                          type="datetime-local"
                          className="input-field"
                          value={scheduledFor}
                          min={new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)}
                          onChange={(e) => setScheduledFor(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Schedule at least 15 minutes from now.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={total < restaurant.minimumOrder}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>

              {total < restaurant.minimumOrder && (
                <p className="text-destructive text-sm text-center">
                  Minimum order amount is ${restaurant.minimumOrder.toFixed(2)}
                </p>
              )}
            </form>
          )}

          {currentStep === 2 && (
            <PaymentForm
              total={total}
              onPaymentSuccess={onPaymentSuccess}
              onCancel={onPaymentCancel}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Order Summary
            </h2>

            {/* Restaurant Info */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <img
                src={
                  restaurant.image ||
                  `/placeholder.svg?height=48&width=48&query=${
                    encodeURIComponent(restaurant.name) || "/placeholder.svg"
                  }`
                }
                alt={restaurant.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium text-foreground">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FiClock className="w-3 h-3" />
                  <span>
                    {restaurant.deliveryTime?.min || 30}-
                    {restaurant.deliveryTime?.max || 45} min
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 italic">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {/* Coupon row */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                      placeholder="Have a coupon code?"
                      className="input-field"
                    />
                    <button type="button" onClick={tryApplyCoupon} className="btn-secondary whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-sm text-red-600 mt-1">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-sm text-green-600 mt-1">Applied {couponApplied.code} −${couponApplied.discount.toFixed(2)}</p>
                  )}
                </div>
                <div className="text-right min-w-[5rem]">
                  <span className="text-muted-foreground">Discount</span>
                  <div className="font-medium text-foreground">-${discount.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {orderType === "scheduled" && scheduledFor && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Scheduled For</span>
                  <span>{new Date(scheduledFor).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Address Preview (Step 2) */}
            {currentStep === 2 && orderData && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-2">
                  Delivery Address:
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>{orderData.deliveryAddress.street}</p>
                  <p>
                    {orderData.deliveryAddress.city},{" "}
                    {orderData.deliveryAddress.state}{" "}
                    {orderData.deliveryAddress.zipCode}
                  </p>
                  {orderData.deliveryAddress.instructions && (
                    <p className="mt-1 italic">
                      Instructions: {orderData.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

// "use client";

// import { useState, useEffect } from "react";

// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div
//       className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
//         }`}
//     >
//       <div className="flex items-center justify-between">
//         <span>{message}</span>
//         <button
//           onClick={onClose}
//           className="ml-4 text-white hover:text-gray-200"
//         >
//           ×
//         </button>
//       </div>
//     </div>
//   );
// };

// const AddRestaurantForm = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     owner: "",
//     cuisine: [],
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       zipCode: "",
//       coordinates: { lat: "", lng: "" },
//     },
//     phone: "",
//     email: "",
//     rating: "",
//     totalReviews: "",
//     priceRange: "$",
//     deliveryTime: { min: "", max: "" },
//     deliveryFee: "",
//     minimumOrder: "",
//     operatingHours: {
//       monday: { open: "", close: "", closed: false },
//       tuesday: { open: "", close: "", closed: false },
//       wednesday: { open: "", close: "", closed: false },
//       thursday: { open: "", close: "", closed: false },
//       friday: { open: "", close: "", closed: false },
//       saturday: { open: "", close: "", closed: false },
//       sunday: { open: "", close: "", closed: false },
//     },
//     featuredItems: [{ name: "", price: "", description: "" }],
//     isActive: true,
//     promotions: [""],
//   });

//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [authStatus, setAuthStatus] = useState({
//     isAuthenticated: false,
//     isAdmin: false,
//     user: null,
//   });

//   const cuisineOptions = [
//     "Italian",
//     "Chinese",
//     "Mexican",
//     "Indian",
//     "American",
//     "Thai",
//     "Japanese",
//     "Mediterranean",
//     "French",
//     "Korean",
//     "Vietnamese",
//     "Other",
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes(".")) {
//       const [parent, child] = name.split(".");
//       setFormData((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       address: {
//         ...prev.address,
//         [name]: value,
//       },
//     }));
//   };

//   const handleCoordinatesChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       address: {
//         ...prev.address,
//         coordinates: {
//           ...prev.address.coordinates,
//           [name]: value,
//         },
//       },
//     }));
//   };

//   const handleCuisineChange = (cuisine) => {
//     setFormData((prev) => ({
//       ...prev,
//       cuisine: prev.cuisine.includes(cuisine)
//         ? prev.cuisine.filter((c) => c !== cuisine)
//         : [...prev.cuisine, cuisine],
//     }));
//   };

//   const handleOperatingHoursChange = (day, field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       operatingHours: {
//         ...prev.operatingHours,
//         [day]: {
//           ...prev.operatingHours[day],
//           [field]: value,
//         },
//       },
//     }));
//   };

//   const handleFeaturedItemChange = (index, field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       featuredItems: prev.featuredItems.map((item, i) =>
//         i === index ? { ...item, [field]: value } : item
//       ),
//     }));
//   };

//   const addFeaturedItem = () => {
//     setFormData((prev) => ({
//       ...prev,
//       featuredItems: [
//         ...prev.featuredItems,
//         { name: "", price: "", description: "" },
//       ],
//     }));
//   };

//   const removeFeaturedItem = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       featuredItems: prev.featuredItems.filter((_, i) => i !== index),
//     }));
//   };

//   const handlePromotionChange = (index, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       promotions: prev.promotions.map((promo, i) =>
//         i === index ? value : promo
//       ),
//     }));
//   };

//   const addPromotion = () => {
//     setFormData((prev) => ({
//       ...prev,
//       promotions: [...prev.promotions, ""],
//     }));
//   };

//   const removePromotion = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       promotions: prev.promotions.filter((_, i) => i !== index),
//     }));
//   };

//   const getAuthTokenFromCookies = () => {
//     const cookies = document.cookie.split(";");
//     for (const cookie of cookies) {
//       const [name, value] = cookie.trim().split("=");
//       if (name === "auth_token" || name === "authToken") {
//         return value;
//       }
//     }
//     return null;
//   };

//   const validateAdminAuth = async () => {
//     try {
//       const token = getAuthTokenFromCookies();
//       if (!token) {
//         setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
//         return { isValid: false, message: "Please log in to continue." };
//       }

//       const response = await fetch("/api/auth/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         const isAdmin = userData.user?.role === "admin";
//         setAuthStatus({ isAuthenticated: true, isAdmin, user: userData.user });

//         if (!isAdmin) {
//           return { isValid: false, message: "Admin access required." };
//         }
//         return { isValid: true, token, user: userData.user };
//       } else {
//         setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
//         return { isValid: false, message: "Authentication failed." };
//       }
//     } catch (error) {
//       setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
//       return { isValid: false, message: "Network error occurred." };
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const authResult = await validateAdminAuth();
//       if (!authResult.isValid) {
//         showToast(authResult.message);
//         setLoading(false);
//         return;
//       }

//       console.log("[v0] Admin authenticated:", authResult.user?.name);

//       const formattedData = {
//         name: formData.name,
//         description: formData.description,
//         owner: formData.owner,
//         cuisine: formData.cuisine,
//         address: {
//           street: formData.address.street,
//           city: formData.address.city,
//           state: formData.address.state,
//           zipCode: formData.address.zipCode,
//           coordinates: {
//             lat: formData.address.coordinates.lat
//               ? Number.parseFloat(formData.address.coordinates.lat)
//               : 0,
//             lng: formData.address.coordinates.lng
//               ? Number.parseFloat(formData.address.coordinates.lng)
//               : 0,
//           },
//         },
//         phone: formData.phone,
//         email: formData.email,
//         rating: formData.rating ? Number.parseFloat(formData.rating) : 0,
//         totalReviews: formData.totalReviews
//           ? Number.parseInt(formData.totalReviews)
//           : 0,
//         priceRange: formData.priceRange,
//         deliveryTime: {
//           min: Number.parseInt(formData.deliveryTime.min) || 0,
//           max: Number.parseInt(formData.deliveryTime.max) || 0,
//         },
//         deliveryFee: Number.parseFloat(formData.deliveryFee) || 0,
//         minimumOrder: Number.parseFloat(formData.minimumOrder) || 0,
//         operatingHours: {},
//         featuredItems: formData.featuredItems
//           .filter((item) => item.name && item.price)
//           .map((item) => ({
//             name: item.name,
//             price: Number.parseFloat(item.price) || 0,
//             description: item.description,
//           })),
//         isActive: formData.isActive,
//         promotions: formData.promotions.filter((promo) => promo.trim() !== ""),
//       };

//       // Format operating hours to match JSON structure
//       Object.keys(formData.operatingHours).forEach((day) => {
//         if (
//           !formData.operatingHours[day].closed &&
//           formData.operatingHours[day].open &&
//           formData.operatingHours[day].close
//         ) {
//           formattedData.operatingHours[day] = {
//             open: formData.operatingHours[day].open,
//             close: formData.operatingHours[day].close,
//           };
//         }
//       });

//       console.log("[v0] Sending formatted data:", formattedData);

//       const response = await fetch("http://localhost:5000/api/restaurants", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authResult.token}`,
//         },
//         body: JSON.stringify(formattedData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         showToast("Restaurant added successfully!", "success");
//         setFormData({
//           name: "",
//           description: "",
//           owner: "",
//           cuisine: [],
//           address: {
//             street: "",
//             city: "",
//             state: "",
//             zipCode: "",
//             coordinates: { lat: "", lng: "" },
//           },
//           phone: "",
//           email: "",
//           rating: "",
//           totalReviews: "",
//           priceRange: "$",
//           deliveryTime: { min: "", max: "" },
//           deliveryFee: "",
//           minimumOrder: "",
//           operatingHours: {
//             monday: { open: "", close: "", closed: false },
//             tuesday: { open: "", close: "", closed: false },
//             wednesday: { open: "", close: "", closed: false },
//             thursday: { open: "", close: "", closed: false },
//             friday: { open: "", close: "", closed: false },
//             saturday: { open: "", close: "", closed: false },
//             sunday: { open: "", close: "", closed: false },
//           },
//           featuredItems: [{ name: "", price: "", description: "" }],
//           isActive: true,
//           promotions: [""],
//         });
//       } else {
//         const errorMessage =
//           response.status === 401
//             ? "Authentication failed."
//             : response.status === 403
//               ? "Access denied."
//               : data.message || "Failed to add restaurant.";
//         showToast(errorMessage);
//       }
//     } catch (error) {
//       showToast("Network error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     validateAdminAuth();
//   }, []);

//   // Optimized toast helper functions
//   const showToast = (message, type = "error") => {
//     setToast({ message, type });
//   };

//   const closeToast = () => {
//     setToast(null);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       {toast && (
//         <Toast message={toast.message} type={toast.type} onClose={closeToast} />
//       )}

//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">
//           Add New Restaurant
//         </h2>
//         <p className="text-gray-600">
//           Fill in the details to add a new restaurant to the system
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Basic Information */}
//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Basic Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Restaurant Name *
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter restaurant name"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="owner"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Owner Name *
//               </label>
//               <input
//                 type="text"
//                 id="owner"
//                 name="owner"
//                 value={formData.owner}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter owner name"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email *
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="restaurant@example.com"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="phone"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Phone *
//               </label>
//               <input
//                 type="tel"
//                 id="phone"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="+1 (555) 123-4567"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="priceRange"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Price Range *
//               </label>
//               <select
//                 id="priceRange"
//                 name="priceRange"
//                 value={formData.priceRange}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="$">Budget ($)</option>
//                 <option value="$$">Mid-range ($$)</option>
//                 <option value="$$$">Fine Dining ($$$)</option>
//                 <option value="$$$$">Michelin Star ($$$$)</option>
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="rating"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Rating (0-5)
//               </label>
//               <input
//                 type="number"
//                 id="rating"
//                 name="rating"
//                 value={formData.rating}
//                 onChange={handleInputChange}
//                 min="0"
//                 max="5"
//                 step="0.1"
//                 placeholder="4.5"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="totalReviews"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Total Reviews
//               </label>
//               <input
//                 type="number"
//                 id="totalReviews"
//                 name="totalReviews"
//                 value={formData.totalReviews}
//                 onChange={handleInputChange}
//                 min="0"
//                 placeholder="150"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           <div className="mt-4">
//             <label
//               htmlFor="description"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Description
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               rows="3"
//               placeholder="Brief description of the restaurant"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Cuisine Types */}
//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Cuisine Types
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//             {cuisineOptions.map((cuisine) => (
//               <label
//                 key={cuisine}
//                 className="flex items-center space-x-2 cursor-pointer"
//               >
//                 <input
//                   type="checkbox"
//                   checked={formData.cuisine.includes(cuisine)}
//                   onChange={() => handleCuisineChange(cuisine)}
//                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                 />
//                 <span className="text-sm text-gray-700">{cuisine}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Address */}
//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Address</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="md:col-span-2">
//               <label
//                 htmlFor="street"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Street Address *
//               </label>
//               <input
//                 type="text"
//                 id="street"
//                 name="street"
//                 value={formData.address.street}
//                 onChange={handleAddressChange}
//                 required
//                 placeholder="123 Main Street"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="city"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 City *
//               </label>
//               <input
//                 type="text"
//                 id="city"
//                 name="city"
//                 value={formData.address.city}
//                 onChange={handleAddressChange}
//                 required
//                 placeholder="New York"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="state"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 State *
//               </label>
//               <input
//                 type="text"
//                 id="state"
//                 name="state"
//                 value={formData.address.state}
//                 onChange={handleAddressChange}
//                 required
//                 placeholder="NY"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="zipCode"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 ZIP Code *
//               </label>
//               <input
//                 type="text"
//                 id="zipCode"
//                 name="zipCode"
//                 value={formData.address.zipCode}
//                 onChange={handleAddressChange}
//                 required
//                 placeholder="10001"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="lat"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Latitude
//               </label>
//               <input
//                 type="number"
//                 id="lat"
//                 name="lat"
//                 value={formData.address.coordinates.lat}
//                 onChange={handleCoordinatesChange}
//                 step="any"
//                 placeholder="40.7128"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="lng"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Longitude
//               </label>
//               <input
//                 type="number"
//                 id="lng"
//                 name="lng"
//                 value={formData.address.coordinates.lng}
//                 onChange={handleCoordinatesChange}
//                 step="any"
//                 placeholder="-74.0060"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Delivery Information */}
//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Delivery Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label
//                 htmlFor="deliveryTimeMin"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Min Delivery Time (minutes) *
//               </label>
//               <input
//                 type="number"
//                 id="deliveryTimeMin"
//                 name="deliveryTime.min"
//                 value={formData.deliveryTime.min}
//                 onChange={handleInputChange}
//                 required
//                 min="1"
//                 placeholder="30"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="deliveryTimeMax"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Max Delivery Time (minutes) *
//               </label>
//               <input
//                 type="number"
//                 id="deliveryTimeMax"
//                 name="deliveryTime.max"
//                 value={formData.deliveryTime.max}
//                 onChange={handleInputChange}
//                 required
//                 min="1"
//                 placeholder="45"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="deliveryFee"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Delivery Fee ($) *
//               </label>
//               <input
//                 type="number"
//                 id="deliveryFee"
//                 name="deliveryFee"
//                 value={formData.deliveryFee}
//                 onChange={handleInputChange}
//                 required
//                 min="0"
//                 step="0.01"
//                 placeholder="2.99"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="minimumOrder"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Minimum Order ($) *
//               </label>
//               <input
//                 type="number"
//                 id="minimumOrder"
//                 name="minimumOrder"
//                 value={formData.minimumOrder}
//                 onChange={handleInputChange}
//                 required
//                 min="0"
//                 step="0.01"
//                 placeholder="15.00"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Featured Items
//           </h3>
//           {formData.featuredItems.map((item, index) => (
//             <div key={index} className="bg-white p-4 rounded-md border mb-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Item Name
//                   </label>
//                   <input
//                     type="text"
//                     value={item.name}
//                     onChange={(e) =>
//                       handleFeaturedItemChange(index, "name", e.target.value)
//                     }
//                     placeholder="Dragon Roll"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Price ($)
//                   </label>
//                   <input
//                     type="number"
//                     value={item.price}
//                     onChange={(e) =>
//                       handleFeaturedItemChange(index, "price", e.target.value)
//                     }
//                     step="0.01"
//                     placeholder="18.50"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div className="flex items-end">
//                   <button
//                     type="button"
//                     onClick={() => removeFeaturedItem(index)}
//                     className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//               <div className="mt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   value={item.description}
//                   onChange={(e) =>
//                     handleFeaturedItemChange(
//                       index,
//                       "description",
//                       e.target.value
//                     )
//                   }
//                   placeholder="Eel, crab, cucumber topped with avocado"
//                   rows="2"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addFeaturedItem}
//             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Add Featured Item
//           </button>
//         </div>

//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Promotions
//           </h3>
//           {formData.promotions.map((promotion, index) => (
//             <div key={index} className="flex items-center space-x-2 mb-3">
//               <input
//                 type="text"
//                 value={promotion}
//                 onChange={(e) => handlePromotionChange(index, e.target.value)}
//                 placeholder="10% off first order"
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <button
//                 type="button"
//                 onClick={() => removePromotion(index)}
//                 className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addPromotion}
//             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Add Promotion
//           </button>
//         </div>

//         {/* Operating Hours */}
//         <div className="bg-gray-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">
//             Operating Hours
//           </h3>
//           <div className="space-y-4">
//             {Object.keys(formData.operatingHours).map((day) => (
//               <div
//                 key={day}
//                 className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-md border"
//               >
//                 <div className="flex items-center justify-between mb-2 sm:mb-0">
//                   <span className="font-medium text-gray-900 capitalize min-w-[100px]">
//                     {day.charAt(0).toUpperCase() + day.slice(1)}
//                   </span>
//                   <label className="flex items-center space-x-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={formData.operatingHours[day].closed}
//                       onChange={(e) =>
//                         handleOperatingHoursChange(
//                           day,
//                           "closed",
//                           e.target.checked
//                         )
//                       }
//                       className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
//                     />
//                     <span className="text-sm text-gray-600">Closed</span>
//                   </label>
//                 </div>
//                 {!formData.operatingHours[day].closed && (
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="time"
//                       value={formData.operatingHours[day].open}
//                       onChange={(e) =>
//                         handleOperatingHoursChange(day, "open", e.target.value)
//                       }
//                       className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     <span className="text-gray-500">to</span>
//                     <input
//                       type="time"
//                       value={formData.operatingHours[day].close}
//                       onChange={(e) =>
//                         handleOperatingHoursChange(day, "close", e.target.value)
//                       }
//                       className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <button
//             type="submit"
//             disabled={loading || !authStatus.isAdmin}
//             className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? "Adding Restaurant..." : "Add Restaurant"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddRestaurantForm;


"use client";

import { useState, useEffect } from "react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const AddRestaurantForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: [],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      coordinates: { lat: "", lng: "" },
    },
    phone: "",
    email: "",
    rating: "",
    totalReviews: "",
    priceRange: "$",
    deliveryTime: { min: "", max: "" },
    deliveryFee: "",
    minimumOrder: "",
    operatingHours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false },
    },
    featuredItems: [{ name: "", price: "", description: "" }],
    isActive: true,
    promotions: [""],
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  });
  const [uploading, setUploading] = useState(false);

  const cuisineOptions = [
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "American",
    "Thai",
    "Japanese",
    "Mediterranean",
    "French",
    "Korean",
    "Vietnamese",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleCoordinatesChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates: {
          ...prev.address.coordinates,
          [name]: value,
        },
      },
    }));
  };

  const handleCuisineChange = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter((c) => c !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleFeaturedItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      featuredItems: prev.featuredItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addFeaturedItem = () => {
    setFormData((prev) => ({
      ...prev,
      featuredItems: [
        ...prev.featuredItems,
        { name: "", price: "", description: "" },
      ],
    }));
  };

  const removeFeaturedItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      featuredItems: prev.featuredItems.filter((_, i) => i !== index),
    }));
  };

  const handlePromotionChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      promotions: prev.promotions.map((promo, i) =>
        i === index ? value : promo
      ),
    }));
  };

  const addPromotion = () => {
    setFormData((prev) => ({
      ...prev,
      promotions: [...prev.promotions, ""],
    }));
  };

  const removePromotion = (index) => {
    setFormData((prev) => ({
      ...prev,
      promotions: prev.promotions.filter((_, i) => i !== index),
    }));
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.value
    }));
  };

  // Handle file uploads
  // const handleImageUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setUploading(true);

  //   try {
  //     // For demo purposes, we'll create object URL instead of actually uploading
  //     // In a real app, you would upload to your server here
  //     const objectUrl = URL.createObjectURL(file);

  //     // Set the image URL in form data
  //     setFormData(prev => ({
  //       ...prev,
  //       image: objectUrl
  //     }));

  //     showToast("Image added successfully!", "success");
  //   } catch (error) {
  //     showToast("Error adding image");
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  // Handle file uploads
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Save file to localStorage with a unique key
      const fileKey = `restaurant_image_${Date.now()}`;

      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        // Save base64 data to localStorage
        localStorage.setItem(fileKey, event.target.result);

        // Set the image path in form data
        setFormData(prev => ({
          ...prev,
          image: fileKey // Store the key instead of object URL
        }));

        showToast("Image added successfully!", "success");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast("Error adding image");
      setUploading(false);
    }
  };

  // Remove the current image
  // const removeImage = () => {
  //   setFormData(prev => ({
  //     ...prev,
  //     image: ""
  //   }));
  // };

  // Remove the current image
  const removeImage = () => {
    // Remove from localStorage if it's a stored image
    if (formData.image && formData.image.startsWith('restaurant_image_')) {
      localStorage.removeItem(formData.image);
    }

    setFormData(prev => ({
      ...prev,
      image: ""
    }));
  };

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
        return { isValid: false, message: "Please log in to continue." };
      }

      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        const isAdmin = userData.user?.role === "admin";
        setAuthStatus({ isAuthenticated: true, isAdmin, user: userData.user });

        if (!isAdmin) {
          return { isValid: false, message: "Admin access required." };
        }
        return { isValid: true, token, user: userData.user };
      } else {
        setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
        return { isValid: false, message: "Authentication failed." };
      }
    } catch (error) {
      setAuthStatus({ isAuthenticated: false, isAdmin: false, user: null });
      return { isValid: false, message: "Network error occurred." };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authResult = await validateAdminAuth();
      if (!authResult.isValid) {
        showToast(authResult.message);
        setLoading(false);
        return;
      }
      // Get the actual image data if it's stored in localStorage
      let imageData = formData.image;
      if (formData.image && formData.image.startsWith('restaurant_image_')) {
        imageData = localStorage.getItem(formData.image);
      }


      // console.log("[v0] Admin authenticated:", authResult.user?.name);

      // Basic validation for required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.address.street ||
        !formData.address.city || !formData.address.state || !formData.address.zipCode) {
        showToast("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const formattedData = {
        name: formData.name,
        description: formData.description,
        cuisine: formData.cuisine,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          coordinates: {
            lat: formData.address.coordinates.lat
              ? Number.parseFloat(formData.address.coordinates.lat)
              : 0,
            lng: formData.address.coordinates.lng
              ? Number.parseFloat(formData.address.coordinates.lng)
              : 0,
          },
        },
        phone: formData.phone,
        email: formData.email,
        rating: formData.rating ? Number.parseFloat(formData.rating) : 0,
        totalReviews: formData.totalReviews
          ? Number.parseInt(formData.totalReviews)
          : 0,
        priceRange: formData.priceRange,
        deliveryTime: {
          min: Number.parseInt(formData.deliveryTime.min) || 0,
          max: Number.parseInt(formData.deliveryTime.max) || 0,
        },
        deliveryFee: Number.parseFloat(formData.deliveryFee) || 0,
        minimumOrder: Number.parseFloat(formData.minimumOrder) || 0,
        operatingHours: {},
        featuredItems: formData.featuredItems
          .filter((item) => item.name && item.price)
          .map((item) => ({
            name: item.name,
            price: Number.parseFloat(item.price) || 0,
            description: item.description,
          })),
        isActive: formData.isActive,
        promotions: formData.promotions.filter((promo) => promo.trim() !== ""),
        image: imageData,
      };

      // Format operating hours to match JSON structure
      Object.keys(formData.operatingHours).forEach((day) => {
        if (
          !formData.operatingHours[day].closed &&
          formData.operatingHours[day].open &&
          formData.operatingHours[day].close
        ) {
          formattedData.operatingHours[day] = {
            open: formData.operatingHours[day].open,
            close: formData.operatingHours[day].close,
          };
        }
      });

      console.log("[v0] Sending formatted data:", formattedData);

      const response = await fetch("http://localhost:5000/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authResult.token}`,
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Restaurant added successfully!", "success");
        // Clear form data
        setFormData({
          name: "",
          description: "",
          cuisine: [],
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            coordinates: { lat: "", lng: "" },
          },
          phone: "",
          email: "",
          rating: "",
          totalReviews: "",
          priceRange: "$",
          deliveryTime: { min: "", max: "" },
          deliveryFee: "",
          minimumOrder: "",
          operatingHours: {
            monday: { open: "", close: "", closed: false },
            tuesday: { open: "", close: "", closed: false },
            wednesday: { open: "", close: "", closed: false },
            thursday: { open: "", close: "", closed: false },
            friday: { open: "", close: "", closed: false },
            saturday: { open: "", close: "", closed: false },
            sunday: { open: "", close: "", closed: false },
          },
          featuredItems: [{ name: "", price: "", description: "" }],
          isActive: true,
          promotions: [""],
          image: "",
        });
      } else {
        // More detailed error handling
        let errorMessage = "Failed to add restaurant.";
        if (response.status === 400) {
          errorMessage = data.message || "Validation failed. Please check your input.";
          if (data.errors) {
            errorMessage += " " + data.errors.map(err => err.msg).join(", ");
          }
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "Access denied. Admin privileges required.";
        }
        showToast(errorMessage);
      }
    } catch (error) {
      showToast("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateAdminAuth();
    return () => {
      // Clean up any stored images if form is abandoned
      if (formData.image && formData.image.startsWith('restaurant_image_')) {
        localStorage.removeItem(formData.image);
      }
    };
  }, []);

  // Optimized toast helper functions
  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Add New Restaurant
        </h2>
        <p className="text-gray-600">
          Fill in the details to add a new restaurant to the system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Restaurant Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter restaurant name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="restaurant@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="priceRange"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price Range *
              </label>
              <select
                id="priceRange"
                name="priceRange"
                value={formData.priceRange}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="$">Budget ($)</option>
                <option value="$$">Mid-range ($$)</option>
                <option value="$$$">Fine Dining ($$$)</option>
                <option value="$$$$">Michelin Star ($$$$)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rating (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="totalReviews"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Reviews
              </label>
              <input
                type="number"
                id="totalReviews"
                name="totalReviews"
                value={formData.totalReviews}
                onChange={handleInputChange}
                min="0"
                placeholder="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Brief description of the restaurant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Cuisine Types */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Cuisine Types
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cuisineOptions.map((cuisine) => (
              <label
                key={cuisine}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.cuisine.includes(cuisine)}
                  onChange={() => handleCuisineChange(cuisine)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cuisine}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address *
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                required
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                required
                placeholder="New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                required
                placeholder="NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
                required
                placeholder="10001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="lat"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Latitude
              </label>
              <input
                type="number"
                id="lat"
                name="lat"
                value={formData.address.coordinates.lat}
                onChange={handleCoordinatesChange}
                step="any"
                placeholder="40.7128"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="lng"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Longitude
              </label>
              <input
                type="number"
                id="lng"
                name="lng"
                value={formData.address.coordinates.lng}
                onChange={handleCoordinatesChange}
                step="any"
                placeholder="-74.0060"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Delivery Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="deliveryTimeMin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Min Delivery Time (minutes) *
              </label>
              <input
                type="number"
                id="deliveryTimeMin"
                name="deliveryTime.min"
                value={formData.deliveryTime.min}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="deliveryTimeMax"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Delivery Time (minutes) *
              </label>
              <input
                type="number"
                id="deliveryTimeMax"
                name="deliveryTime.max"
                value={formData.deliveryTime.max}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="45"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="deliveryFee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Delivery Fee ($) *
              </label>
              <input
                type="number"
                id="deliveryFee"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="2.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="minimumOrder"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Minimum Order ($) *
              </label>
              <input
                type="number"
                id="minimumOrder"
                name="minimumOrder"
                value={formData.minimumOrder}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="15.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Restaurant Image */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Restaurant Image
          </h3>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Image URL
            </label>
            {/* <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={uploading || formData.image}
                />
              </label>
            </div>
            {uploading && <p className="mt-2 text-sm text-gray-500">Adding image...</p>} */}
          </div>

          {/* Image URL Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={formData.image}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>
          </div>
          {/* Preview Image */}
          {formData.image && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Preview Image</h4>
              <div className="relative inline-block">
                <img
                  src={formData.image.startsWith('restaurant_image_')
                    ? localStorage.getItem(formData.image)
                    : formData.image}
                  alt="Restaurant preview"
                  className="w-64 h-48 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Featured Items
          </h3>
          {formData.featuredItems.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-md border mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleFeaturedItemChange(index, "name", e.target.value)
                    }
                    placeholder="Dragon Roll"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleFeaturedItemChange(index, "price", e.target.value)
                    }
                    step="0.01"
                    placeholder="18.50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeFeaturedItem(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    handleFeaturedItemChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Eel, crab, cucumber topped with avocado"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeaturedItem}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Featured Item
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Promotions
          </h3>
          {formData.promotions.map((promotion, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={promotion}
                onChange={(e) => handlePromotionChange(index, e.target.value)}
                placeholder="10% off first order"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removePromotion(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPromotion}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Promotion
          </button>
        </div>

        {/* Operating Hours */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Operating Hours
          </h3>
          <div className="space-y-4">
            {Object.keys(formData.operatingHours).map((day) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-md border"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-0">
                  <span className="font-medium text-gray-900 capitalize min-w-[100px]">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.operatingHours[day].closed}
                      onChange={(e) =>
                        handleOperatingHoursChange(
                          day,
                          "closed",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>
                {!formData.operatingHours[day].closed && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={formData.operatingHours[day].open}
                      onChange={(e) =>
                        handleOperatingHoursChange(day, "open", e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.operatingHours[day].close}
                      onChange={(e) =>
                        handleOperatingHoursChange(day, "close", e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !authStatus.isAdmin}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Adding Restaurant..." : "Add Restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurantForm;
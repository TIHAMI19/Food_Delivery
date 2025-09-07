"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      coordinates: { lat: null, lng: null },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zipCode: data.address?.zipCode || "",
          coordinates: {
            lat: data.address?.coordinates?.lat || null,
            lng: data.address?.coordinates?.lng || null,
          },
        },
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // Ensure coordinates are valid numbers or null
      const lat =
        profile.address.coordinates.lat !== null &&
        !isNaN(profile.address.coordinates.lat)
          ? Number(profile.address.coordinates.lat)
          : null;
      const lng =
        profile.address.coordinates.lng !== null &&
        !isNaN(profile.address.coordinates.lng)
          ? Number(profile.address.coordinates.lng)
          : null;

      // Format data exactly as expected by backend (GeoJSON format)
      const profileData = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        address: {
          street: profile.address.street.trim(),
          city: profile.address.city.trim(),
          state: profile.address.state.trim(),
          zipCode: profile.address.zipCode.trim(),
        },
      };

      // Add coordinates in GeoJSON format if both lat and lng are valid
      if (lat !== null && lng !== null) {
        profileData.address.coordinates = {
          type: "Point",
          coordinates: [lng, lat], // Note: GeoJSON format is [longitude, latitude]
        };
      }

      const updatedUser = await authAPI.updateProfile(profileData);
      updateUser(updatedUser);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setProfile({
        ...profile,
        address: {
          ...profile.address,
          [addressField]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile({
            ...profile,
            address: {
              ...profile.address,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            },
          });
          setGettingLocation(false);
          setMessage("Location coordinates updated!");
        },
        (error) => {
          console.error("Error getting location:", error);
          setMessage(
            "Unable to get current location. Please enter coordinates manually."
          );
          setGettingLocation(false);
        }
      );
    } else {
      setMessage("Geolocation is not supported by this browser.");
      setGettingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Address Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address.street"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={profile.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address.city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={profile.address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address.state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={profile.address.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address.zipCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={profile.address.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="10001"
                  />
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      Location Coordinates
                    </h4>
                    <p className="text-xs text-gray-500">
                      Optional - for delivery location services
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gettingLocation ? "Getting..." : "Get Current Location"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="latitude"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Latitude
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      step="0.000001"
                      min="-90"
                      max="90"
                      value={
                        profile.address.coordinates.lat !== null
                          ? profile.address.coordinates.lat
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setProfile({
                          ...profile,
                          address: {
                            ...profile.address,
                            coordinates: {
                              ...profile.address.coordinates,
                              lat: value === "" ? null : parseFloat(value),
                            },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="40.7128"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: -90 to 90
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="longitude"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Longitude
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={
                        profile.address.coordinates.lng !== null
                          ? profile.address.coordinates.lng
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setProfile({
                          ...profile,
                          address: {
                            ...profile.address,
                            coordinates: {
                              ...profile.address.coordinates,
                              lng: value === "" ? null : parseFloat(value),
                            },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="-74.006"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: -180 to 180
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Role Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Role:</span>
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    {user?.role?.replace("_", " ").toUpperCase() || "USER"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <span className="ml-2 text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rider Info (if user is a rider) */}
            {user?.role === "rider" && user?.riderInfo && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Rider Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Vehicle Type:</span>
                    <span className="ml-2 text-gray-900">
                      {user.riderInfo.vehicleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vehicle Number:</span>
                    <span className="ml-2 text-gray-900">
                      {user.riderInfo.vehicleNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">License Number:</span>
                    <span className="ml-2 text-gray-900">
                      {user.riderInfo.licenseNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        user.riderInfo.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.riderInfo.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
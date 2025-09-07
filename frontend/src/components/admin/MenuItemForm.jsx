"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { FiX } from "react-icons/fi"

const MenuItemForm = ({ item, onSubmit, onCancel, isLoading }) => {
  const [selectedDietary, setSelectedDietary] = useState(item?.dietary || [])
  const [selectedAllergens, setSelectedAllergens] = useState(item?.allergens || [])
  const [imageUrl, setImageUrl] = useState(item?.image || "") // Add state for image URL

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch, // Added watch to monitor form values
  } = useForm({
    defaultValues: item || {
      name: "",
      description: "",
      price: "",
      category: "Main Course",
      preparationTime: 15,
      spiceLevel: "Mild",
      isAvailable: true,
      image: "",
    },
  })

  // Watch the image value to see what's being sent to the backend
  const formImageValue = watch("image");
  useEffect(() => {
    // console.log("Image value in form data:", formImageValue);
  }, [formImageValue]);

  const categories = [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Salads",
    "Soups",
    "Sides",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
  ]

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb", "Halal", "Kosher"]
  const allergenOptions = ["Nuts", "Dairy", "Gluten", "Soy", "Eggs", "Shellfish", "Fish", "Sesame"]
  const spiceLevels = ["Mild", "Medium", "Hot", "Extra Hot"]

  const handleDietaryToggle = (option) => {
    setSelectedDietary((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
  }

  const handleAllergenToggle = (option) => {
    setSelectedAllergens((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setValue("image", url, { shouldValidate: true }); 
  }

  const onFormSubmit = (data) => {
    // console.log("Submitting form data:", data); 
    
    // Ensure we're sending the current imageUrl, not a stale value
    const submitData = {
      ...data,
      price: Number.parseFloat(data.price),
      preparationTime: Number.parseInt(data.preparationTime),
      dietary: selectedDietary,
      allergens: selectedAllergens,
      image: imageUrl, // Use the current state value, not form data
    };
    
    onSubmit(submitData);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{item ? "Edit Menu Item" : "Add Menu Item"}</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Add Image URL Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a direct URL to the menu item image
            </p>
            {/* Hidden register field for react-hook-form */}
            <input type="hidden" {...register("image")} />
          </div>

          {/* Show image preview if URL is provided */}
          {imageUrl && (
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Menu item preview" 
                  className="w-32 h-32 object-cover rounded-md border"
                  onError={(e) => {
                    console.error("Image failed to load:", imageUrl);
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    // console.log("Image loaded successfully:", imageUrl);
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="input-field"
                placeholder="Enter item name"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price ($)</label>
              <input
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
              {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              {...register("description", { required: "Description is required" })}
              className="input-field"
              rows={3}
              placeholder="Describe the item"
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select {...register("category")} className="input-field">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prep Time (min)</label>
              <input
                {...register("preparationTime", {
                  required: "Preparation time is required",
                  min: { value: 5, message: "Minimum 5 minutes" },
                  max: { value: 60, message: "Maximum 60 minutes" },
                })}
                type="number"
                className="input-field"
              />
              {errors.preparationTime && (
                <p className="text-destructive text-sm mt-1">{errors.preparationTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Spice Level</label>
              <select {...register("spiceLevel")} className="input-field">
                {spiceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Dietary Options</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleDietaryToggle(option)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedDietary.includes(option)
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent/10"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Allergens</label>
            <div className="flex flex-wrap gap-2">
              {allergenOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAllergenToggle(option)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedAllergens.includes(option)
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground hover:bg-destructive/10"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input {...register("isAvailable")} type="checkbox" id="isAvailable" className="rounded" />
            <label htmlFor="isAvailable" className="text-sm font-medium text-foreground">
              Available for ordering
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? "Saving..." : item ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MenuItemForm
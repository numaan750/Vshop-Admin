"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [uploadingImage, setUploadingImage] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [product, setProduct] = useState({
    title: "",
    price: "",
    sale: false,
    description: "",
    category: "",
    images: [{ url: "", colour: "" }],
    colors: [{ name: "", hex: "" }],
    sizes: [{ label: "", price: "" }],
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const CLOUD_NAME = "dhtpqla2b";
  const UPLOAD_PRESET = "unsigned_preset";

  // API Functions
  const getCategories = async () => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching categories:", err);
      return { success: false, message: err.message };
    }
  };

  const getProducts = async () => {
    try {
      const res = await fetch(`${backendUrl}/productsmodel`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching products:", err);
      return { success: false, message: err.message };
    }
  };

  const createProduct = async (product) => {
    try {
      const res = await fetch(`${backendUrl}/productsmodel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error creating product:", err);
      return { success: false, message: err.message };
    }
  };

  const updateProduct = async (id, product) => {
    try {
      const res = await fetch(`${backendUrl}/productsmodel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error updating product:", err);
      return { success: false, message: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/productsmodel/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error deleting product:", err);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data.data || []);
    }
  };

  const loadProducts = async () => {
    const result = await getProducts();
    if (result.success) {
      setProducts(result.data || []);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ ...product, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...product.images];
    newImages[index][field] = value;
    setProduct({ ...product, images: newImages });

    if (field === "url") {
      setImagePreviews((prev) => ({ ...prev, [index]: value }));
    }
  };

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("upload_preset", UPLOAD_PRESET);

    try {
      setUploadingImage((prev) => ({ ...prev, [index]: true }));

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadForm,
        }
      );
      const data = await res.json();

      const newImages = [...product.images];
      newImages[index].url = data.secure_url;
      setProduct({ ...product, images: newImages });

      setImagePreviews((prev) => ({ ...prev, [index]: data.secure_url }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("❌ Image upload failed!");
    } finally {
      setUploadingImage((prev) => ({ ...prev, [index]: false }));
      e.target.value = "";
    }
  };

  const addImage = () => {
    setProduct({
      ...product,
      images: [...product.images, { url: "", colour: "" }],
    });
  };

  const removeImage = (index) => {
    const newImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: newImages });

    const newPreviews = { ...imagePreviews };
    delete newPreviews[index];
    setImagePreviews(newPreviews);
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...product.colors];
    newColors[index][field] = value;

    if (field === "name") {
      const colorName = value.trim().toLowerCase();

      // If name is cleared → remove hex too
      if (colorName === "") {
        newColors[index].hex = "";
      } else {
        // Try to get HEX from known or custom color
        const autoHex = getColorHex(colorName);
        newColors[index].hex = autoHex || "";
      }
    }

    setProduct({ ...product, colors: newColors });
  };

  // Helper: Convert color name to HEX automatically
  const getColorHex = (colorName) => {
    if (!colorName) return "";

    // Standardized color map (spelling-safe)
    const colors = {
      red: "#FF0000",
      green: "#008000",
      blue: "#0000FF",
      black: "#000000",
      white: "#FFFFFF",
      gray: "#808080",
      grey: "#808080", // added both spellings
      pink: "#FFC0CB",
      yellow: "#FFFF00",
      orange: "#FFA500",
      purple: "#800080",
      brown: "#A52A2A",
      beige: "#F5F5DC",
      navy: "#000080",
      teal: "#008080",
      maroon: "#800000",
      gold: "#FFD700",
      silver: "#C0C0C0",
    };

    const key = colorName.toLowerCase().trim();

    // ✅ 1. If it's a known color, return exact HEX
    if (colors[key]) return colors[key];

    // ✅ 2. If it's not in our list but is a valid CSS color name,
    // we’ll try to extract its computed color
    const temp = document.createElement("div");
    temp.style.color = key;
    document.body.appendChild(temp);

    const rgb = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);

    // Convert RGB → HEX if valid
    if (rgb.startsWith("rgb")) {
      const rgbValues = rgb.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const hex = `#${rgbValues
          .slice(0, 3)
          .map((n) => parseInt(n).toString(16).padStart(2, "0"))
          .join("")}`;
        return hex;
      }
    }

    // ✅ 3. If nothing found, generate random HEX
    const randomHex =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    return randomHex;
  };

  const addColor = () => {
    setProduct({
      ...product,
      colors: [...product.colors, { name: "", hex: "" }],
    });
  };

  const removeColor = (index) => {
    const newColors = product.colors.filter((_, i) => i !== index);
    setProduct({ ...product, colors: newColors });
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...product.sizes];
    newSizes[index][field] = value;
    setProduct({ ...product, sizes: newSizes });
  };

  const addSize = () => {
    setProduct({
      ...product,
      sizes: [...product.sizes, { label: "", price: "" }],
    });
  };

  const removeSize = (index) => {
    const newSizes = product.sizes.filter((_, i) => i !== index);
    setProduct({ ...product, sizes: newSizes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter valid colors
    const validColors = product.colors.filter((c) => c.name && c.hex);

    // Validate images - only require URL
    const validImages = product.images.filter((img) => img.url.trim());

    if (validImages.length === 0) {
      toast.error("❌ Please add at least one image!");
      return;
    }

    // Process images: keep colour only if it's valid, otherwise remove it completely
    const processedImages = validImages.map((img) => {
      const imageData = { url: img.url };

      // Only add colour field if it exists and matches a valid color
      if (img.colour && validColors.find((c) => c._id === img.colour)) {
        imageData.colour = img.colour;
      }

      return imageData;
    });

    const payload = {
      title: product.title.trim(),
      price: Number(product.price),
      sale: product.sale,
      description: product.description.trim(),
      category: product.category || null,
      colors: validColors,
      images: processedImages,
      sizes: product.sizes
        .filter((s) => s.label && s.price !== "")
        .map((s) => ({ label: s.label, price: Number(s.price) })),
    };

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct._id, payload);
      } else {
        result = await createProduct(payload);
      }

      if (result.success) {
        toast.success(
          editingProduct
            ? "✅ Product updated successfully!"
            : "✅ Product added successfully!"
        );
        resetForm();
        setShowModal(false);
        loadProducts();
      } else {
        toast.error("❌ " + result.message);
      }
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  const handleEdit = (prod) => {
    setProduct({
      title: prod.title,
      price: prod.price,
      sale: prod.sale,
      description: prod.description,
      category: prod.category?._id || "",
      colors:
        prod.colors && prod.colors.length > 0
          ? prod.colors.map((c) => ({ ...c, _id: c._id }))
          : [{ name: "", hex: "" }],
      images:
        prod.images && prod.images.length > 0
          ? prod.images.map((img) => ({
              url: img.url || "",
              colour: img.colour?._id || img.colour || "",
            }))
          : [{ url: "", colour: "" }],
      sizes: prod.sizes || [{ label: "", price: "" }],
    });
    setEditingProduct(prod);
    setShowModal(true);

    const previews = {};
    if (prod.images && prod.images.length > 0) {
      prod.images.forEach((img, idx) => {
        previews[idx] = img.url;
      });
    }
    setImagePreviews(previews);
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>🗑️ Are you sure you want to delete this product?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const result = await deleteProduct(id);
              if (result.success) {
                toast.success("✅ Product deleted!");
                loadProducts();
              } else {
                toast.error("❌ " + result.message);
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
          >
            No
          </button>
        </div>
      </div>
    ));
    return;
    const result = await deleteProduct(id);
    if (result.success) {
      alert("✅ Product deleted!");
      loadProducts();
    } else {
      alert("❌ " + result.message);
    }
  };

  const resetForm = () => {
    setProduct({
      title: "",
      price: "",
      sale: false,
      description: "",
      category: "",
      images: [{ url: "", colour: "" }],
      colors: [{ name: "", hex: "" }],
      sizes: [{ label: "", price: "" }],
    });
    setEditingProduct(null);
    setUploadingImage({});
    setImagePreviews({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleColorClick = (productId, colorId) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: colorId }));
  };

  const getImageByColor = (prod, colorId) => {
    if (!prod.images || prod.images.length === 0) return null;

    // Try direct match (for DB _id or plain string)
    const match = prod.images.find((img) => {
      const imgColorId =
        typeof img.colour === "object" ? img.colour?._id : img.colour;
      return imgColorId === colorId;
    });

    if (match) return match;

    // Try index-based match (for new unsaved products)
    const colorIndex = prod.colors?.findIndex((c) => c._id === colorId);

    if (colorIndex !== -1) {
      const localMatch = prod.images.find(
        (img) => img.colour === `color-${colorIndex}`
      );
      if (localMatch) return localMatch;
    }

    // Default fallback
    return prod.images[0];
  };

  const getCategoryDisplay = (categoryData) => {
    if (!categoryData) {
      return {
        name: "Uncategorized",
        colorClass: "bg-gray-100 text-gray-600",
      };
    }
    return {
      name: categoryData.name,
      colorClass: "bg-indigo-100 text-indigo-700",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Product Management
              </h1>
              <p className="text-slate-600 mt-1.5">
                Manage your inventory efficiently
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 text-white px-6 py-3 rounded-lg">
                <div className="text-sm text-slate-400">Total Products</div>
                <div className="text-2xl font-bold">{products.length}</div>
              </div>
              {products.length > 0 && (
                <button
                  onClick={openCreateModal}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  + Create New Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              {/* <div className="text-slate-300 text-8xl mb-6">📦</div> */}
              <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
              <p className="text-slate-600 mb-8">
                Start by creating your first product
              </p>
              <button
                onClick={openCreateModal}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all"
              >
                + Create New Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const categoryDisplay = getCategoryDisplay(prod.category);
              const selectedColorId = selectedColors[prod._id];
              const displayImage = selectedColorId
                ? getImageByColor(prod, selectedColorId)
                : prod.images?.[0] || null;

              return (
                <div
                  key={prod._id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all"
                >
                  {/* Product Image */}
                  {displayImage?.url && (
                    <div className="relative h-80 bg-slate-100 group">
                      <img
                        src={displayImage.url}
                        alt={prod.title}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="flex items-center justify-center h-full text-slate-400 text-6xl">📦</div>';
                        }}
                      />

                      {/* Sale Badge */}
                      {prod.sale && (
                        <span className="absolute top-3 right-3 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md font-medium shadow-lg">
                          SALE
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-xl text-slate-900 flex-1">
                        {prod.title}
                      </h3>
                      {!displayImage?.url && prod.sale && (
                        <span className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md font-medium">
                          SALE
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${categoryDisplay.colorClass}`}
                      >
                        {categoryDisplay.name}
                      </span>
                    </div>

                    <p className="text-3xl font-bold text-slate-900 mb-3">
                      Rs. {prod.price}
                    </p>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Color Selection Buttons */}
                    {prod.colors && prod.colors.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-medium text-slate-700 mb-2">
                          Available Colors:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {prod.colors.map((color) => (
                            <button
                              key={color._id}
                              onClick={() =>
                                handleColorClick(prod._id, color._id)
                              }
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                                selectedColors[prod._id] === color._id
                                  ? "border-slate-900 bg-slate-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                              title={color.name}
                            >
                              <div
                                className="w-5 h-5 rounded border border-slate-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs font-medium text-slate-700">
                                {color.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-md font-medium">
                        {prod.colors?.length || 0} Colors
                      </div>
                      <div className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-md font-medium">
                        {prod.sizes?.length || 0} Sizes
                      </div>
                      <div className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-md font-medium">
                        {prod.images?.length || 0} Images
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="flex-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Product Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter product name"
                      value={product.title}
                      onChange={handleChange}
                      required
                      className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category{" "}
                      <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <select
                      name="category"
                      value={product.category || ""}
                      onChange={handleChange}
                      className="border border-gray-300 bg-white text-black rounded-md px-3 py-2 w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="text-gray-500">
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id}
                          value={cat._id}
                          className="text-black"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <p className="text-xs text-slate-500 mt-1">
                      If no category is selected, product will show as
                      "Uncategorized"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Price (Rs)
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="1999"
                        value={product.price}
                        onChange={handleChange}
                        required
                        className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status
                      </label>
                      <div className="flex items-center h-[42px] bg-slate-50 rounded-lg px-4 border border-slate-200">
                        <input
                          type="checkbox"
                          name="sale"
                          checked={product.sale}
                          onChange={handleChange}
                          className="h-4 w-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
                        />
                        <label className="text-sm text-slate-700 ml-2 font-medium">
                          On Sale
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe your product..."
                      value={product.description}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Available Colors{" "}
                    <span className="text-slate-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Add colors to allow color-specific images. You can also add
                    images without colors.
                  </p>
                  <div className="space-y-2">
                    {product.colors.map((color, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Color name (e.g., Red)"
                          value={color.name}
                          onChange={(e) =>
                            handleColorChange(index, "name", e.target.value)
                          }
                          className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="#hex (e.g., #FF0000)"
                          value={color.hex}
                          onChange={(e) =>
                            handleColorChange(index, "hex", e.target.value)
                          }
                          className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        {color.hex && (
                          <div
                            className="w-10 rounded-lg border-2 border-slate-300"
                            style={{ backgroundColor: color.hex }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg transition-all text-sm font-medium border border-slate-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addColor}
                    className="mt-3 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
                  >
                    + Add Color
                  </button>
                </div>

                {/* Images with Color */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Product Images
                  </label>
                  <div className="space-y-4">
                    {product.images.map((img, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex gap-2">
                          <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all whitespace-nowrap">
                            {uploadingImage[index] ? "Uploading..." : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, index)}
                              disabled={uploadingImage[index]}
                            />
                          </label>
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) =>
                              handleImageChange(index, "url", e.target.value)
                            }
                            placeholder="Or paste image URL"
                            className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg transition-all text-sm font-medium border border-slate-200"
                          >
                            Remove
                          </button>
                        </div>

                        {product.colors.filter((c) => c.name && c.hex).length >
                          0 && (
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                              Link to Color{" "}
                              <span className="text-slate-400">(Optional)</span>
                            </label>
                            <select
                              value={img.colour}
                              onChange={(e) =>
                                handleImageChange(
                                  index,
                                  "colour",
                                  e.target.value
                                )
                              }
                              className="border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                              <option value="">No color (general image)</option>
                              {product.colors
                                .filter((c) => c.name && c.hex)
                                .map((color, idx) => (
                                  <option
                                    key={idx}
                                    value={color._id || `color-${idx}`}
                                  >
                                    {color.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {(imagePreviews[index] || img.url) && (
                          <img
                            src={imagePreviews[index] || img.url}
                            alt={`Preview ${index + 1}`}
                            className="w-32 h-32 object-cover border-2 border-slate-200 rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addImage}
                    className="mt-3 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
                  >
                    + Add Image
                  </button>
                </div>

                {/* Sizes */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Size Variants{" "}
                    <span className="text-slate-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {product.sizes.map((size, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Size (S, M, L)"
                          value={size.label}
                          onChange={(e) =>
                            handleSizeChange(index, "label", e.target.value)
                          }
                          className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={size.price}
                          onChange={(e) =>
                            handleSizeChange(index, "price", e.target.value)
                          }
                          className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg transition-all text-sm font-medium border border-slate-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSize}
                    className="mt-3 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
                  >
                    + Add Size
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;

"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState({
    name: "",
    key: "",
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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

  const createCategory = async (category) => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("Error creating category:", err);
      return { success: false, message: err.message };
    }
  };

  const updateCategory = async (id, category) => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("Error updating category:", err);
      return { success: false, message: err.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("Error deleting category:", err);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success) {
      const cats = Array.isArray(result.data.data)
        ? result.data.data
        : Array.isArray(result.data)
        ? result.data
        : [];
      setCategories(cats);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory({ ...category, [name]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      name: category.name.trim(),
      key: category.key.trim(),
    };

    if (!payload.name || !payload.key) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory._id, payload);
      } else {
        result = await createCategory(payload);
      }

      if (result.success) {
        toast.success(
          editingCategory ? "Category updated!" : "Category added!"
        );
        resetForm();
        setShowModal(false);
        loadCategories();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEdit = (cat) => {
    setCategory({
      name: cat.name,
      key: cat.key,
    });
    setEditingCategory(cat);
    setShowModal(true);
  };

  const confirmDeleteToast = (id) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } bg-white shadow-lg rounded-lg p-4 border border-gray-200 w-full max-w-sm`}
      >
        <p className="text-gray-800 font-medium mb-3">
          ⚠️ Are you sure you want to delete this category?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const result = await deleteCategory(id);
              if (result.success) {
                toast.success("Category deleted!");
                loadCategories();
              } else {
                toast.error(result.message || "Failed to delete category");
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };
  const handleDelete = async (id) => {
    const result = await deleteCategory(id);
    if (result.success) {
      alert("✅ Category deleted!");
      loadCategories();
    } else {
      alert("❌ " + result.message);
    }
  };

  const resetForm = () => {
    setCategory({
      name: "",
      key: "",
    });
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Category Management
              </h1>
              <p className="text-gray-600 mt-1.5">
                Organize your products with categories
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
                <div className="text-sm text-indigo-200">Total Categories</div>
                <div className="text-2xl font-bold">{categories.length}</div>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
              >
                + Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {categories.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-gray-300 text-8xl mb-6">📁</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No categories yet
              </h2>
              <p className="text-gray-600 mb-8">
                Start by creating your first category
              </p>
              <button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all"
              >
                + Add Category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories?.map((cat) => (
              <div
                key={cat._id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {cat.name}
                </h3>

                <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-md font-mono mb-4 inline-block">
                  {cat.key}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteToast(cat._id)}
                    className="flex-1 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter category name"
                    value={category.name}
                    onChange={handleChange}
                    className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Key
                  </label>
                  <input
                    type="text"
                    name="key"
                    placeholder="category-key"
                    value={category.key}
                    onChange={handleChange}
                    className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for internal reference.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  {editingCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;

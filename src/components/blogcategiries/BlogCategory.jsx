"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, FolderOpen } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAppContext } from "@/context/Appcontext";

const BlogCategoryAdmin = () => { 

  const { getblogcategory, createBlogCategory, updateBlogCategory, deleteBlogCategory } = useAppContext();
  
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // ✅ YAHAN CHANGES HAIN - Lines 26-50
  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getblogcategory();
      
      // 🔍 DEBUG: Console mein dekho kya aa raha hai
      console.log("API Response:", data);
      console.log("data.success:", data.success);
      console.log("data.data:", data.data);
      
      // ✅ CHANGE 1: Different response formats handle karo
      if (data.success === false) {
        setError(data.message || "Failed to load categories");
        setCategories([]);
      } else if (Array.isArray(data)) {
        // Agar direct array aaye
        setCategories(data);
      } else if (data.success && Array.isArray(data.data)) {
        // Agar {success: true, data: [...]} format ho
        setCategories(data.data);
      } else {
        setCategories([]);
      }
      
      console.log("Final Categories Set:", categories);
    } catch (err) {
      console.error("Catch Error:", err);
      setError("Failed to fetch categories");
      setCategories([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "name" && !editingCategory) {
      const key = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        name: value,
        key: key
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ✅ YAHAN CHANGES HAIN - Lines 86-115
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.key.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      let result;
      if (editingCategory) {
        result = await updateBlogCategory(editingCategory._id, formData);
      } else {
        result = await createBlogCategory(formData);
      }

      // 🔍 DEBUG: Console check
      console.log("Submit Result:", result);

      // ✅ CHANGE 2: Result ko properly check karo
      if (result.success === false) {
        toast.error(result.message || "Error occurred");
        setSubmitting(false);
        return;
      }

      // Success case
      await loadCategories();
      resetForm();
      toast.success(
        editingCategory
          ? "Category successfully updated!"
          : "Category successfully created!"
      );
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.message || "Something went wrong");
    }
    setSubmitting(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      key: category.key,
    });
    setShowForm(true);
  };

  // ✅ YAHAN CHANGES HAIN - Lines 142-170
  const handleDelete = async (categoryId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">
            Kya aap is category ko delete karna chahte hain?
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const result = await deleteBlogCategory(categoryId);
                  
                  // 🔍 DEBUG: Console check
                  console.log("Delete Result:", result);
                  
                  // ✅ CHANGE 3: Delete result check
                  if (result.success === false) {
                    toast.error(result.message || "Category delete nahi ho saki");
                    return;
                  }

                  await loadCategories();
                  toast.success("Category successfully deleted!");
                } catch (error) {
                  console.error("Delete Error:", error);
                  toast.error(
                    "Category delete karte waqt error aaya: " + error.message
                  );
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-700"
            >
              Yes, Delete
            </button>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded cursor-pointer hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      key: "",
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Category Management</h1>
            <p className="text-gray-600 mt-1">Manage your blog categories</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Technology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Key (URL Slug)
                  </label>
                  <input
                    type="text"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., technology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from name. Use lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Processing..."
                      : editingCategory
                      ? "Update Category"
                      : "Add Category"}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={submitting}
                    className="flex-1 cursor-pointer bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadCategories}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first category to get started
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key (Slug)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FolderOpen className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {category.key}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-yellow-600 hover:text-yellow-900 mr-4 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Total Categories: <span className="font-semibold">{categories.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCategoryAdmin;
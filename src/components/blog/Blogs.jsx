"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Image, Upload } from "lucide-react";
import { useAppContext } from "@/context/Appcontext";
import { toast } from "react-hot-toast";

const CLOUD_NAME = "dhtpqla2b"; // Replace with your Cloudinary cloud name
const UPLOAD_PRESET = "unsigned_preset"; // Replace with your upload preset

const BlogAdminPanel = () => {
  const { getblogs, createblog, updateblog, deleteblog, getblogcategory } =
    useAppContext();
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    minheading: "",
    category: "",
    img: "",
    qoutes: "",
    sections: [{ heading: "", paragraph: "" }],
  });

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getblogcategory();
        if (Array.isArray(data)) setCategories(data);
        else if (data.success && Array.isArray(data.data))
          setCategories(data.data);
        else setCategories([]);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getblogs();
      if (data.success === false) {
        setError(data.message);
        setBlogs([]);
      } else {
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError("Failed to fetch blogs");
      setBlogs([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, { heading: "", paragraph: "" }],
    }));
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("upload_preset", UPLOAD_PRESET);

    try {
      setUploadingImage(true);
      toast.loading("Uploading image...", { id: "upload" });

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadForm,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setFormData((prev) => ({ ...prev, img: data.secure_url }));

      toast.success("Image uploaded successfully!", { id: "upload" });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed!", { id: "upload" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const blogData = {
      ...formData,
      sections: formData.sections.filter(
        (item) => item.heading.trim() !== "" || item.paragraph.trim() !== ""
      ),
    };

    try {
      let result;
      if (editingBlog) {
        result = await updateblog(editingBlog._id, blogData);
      } else {
        result = await createblog(blogData);
      }

      if (result.success === false) {
        toast.error(result.message || "Error occurred");
        setSubmitting(false);
        return;
      }

      await loadBlogs();
      resetForm();
      toast.success(
        editingBlog
          ? "Blog successfully updated!"
          : "Blog successfully created!"
      );
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    }
    setSubmitting(false);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      minheading: blog.minheading,
      category:
        typeof blog.category === "object" ? blog.category._id : blog.category,
      img: blog.img,
      qoutes: blog.qoutes,
      sections:
        blog.sections && blog.sections.length > 0
          ? blog.sections
          : [{ heading: "", paragraph: "" }],
    });
    setShowForm(true);
  };

  const handleDelete = async (blogId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">
            Kya aap is blog ko delete karna chahte hain?
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const result = await deleteblog(blogId);

                  if (result.success === false) {
                    toast.error(result.message || "Blog delete nahi ho saka");
                    return;
                  }

                  await loadBlogs();
                  toast.success("Blog successfully deleted!");
                } catch (error) {
                  toast.error(
                    "Blog delete karte waqt error aaya: " + error.message
                  );
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Yes, Delete
            </button>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
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
      minheading: "",
      category: "",
      img: "",
      qoutes: "",
      sections: [{ heading: "", paragraph: "" }],
    });
    setEditingBlog(null);
    setShowForm(false);
  };

  // ✅ Helper function to get category name
  const getCategoryName = (blog) => {
    if (!blog.category) return "Unknown";

    // Agar category already object hai (populated)
    if (typeof blog.category === "object" && blog.category.name) {
      return blog.category.name;
    }

    // Agar category sirf ID hai to categories array se dhundo
    const categoryId =
      typeof blog.category === "object" ? blog.category._id : blog.category;
    const foundCategory = categories.find((cat) => cat._id === categoryId);
    return foundCategory?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Admin Panel</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center cursor-pointer gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Naya Blog Add Karein
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBlog ? "Blog Edit Karein" : "Naya Blog Add Karein"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Heading
                  </label>
                  <input
                    type="text"
                    name="minheading"
                    value={formData.minheading}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Image
                  </label>
                  <div className="flex gap-2">
                    <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2">
                      <Upload size={16} />
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    <input
                      type="text"
                      name="img"
                      value={formData.img}
                      onChange={handleInputChange}
                      placeholder="Or paste image URL"
                      className="border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {formData.img && (
                    <div className="mt-3">
                      <img
                        src={formData.img}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="18" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote
                  </label>
                  <textarea
                    name="qoutes"
                    value={formData.qoutes}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Blog Sections (Heading + Paragraph)
                    </label>
                    <button
                      type="button"
                      onClick={addSection}
                      className="text-sm cursor-pointer bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      + Add Section
                    </button>
                  </div>

                  {formData.sections.map((section, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          Section {index + 1}
                        </span>
                        {formData.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Heading
                          </label>
                          <input
                            type="text"
                            value={section.heading}
                            onChange={(e) =>
                              handleSectionChange(
                                index,
                                "heading",
                                e.target.value
                              )
                            }
                            placeholder="Enter heading"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Paragraph
                          </label>
                          <textarea
                            value={section.paragraph}
                            onChange={(e) =>
                              handleSectionChange(
                                index,
                                "paragraph",
                                e.target.value
                              )
                            }
                            placeholder="Enter paragraph"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploadingImage}
                  className="flex-1 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Processing..."
                    : editingBlog
                    ? "Update Blog"
                    : "Save Blog"}
                </button>
                <button
                  onClick={resetForm}
                  disabled={submitting || uploadingImage}
                  className="flex-1 cursor-pointer bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadBlogs}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <Image size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Koi blog nahi hai
            </h3>
            <p className="text-gray-500 mb-4">
              Apna pehla blog add karne ke liye upar button click karein
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {blog.img && (
                  <img
                    src={blog.img}
                    alt={blog.minheading}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="18" fill="%239ca3af" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getCategoryName(blog)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {blog.minheading}
                  </h3>
                  <p className="text-sm text-gray-600 italic mb-3 line-clamp-2">
                    "{blog.qoutes}"
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    {blog.sections?.length || 0} Sections
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAdminPanel;

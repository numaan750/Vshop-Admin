import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  FileText,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";


const Shipping = () => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    isActive: true,
  });

  const backendUrl = "https://velora-website-backend.vercel.app/api";

  const fetchShippingMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/shippingmodel`);
      const data = await res.json();
      setShippingMethods(data);
    } catch (err) {
      console.error("Error fetching shipping methods:", err);
      alert("Failed to load shipping methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.description) {
  toast.error('Please fill all required fields', {
    style: { borderRadius: '10px', background: '#f56565', color: '#fff' },
    icon: '❌',
  }); // <-- alert ki jagah
  return;
}

    setLoading(true);
    try {
      const url = editingId
        ? `${backendUrl}/shippingmodel/${editingId}`
        : `${backendUrl}/shippingmodel`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          duration: 0,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (editingId) {
          setShippingMethods((prev) =>
            prev.map((item) => (item._id === editingId ? data : item))
          );
          toast.success("Shipping method updated successfully!", {
            style: { borderRadius: "10px", background: "#333", color: "#fff" },
            icon: "✏️",
          }); // <-- ye line alert ki jagah
        } else {
          setShippingMethods((prev) => [...prev, data]);
          toast.success("Shipping method created successfully!", {
            style: { borderRadius: "10px", background: "#333", color: "#fff" },
            icon: "📦",
          }); // <-- ye line alert ki jagah
        }
        resetForm();
      } else {
        toast.error(data.message || "Operation failed", {
          style: { borderRadius: "10px", background: "#f56565", color: "#fff" },
          icon: "❌",
        }); // <-- ye line alert ki jagah
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error saving shipping method");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this shipping method?"))
      return;

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/shippingmodel/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShippingMethods((prev) => prev.filter((item) => item._id !== id));
        toast.success("Shipping method deleted successfully!", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
          icon: "🗑️",
        }); // <-- alert ki jagah
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete shipping method", {
          style: { borderRadius: "10px", background: "#f56565", color: "#fff" },
          icon: "❌",
        }); // <-- alert ki jagah
      }
    } catch (err) {
      console.error("Error deleting shipping:", err);
      alert("Error deleting shipping method");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shipping) => {
    setFormData({
      name: shipping.name,
      price: shipping.price,
      description: shipping.description,
      isActive: shipping.isActive,
    });
    setEditingId(shipping._id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      isActive: true,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <Toaster position="top-right" /> {/* <-- Add this */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Truck className="w-7 h-7 text-gray-700" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Shipping Methods
              </h1>
              <p className="text-sm text-gray-600">Manage delivery options</p>
            </div>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Method
          </button>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-900 p-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingId ? "Edit Method" : "New Method"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-gray-300 p-1.5 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Method Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Express Delivery"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the shipping method..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
  type="checkbox"
  name="isActive"
  checked={formData.isActive ?? false} // <- warning fix ho gaya
  onChange={handleChange}
  className="w-4 h-4 text-gray-900 rounded"
/>
                  <label className="text-sm font-medium text-gray-700">
                    Active (Available for customers)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {loading ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Methods List */}
        {loading && shippingMethods.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          </div>
        ) : shippingMethods.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No Methods Yet
            </h3>
            <p className="text-sm text-gray-600">
              Create your first shipping method
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shippingMethods.map((shipping) => (
              <div
                key={shipping._id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Truck className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {shipping.name}
                      </h3>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${
                          shipping.isActive
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {shipping.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-base font-semibold text-gray-900 ml-auto">
                        Rs. {shipping.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
                      <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block mb-1">
                          Description:
                        </span>
                        <p className="text-sm text-gray-700">
                          {shipping.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(shipping)}
                      className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shipping._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default Shipping;

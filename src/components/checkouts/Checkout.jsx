"use client";
import React, { useState, useEffect } from "react";
import { Eye, Package, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Checkout = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10); // items per page
  const [showNewOrders, setShowNewOrders] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newOrders, setNewOrders] = useState([]); // ✅ Separate state for new orders

  const backendUrl = "https://velora-website-backend.vercel.app/api";

  // ✅ Fetch orders with pagination and status filter
  const fetchOrders = async (page = 1, status = "all") => {
    setLoading(true);
    try {
      let url = `${backendUrl}/paginated?page=${page}&limit=${limit}`;
      
      // Add status filter if not "all"
      if (status !== "all") {
        url += `&status=${status}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      setOrders(data.data || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("❌ Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
    fetchNewOrdersCount(); // ✅ Fetch new orders count on load
  }, [currentPage, statusFilter]);

  // ✅ Fetch count of new orders (created in last 24 hours AND pending status)
  const fetchNewOrdersCount = async () => {
    try {
      const res = await fetch(`${backendUrl}/new-orders`);
      const data = await res.json();
      
      // Filter and count only pending orders
      const pendingNewOrders = (data.orders || []).filter(order => order.status === "pending");
      setNewOrdersCount(pendingNewOrders.length);
    } catch (err) {
      console.error("Error fetching new orders count:", err);
    }
  };

  // ✅ Fetch new orders list (last 24 hours + only pending status)
  const fetchNewOrders = async () => {
    try {
      const res = await fetch(`${backendUrl}/new-orders`);
      const data = await res.json();
      console.log("New Orders:", data); // Debug

      // Filter: only show orders that are still "pending"
      const pendingNewOrders = (data.orders || []).filter(order => order.status === "pending");
      setNewOrders(pendingNewOrders);
    } catch (err) {
      console.error("Error fetching new orders:", err);
    }
  };

  // Update order status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${backendUrl}/checkoutmodel/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`✅ Status updated to ${newStatus}`);
        fetchOrders(currentPage, statusFilter); // Refresh current page
        fetchNewOrdersCount(); // Update new orders count
      } else {
        toast.error(data.message || "❌ Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  // View order details
  const viewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // ✅ Filter orders by status (client-side filtering on paginated data)
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") {
      return true;
    }
    return order.status === statusFilter;
  });

  // ✅ Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // ✅ Filter button handler - reset to page 1 when filter changes
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when changing filter
    setShowNewOrders(false); // Hide new orders dropdown when changing filter
  };

  // ✅ Toggle new orders dropdown
  const toggleNewOrders = () => {
    if (!showNewOrders) {
      // Dropdown open ho raha hai → latest orders fetch karo
      fetchNewOrders();
    } else {
      // Dropdown close ho raha hai → list clear karo
      setNewOrders([]);
    }
    setShowNewOrders(!showNewOrders);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              📦 Checkout Orders Management
            </h1>
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm text-gray-600">
                Total Orders: <span className="font-semibold">{total}</span>
              </div>
              
              {/* ✅ New Orders Button */}
              <div className="relative">
                <button
                  onClick={toggleNewOrders}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer font-semibold text-sm"
                >
                  🆕 New Orders
                  {newOrdersCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {newOrdersCount}
                    </span>
                  )}
                  <span className={`transition-transform ${showNewOrders ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* ✅ New Orders Dropdown */}
                {showNewOrders && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl border-2 border-green-200 z-50 max-h-[32rem] overflow-hidden">
                    {/* Header with gradient */}
                    <div className="p-4 border-b-2 border-green-200 bg-gradient-to-r from-green-500 to-emerald-500">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                          <span className="text-2xl">🔔</span>
                          Recent Orders
                        </h3>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                          Last 24h
                        </span>
                      </div>
                    </div>
                    
                    {/* Orders List */}
                    <div className="p-3 overflow-y-auto max-h-[28rem] custom-scrollbar">
                      {newOrders.length > 0 ? (
                        newOrders.map((order, index) => (
                          <div
                            key={order._id}
                            onClick={() => {
                              viewDetails(order);
                              setShowNewOrders(false);
                            }}
                            className="mb-3 p-4 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl cursor-pointer border-2 border-gray-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                  </span>
                                  <p className="font-bold text-gray-800 text-base group-hover:text-green-600 transition-colors">
                                    {order.firstname} {order.lastname}
                                  </p>
                                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                    NEW
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-2 py-1 rounded ml-8">
                                  #{order._id.slice(-8)}
                                </p>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
                              <div className="flex items-center gap-1 text-gray-700 font-semibold">
                                <Package className="w-3 h-3" />
                                <span>{order.products.length} item(s)</span>
                              </div>
                              <span className="text-gray-600 font-medium">
                                {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm font-medium">No new pending orders in the last 24 hours</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {["all", "pending", "delivered", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 cursor-pointer py-2 rounded-lg font-semibold transition ${
                  statusFilter === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No orders found</p>
          </div>
        ) : (
          <>
            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Products
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    // ✅ Check if order is new (created in last 24 hours AND still pending)
                    const isNewOrder = (() => {
                      const orderDate = new Date(order.createdAt);
                      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      return orderDate > oneDayAgo && order.status === "pending";
                    })();

                    return (
                    <tr key={order._id} className={`border-b hover:bg-gray-50 transition ${isNewOrder ? 'bg-green-50/30' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-800 font-mono">
                        <div className="flex items-center gap-2">
                          #{order._id.slice(-6)}
                          {isNewOrder && (
                            <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {order.firstname} {order.lastname}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.products.length} item(s)
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => viewDetails(order)}
                            className="p-2 cursor-pointer bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === "pending" && (
                            <button
                              onClick={() => updateStatus(order._id, "delivered")}
                              className="p-2 cursor-pointer bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} orders
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>Name:</strong> {selectedOrder.firstname}{" "}
                      {selectedOrder.lastname}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.phone}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedOrder.address},{" "}
                      {selectedOrder.city}, {selectedOrder.country}
                    </p>
                    {selectedOrder.apartment && (
                      <p>
                        <strong>Apartment:</strong> {selectedOrder.apartment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Products ({selectedOrder.products.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 bg-gray-50 p-4 rounded-lg"
                      >
                        <img
                          src={product.img}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {product.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {product.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ₹{product.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            ₹
                            {(
                              parseFloat(product.price) *
                              parseInt(product.quantity)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Update Status
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        updateStatus(selectedOrder._id, "pending");
                        setShowModal(false);
                      }}
                      className="flex-1 cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedOrder._id, "delivered");
                        setShowModal(false);
                      }}
                      className="flex-1 cursor-pointer bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Delivered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
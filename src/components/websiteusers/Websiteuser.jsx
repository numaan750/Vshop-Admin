import React, { useState, useEffect } from "react";
import {
  Eye,
  Users,
  ShoppingCart,
  Package,
  UserX,
  X,
  Calendar,
} from "lucide-react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://velora-website-backend.vercel.app/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, ordersRes, userCountRes, orderCountRes] =
        await Promise.all([
          fetch(`${API_URL}/vusermodel`),
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/users/count`),
          fetch(`${API_URL}/orders/count`),
        ]);

      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();
      const userCountData = await userCountRes.json();
      const orderCountData = await orderCountRes.json();

      setUsers(usersData);
      setOrders(ordersData.orders || ordersData);
      setTotalUsers(userCountData.totalUsers);
      setTotalOrders(orderCountData.totalOrders);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getUserOrderCount = (userId) => {
    return orders.filter((order) => order.userId === userId).length;
  };

  const getUsersWithOrders = () => {
    return users.filter((user) => getUserOrderCount(user._id) > 0).length;
  };

  const getUsersWithoutOrders = () => {
    return users.filter((user) => getUserOrderCount(user._id) === 0).length;
  };

  const handleViewUser = async (user) => {
    try {
      const response = await fetch(`${API_URL}/checkoutmodel/user/${user._id}`);
      const userOrdersData = await response.json();

      setUserOrders(userOrdersData);
      setSelectedUser(user);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      setUserOrders([]);
      setSelectedUser(user);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserOrders([]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Users Details </h1>
          </div>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {totalUsers}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">With Orders</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {getUsersWithOrders()}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">No Orders</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {getUsersWithoutOrders()}
                </h3>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {totalOrders}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    SR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => {
                  const orderCount = getUserOrderCount(user._id);

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {user.username || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-full bg-gray-100 text-gray-900 font-semibold text-sm">
                          {orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            orderCount > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {orderCount > 0 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="inline-flex items-center justify-center w-5 h-7 cursor-pointer  text-black rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.username || "User"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="cursor-pointer w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                {/* User Info */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Email Address
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.city && selectedUser.country
                          ? `${selectedUser.city}, ${selectedUser.country}`
                          : "N/A"}
                      </p>
                    </div>
                    {selectedUser.address && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedUser.address}
                        </p>
                      </div>
                    )}
                    {selectedUser.postalcode && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Postal Code
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedUser.postalcode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Orders Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Order History
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold">
                        {userOrders.length}{" "}
                        {userOrders.length === 1 ? "Order" : "Orders"}
                      </span>
                      <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                        Total: Rs.{" "}
                        {userOrders
                          .reduce(
                            (total, order) =>
                              total +
                              order.products.reduce(
                                (sum, item) =>
                                  sum +
                                  Number(item.price) * Number(item.quantity),
                                0
                              ),
                            0
                          )
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order, index) => {
                        const orderTotal = order.products.reduce(
                          (acc, item) =>
                            acc + Number(item.price) * Number(item.quantity),
                          0
                        );
                        const totalItems = order.products.reduce(
                          (acc, item) => acc + Number(item.quantity),
                          0
                        );

                        return (
                          <div
                            key={order._id}
                            className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
                          >
                            {/* Order Header with Color */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4 border-b-2 border-blue-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">
                                      Order #{index + 1}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {formatDate(order.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                                    order.status === "completed"
                                      ? "bg-green-500 text-white"
                                      : order.status === "pending"
                                      ? "bg-yellow-500 text-white"
                                      : order.status === "processing"
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-500 text-white"
                                  }`}
                                >
                                  {order.status || "Pending"}
                                </span>
                              </div>
                            </div>

                            {/* Order Summary Cards */}
                            <div className="grid grid-cols-3 gap-4 p-5 bg-gray-50">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">
                                  Total Amount
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                  Rs. {orderTotal.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">
                                  Total Items
                                </p>
                                <p className="text-xl font-bold text-blue-600">
                                  {totalItems}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">
                                  Products
                                </p>
                                <p className="text-xl font-bold text-purple-600">
                                  {order.products?.length || 0}
                                </p>
                              </div>
                            </div>

                            {/* Order Items */}
                            {order.products && order.products.length > 0 && (
                              <div className="p-5">
                                <p className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                                  <ShoppingCart className="w-4 h-4" />
                                  Order Items
                                </p>
                                <div className="space-y-2">
                                  {order.products.map((item, itemIndex) => (
                                    <div
                                      key={itemIndex}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                          <span className="text-xs font-bold text-blue-600">
                                            {itemIndex + 1}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-gray-900">
                                            {item.productName ||
                                              item.name ||
                                              "Product"}
                                          </p>
                                          <p className="text-xs text-gray-600 mt-0.5">
                                            Quantity:{" "}
                                            <span className="font-semibold text-gray-900">
                                              {item.quantity || 1}
                                            </span>{" "}
                                            × Rs.{" "}
                                            {Number(
                                              item.price
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">
                                          Rs.{" "}
                                          {(
                                            Number(item.price) *
                                            Number(item.quantity || 1)
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Order Total Footer */}
                                <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                                  <p className="text-sm font-bold text-gray-700">
                                    ORDER TOTAL
                                  </p>
                                  <p className="text-2xl font-bold text-green-600">
                                    Rs. {orderTotal.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

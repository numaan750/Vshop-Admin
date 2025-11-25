import React, { useState, useEffect, useContext, useRef } from "react";
import { Users, Package, ShoppingCart, TrendingUp, Eye } from "lucide-react";
import { AppContext } from "../../context/Appcontext";

const Dashboard = ({ setActiveView }) => {
  const ordersRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalAmount: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [error, setError] = useState(null);

  // Backend URL - adjust according to your setup
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://velora-website-backend.vercel.app/api";

  // API fetch functions
  const getUsersCount = async () => {
    try {
      const res = await fetch(`${backendUrl}/users/count`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching users count:", err);
      return { success: false };
    }
  };

  const getProductsCount = async () => {
    try {
      const res = await fetch(`${backendUrl}/products/count`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching products count:", err);
      return { success: false };
    }
  };

  const getOrdersCount = async () => {
    try {
      const res = await fetch(`${backendUrl}/orders/count`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching orders count:", err);
      return { success: false };
    }
  };

  const getRecentOrders = async () => {
    try {
      const res = await fetch(`${backendUrl}/orders/recent`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching recent orders:", err);
      return { success: false };
    }
  };

  const getAllOrders = async () => {
    try {
      const res = await fetch(`${backendUrl}/orders`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching all orders:", err);
      return { success: false };
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all counts in parallel
        const [
          usersData,
          productsData,
          ordersData,
          recentOrdersData,
          allOrdersData,
        ] = await Promise.all([
          getUsersCount(),
          getProductsCount(),
          getOrdersCount(),
          getRecentOrders(),
          getAllOrders(),
        ]);

        // Set stats
        setStats({
          totalUsers: usersData.success ? usersData.totalUsers : 0,
          totalProducts: productsData.success ? productsData.totalProducts : 0,
          totalOrders: ordersData.success ? ordersData.totalOrders : 0,
          totalAmount: allOrdersData.orders
            ? allOrdersData.orders.reduce((sum, order) => {
                // Products se total calculate karo
                const orderTotal = order.products.reduce((pSum, product) => {
                  const price = parseFloat(product.price) || 0;
                  const quantity = parseInt(product.quantity) || 1;
                  return pSum + price * quantity;
                }, 0);
                return sum + orderTotal;
              }, 0)
            : 0,
        });

        // Set orders
        setRecentOrders(recentOrdersData.orders || []);
        setAllOrders(allOrdersData.orders || []);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewAllOrders = () => {
    if (ordersRef.current) {
      ordersRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, Admin!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Unique customers</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">In inventory</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">All time orders</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div ref={ordersRef} className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => setActiveView("Orders")}
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View All Orders
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No orders yet</p>
              <p className="text-gray-500 mt-2">
                Orders will appear here once customers make purchases
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.name || order.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        Rs{" "}
                        {order.products
                          .reduce((sum, product) => {
                            const price = parseFloat(product.price) || 0;
                            const quantity = parseInt(product.quantity) || 1;
                            return sum + price * quantity;
                          }, 0)
                          .toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

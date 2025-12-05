"use client";
import Category from "@/components/category/Category";
import AllProducts from "@/components/Products/AllProducts";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
// import Shipping from "@/components/shippingdetail/Shipping";
import Checkout from "@/components/checkouts/Checkout";
import Deshboard from "@/components/deshboard/Dashboard";
import Websiteuser from "@/components/websiteusers/Websiteuser";
import BlogAdminPanel from "@/components/blog/Blogs";
import BlogCategoryAdmin from "@/components/blogcategiries/BlogCategory";
import Contectform from "@/components/contect/contectform";

export default function ModernDashboardLayout() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [loader, setloader] = useState(true);


  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/products" },
    { name: "Categories", path: "/categories" },
    // { name: "Shipping", path: "/shipping" },
    { name: "Orders", path: "/orders" },
    { name: "Websiteuser", path: "/Websiteuser" },
    { name: "blogs", path: "/blogs" },
    { name: "blogcategory", path: "/blogcategories" },
    {name: "Form Messages", path: "/Form Messages"}
  ];

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      // Token mil gaya hai, loader band kardo
      setloader(false);
    }
  }, [router]);

  if (loader) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] tracking-[0.2em] text-black/40">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("✅ You have been logged out!");
    router.push("/login");
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <img
            src="/navbar-logo.svg"
            alt="Logo"
            width="100"
            height="40"
            className="object-contain"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            return (
              <button
                key={item.name}
                onClick={() => setActiveView(item.name)}
                className={`cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all w-full text-left ${
                  activeView === item.name
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition w-full text-left px-4 py-2"
          >
            <span className="text-sm cursor-pointer font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          {/* {/* <div className="flex items-center gap-3 w-full max-w-sm bg-gray-100 rounded-md px-3 py-2"> */}
            {/* <svg
              className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg> */}
            {/* <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-gray-700 w-full"
            /> */}
          {/* </div> */}
        </header>

        {/* Content Area - Yahan pages render honge */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeView === "Dashboard" && (
            <>
              <Deshboard setActiveView={setActiveView}/>
            </>
          )}

          {activeView === "Products" && (
            <>
              <AllProducts />
            </>
          )}

          {activeView === "Categories" && (
            <>
              <Category />
            </>
          )}

          {/* {activeView === "Shipping" && (
            <>
             <Shipping />
            </>
          )} */}

          {activeView === "Orders" && (
           <>
            <Checkout setActiveView={setActiveView}/>
           </>
          )}

          {activeView === "Websiteuser" && (
           <>
            <Websiteuser />
           </>
          )}

          {activeView === "blogs" && (
            <>
            <BlogAdminPanel />
            </>
          )}

          {activeView === "blogcategory" && (
            <>
            <BlogCategoryAdmin />
            </>
          )}
          {activeView === "Form Messages" && (
            <>
            <Contectform />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

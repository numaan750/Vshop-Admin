"use client";
import React, { createContext, useState } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [activeView, setActiveView] = useState("Dashboard");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [token, settoken] = useState(null);
  const browser = typeof window !== "undefined";

  const isAuthenticated = () => {
    if (browser) {
      return !!localStorage.getItem("token");
    }
    return false;
  };

  const login = (token) => {
    if (browser) {
      localStorage.setItem("token", token);
      settoken(token);
    }
  };

  const logout = () => {
    if (browser) {
      localStorage.removeItem("token");
      settoken(null);
    }
  };

  //products api fetch
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

  const getProductById = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/productsmodel/${id}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching product:", err);
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

  const getDiscountProducts = async () => {
  try {
    const res = await fetch(`${backendUrl}/productsmodel/discount/active`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching discount products:", err);
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

  //category api fetch

  const getcategory = async () => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching categories:", err);
      return { success: false, message: err.message };
    }
  };

  const createcategory = async (category) => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error creating category:", err);
      return { success: false, message: err.message };
    }
  };

  const updatecategory = async (id, category) => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error updating category:", err);
      return { success: false, message: err.message };
    }
  };

  const deletecategory = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/categorymodel/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error deleting category:", err);
      return { success: false, message: err.message };
    }
  };

  const getallshipping = async () => {
    try {
      const res = await fetch(`${backendUrl}/shippingmodel`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching shipping:", err);
      return { success: false, message: err.message };
    }
  };

  const getshippingbyId = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/shippingmodel/${id}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching shipping:", err);
      return { success: false, message: err.message };
    }
  };

  const createshipping = async (shipping) => {
    try {
      const res = await fetch(`${backendUrl}/shippingmodel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipping),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error creating shipping:", err);
      return { success: false, message: err.message };
    }
  };

  const updateshipping = async (id, shipping) => {
    try {
      const res = await fetch(`${backendUrl}/shippingmodel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipping),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error updating shipping:", err);
      return { success: false, message: err.message };
    }
  };

  const deleteshipping = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/shippingmodel/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error deleting shipping:", err);
      return { success: false, message: err.message };
    }
  };

  //check out orders k liya

  const getchecheckout = async (order) => {
    try {
      const res = await fetch(`${backendUrl}/ordermodel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error creating order:", err);
      return { success: false, message: err.message };
    }
  };

  const getcheckoutbyId = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/ordermodel/${id}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching order:", err);
      return { success: false, message: err.message };
    }
  };

  const updatestatus = async (id, order) => {
    try {
      const res = await fetch(`${backendUrl}/ordermodel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error updating order:", err);
      return { success: false, message: err.message };
    }
  };

  const deletecheckout = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/ordermodel/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error deleting order:", err);
      return { success: false, message: err.message };
    }
  };

  const getcheckoutpagination = async (page) => {
    try {
      const res = await fetch(`${backendUrl}/ordermodel?page=${page}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching order:", err);
      return { success: false, message: err.message };
    }
  };


  //dashboard k liya hyn ya 
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
      const res = await fetch(`${backendUrl}/orders/count`);  // ✅ CHANGED
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching orders count:", err);
      return { success: false };
    }
  };

  const getRecentOrders = async () => {
  try {
    const res = await fetch(`${backendUrl}/recent`); // ✅ Fixed template literal
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching recent orders:", err);
    return { success: false, message: err.message };
  }
};

const getAllOrders = async () => {
  try {
    const res = await fetch(`${backendUrl}/orders`); // ✅ Fixed template literal
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return { success: false, message: err.message };
  }
};


const getblogs = async () =>{
  try {
    const res = await fetch(`${backendUrl}/blogmodel`);
 // ✅ Fixed template literal
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return { success: false, message: err.message };
  }
};

const getblogbyId = async (id) => {
  try {
    const res = await fetch(`${backendUrl}/blogmodel/${id}`);

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching order:", err);
    return { success: false, message: err.message };
  }
};

const createblog = async (blog) => {
  try {
    const res = await fetch(`${backendUrl}/blogmodel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error creating order:", err);
    return { success: false, message: err.message };
  }
};

const updateblog = async (id, blog) => {
  try {
    const res = await fetch(`${backendUrl}/blogmodel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error updating order:", err);
    return { success: false, message: err.message };
  }
};

const deleteblog = async (id) => {
  try {
    const res = await fetch(`${backendUrl}/blogmodel/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error deleting order:", err);
    return { success: false, message: err.message };
  }
};


const getblogcategory = async () => {
  try {
    const res = await fetch(`${backendUrl}/blogcategorymodel`);
    const data = await res.json();
    
    // ✅ Directly return jo backend se aya
    return data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return { success: false, message: err.message };
  }
};

const getblogcategorybyId = async (id) => {
  try {
    const res = await fetch(`${backendUrl}/blogcategorymodel/${id}`);
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error fetching category:", err);
    return { success: false, message: err.message };
  }
};

const createBlogCategory = async (category) => {
  try {
    const res = await fetch(`${backendUrl}/blogcategorymodel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error creating category:", err);
    return { success: false, message: err.message };
  }
};

const updateBlogCategory = async (id, category) => {
  try {
    const res = await fetch(`${backendUrl}/blogcategorymodel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error updating category:", err);
    return { success: false, message: err.message };
  }
};

const deleteBlogCategory = async (id) => {
  try {
    const res = await fetch(`${backendUrl}/blogcategorymodel/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error deleting category:", err);
    return { success: false, message: err.message };
  }
};

 const getcontect = async () =>{
  try {
    const res = await fetch(`http://localhost:4000/api/contectmodel`);
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error fetching category:", err);
    return { success: false, message: err.message };
  }
}

const createcontect = async (contect) => {
  try {
    const res = await fetch(`http://localhost:4000/api/contectmodel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contect),
    });
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error creating category:", err);
    return { success: false, message: err.message };
  }
};


const updatecontect =  async (id, contect) => {
  try {
    const res = await fetch(`http://localhost:4000/api/contectmodel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contect),
    });
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error updating category:", err);
    return { success: false, message: err.message };
  }
};

const deletecontect = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/api/contectmodel/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    
    return data; // ✅ Direct return
  } catch (err) {
    console.error("Error deleting category:", err);
    return { success: false, message: err.message };
  }
};


// deletecontect ke TURANT BAAD ye function add karo
const markContactAsRead = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/api/contectmodel/${id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    
    return data;
  } catch (err) {
    console.error("Error marking as read:", err);
    return { success: false, message: err.message };
  }
};


  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        token,
        isAuthenticated,
        login,
        logout,
        getProducts,
        getProductById,
        createProduct,
        updateProduct,
        getDiscountProducts,
        deleteProduct,
        getcategory,
        createcategory,
        updatecategory,
        deletecategory,
        //shipping
        getallshipping,
        getshippingbyId,
        createshipping,
        updateshipping,
        deleteshipping,
        //orders k liya
        getchecheckout,
        getcheckoutbyId,
        updatestatus,
        deletecheckout,
        getcheckoutpagination,
        //dashboard k liya 
        getOrdersCount,
        getProductsCount,
        getUsersCount,
        getRecentOrders,
        getAllOrders,
        //blogs 
        getblogs,
        getblogbyId,
        createblog,
        updateblog,
        deleteblog,
        //blogcategory
        getblogcategory,
        getblogcategorybyId,
        createBlogCategory,
        updateBlogCategory,
        deleteBlogCategory,
        //contect k liya 
        getcontect, 
        createcontect, 
        updatecontect, 
        deletecontect,
        markContactAsRead,

      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

import { useContext } from "react";
export const useAppContext = () => useContext(AppContext);
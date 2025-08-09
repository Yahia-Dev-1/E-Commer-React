import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  // رابط الـ API من Strapi
  const API_URL = "http://localhost:1337/api/products?populate=*";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      // Strapi بيرجع البيانات في res.data.data
      setProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, setProducts, fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

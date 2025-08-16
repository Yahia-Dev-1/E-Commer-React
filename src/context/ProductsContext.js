import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProducts } from '../apis/ProductApis';

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    window.addEventListener('productsUpdated', loadProducts);
    return () => window.removeEventListener('productsUpdated', loadProducts);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, loadProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);

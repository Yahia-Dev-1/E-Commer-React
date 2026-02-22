import axiosClient from './axiosClient';

// Using local API endpoints instead of Strapi
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const getProducts = async () => {
  const response = await axiosClient.get('/products');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product) => {
  const response = await axiosClient.post('/products', product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await axiosClient.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosClient.delete(`/products/${id}`);
  return response.data;
};

// Removed Strapi-specific functions
// Helper function for latest products
export const getLatestProducts = async () => {
  const response = await axiosClient.get('/products/latest');
  return response.data;
};

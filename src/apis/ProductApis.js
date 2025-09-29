import axiosClient from './axiosClient';

const API_BASE_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

export const getProducts = async () => {
  const response = await axiosClient.get(`${API_BASE_URL}/api/products?populate=*`);
  return response.data.data;
};

export const getProduct = async (id) => {
  const response = await axiosClient.get(`${API_BASE_URL}/api/products/${id}?populate=*`);
  return response.data.data;
};

export const createProduct = async (product) => {
  const response = await axiosClient.post(`${API_BASE_URL}/api/products`, {
    data: product
  });
  return response.data.data;
};

export const updateProduct = async (id, product) => {
  const response = await axiosClient.put(`${API_BASE_URL}/api/products/${id}`, {
    data: product
  });
  return response.data.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosClient.delete(`${API_BASE_URL}/api/products/${id}`);
  return response.data;
};

// Additional functions for strapi integration
export const uploadFile = async (formData) => {
  const response = await axiosClient.post(`${API_BASE_URL}/api/upload`, formData);
  return response.data;
};

export const getProductByDocumentId = async (documentId) => {
  const response = await axiosClient.get(`${API_BASE_URL}/api/products/${documentId}?populate=*`);
  return response.data.data;
};

export const findProductByDocumentId = async (documentId) => {
  const response = await axiosClient.get(`${API_BASE_URL}/api/products/${documentId}?populate=*`);
  return response.data.data;
};

// Helper function for latest products
export const getLatestProducts = async () => {
  const response = await axiosClient.get(`${API_BASE_URL}/api/products?populate=*&sort=createdAt:desc`);
  return response.data.data;
};

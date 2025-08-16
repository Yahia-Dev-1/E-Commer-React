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

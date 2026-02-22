import axios from 'axios'

// Using local API endpoints instead of Strapi
// In production, use relative path to access API on the same domain
const isDevelopment = process.env.NODE_ENV === 'development';
const apiUrl = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3001/api' : '/api');

const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosClient



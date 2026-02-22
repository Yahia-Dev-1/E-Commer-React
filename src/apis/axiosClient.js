import axios from 'axios'

// Using local API endpoints instead of Strapi
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosClient



import axios from 'axios'

const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337/api'
const apiToken = process.env.REACT_APP_STRAPI_TOKEN

const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: apiToken
    ? { Authorization: `Bearer ${apiToken}` }
    : {}
})

export default axiosClient
import axiosClient from './axiosClient'

// دالة لتنظيف بيانات المنتج
const normalizeProduct = (product) => ({
  id: product.id,
  title: product.attributes.title,
  description: product.attributes.description,
  price: product.attributes.price,
  image: product.attributes.img?.data?.attributes?.url
    ? `${process.env.REACT_APP_STRAPI_URL}${product.attributes.img.data.attributes.url}`
    : null,
})

const getLatestProducts = async () => {
  const res = await axiosClient.get('/products?sort=createdAt:desc&populate=*')
  return res.data.data.map(normalizeProduct)
}

const getProductById = async (id) => {
  const res = await axiosClient.get(`/products/${id}?populate=*`)
  return normalizeProduct(res.data.data)
}

const getProductByDocumentId = async (documentId) => {
  const res = await axiosClient.get(`/products/${documentId}?populate=*`)
  return normalizeProduct(res.data.data)
}

const findProductByDocumentId = async (documentId) => {
  const res = await axiosClient.get(`/products?filters[documentId][$eq]=${encodeURIComponent(documentId)}&populate=*`)
  return res.data.data.map(normalizeProduct)
}

const getProductsByCategory = async (category) => {
  const res = await axiosClient.get(`/products?filters[category][$eq]=${encodeURIComponent(category)}&populate=*`)
  return res.data.data.map(normalizeProduct)
}

const uploadFile = (formData) => axiosClient.post('/upload', formData)

const createProduct = (dataOrFormData) => {
  if (typeof FormData !== 'undefined' && dataOrFormData instanceof FormData) {
    return axiosClient.post('/products', dataOrFormData)
  }
  return axiosClient.post('/products', { data: dataOrFormData })
}

const updateProduct = (id, dataOrFormData) => {
  if (typeof FormData !== 'undefined' && dataOrFormData instanceof FormData) {
    return axiosClient.put(`/products/${id}`, dataOrFormData)
  }
  return axiosClient.put(`/products/${id}`, { data: dataOrFormData })
}

const deleteProduct = (id) => axiosClient.delete(`/products/${id}`)

export default {
  getLatestProducts,
  getProductById,
  getProductByDocumentId,
  findProductByDocumentId,
  getProductsByCategory,
  uploadFile,
  createProduct,
  updateProduct,
  deleteProduct,
}

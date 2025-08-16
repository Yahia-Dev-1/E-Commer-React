import React, { useEffect, useState } from 'react'

import ProductItem from './ProductItem'

export default function ProductsApi() {
  const [productList, setProductList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getLatestProducts_ = async () => {
      try {
        const res = await ProductApis.getLatestProducts()
        setProductList(res?.data?.data || [])
      } catch (e) {
        setError('فشل في تحميل المنتجات من Strapi')
      } finally {
        setLoading(false)
      }
    }
    getLatestProducts_()
  }, [])

  if (loading) return <div className="p-4">جاري التحميل...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 p-4'>
      {productList.map((item) => (
        <ProductItem product={item} key={item.id} />
      ))}
    </div>
  )
}



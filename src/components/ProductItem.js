import React from 'react'

function resolveMediaBaseUrl() {
  const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337/api'
  // Derive media base by removing trailing /api if present
  if (apiUrl.endsWith('/api')) return apiUrl.slice(0, -4)
  return apiUrl
}

export default function ProductItem({ product }) {
  const mediaBase = process.env.REACT_APP_STRAPI_MEDIA_URL || resolveMediaBaseUrl()

  const id = product?.id
  const attrs = product?.attributes || {}

  const title = attrs.titel || 'No title'
  const description = attrs.description || ''
  const price = attrs.price ?? ''

  const rawUrl = attrs.img?.data?.attributes?.formats?.medium?.url
    || attrs.img?.data?.attributes?.formats?.small?.url
    || attrs.img?.data?.attributes?.url
  const imageUrl = rawUrl
    ? (rawUrl.startsWith('http') ? rawUrl : `${mediaBase}${rawUrl}`)
    : 'https://via.placeholder.com/400x400?text=No+Image'

  return (
    <div className="p-3 bg-white rounded-md shadow-sm dark:bg-[#1f2937]">
      <div className="w-full aspect-square overflow-hidden rounded-md bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold line-clamp-1">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{description}</p>
        )}
        {price !== '' && (
          <div className="text-sm font-bold mt-2">${price}</div>
        )}
        <div className="text-[10px] text-gray-400 mt-1">ID: {id}</div>
      </div>
    </div>
  )
}



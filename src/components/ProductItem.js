import React from 'react'

export default function ProductItem({ product }) {
  const id = product?.id
  const title = product?.title || product?.name || 'No title'
  const description = product?.description || ''
  const price = product?.price ?? ''
  const imageUrl = product?.image || product?.img || product?.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'

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



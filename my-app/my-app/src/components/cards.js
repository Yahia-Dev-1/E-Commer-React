import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/cards.css'
import hoodie from './hoodie.webp'

// Individual Card Component with props
function Card({ image, title, description, price, onAddToCart }) {
  const handleImageError = (e) => {
    // Fallback to a placeholder if image fails to load
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB4PSIzNSIgeT0iMzUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiA2Yy0zLjMxIDAtNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo8L3N2Zz4K'
  }

  const handleClick = () => {
    console.log('Button clicked for:', title)
    if (onAddToCart) {
      onAddToCart()
    } else {
      console.log('onAddToCart function is not available')
    }
  }

  return (
    <div className="card">
      <div className="card-img">
        <img 
          className="img" 
          src={hoodie} 
          alt={title}
          onError={handleImageError}
        />
      </div>
      <div className="card-title">{title}</div>
      <div className="card-subtitle">{description}</div>
      <hr className="card-divider"/>
      <div className="card-footer">
        <div className="card-price"><span>$</span> {price}</div>
        <button className="card-btn" onClick={handleClick}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="m397.78 316h-205.13a15 15 0 0 1 -14.65-11.67l-34.54-150.48a15 15 0 0 1 14.62-18.36h274.27a15 15 0 0 1 14.65 18.36l-34.6 150.48a15 15 0 0 1 -14.62 11.67zm-193.19-30h181.25l27.67-120.48h-236.6z"></path><path d="m222 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z"></path><path d="m368.42 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z"></path><path d="m158.08 165.49a15 15 0 0 1 -14.23-10.26l-25.71-77.23h-47.44a15 15 0 1 1 0-30h58.3a15 15 0 0 1 14.23 10.26l29.13 87.49a15 15 0 0 1 -14.23 19.74z"></path></svg>
        </button>
      </div>
    </div>
  )
}

// Main Cards Container Component
export default function Cards({ addToCart }) {
  const navigate = useNavigate()

  // Sample product data
  const products = [
    {
      id: 1,
      image: hoodie,
      title: "Hoodie",
      description: "Comfortable and stylish hoodie for everyday wear.",
      price: "49.99"
    },
    {
      id: 2,
      image: hoodie,
      title: "T-Shirt",
      description: "Classic cotton t-shirt with modern design.",
      price: "24.99"
    },
    {
      id: 3,
      image: hoodie,
      title: "Jeans",
      description: "High-quality denim jeans for a perfect fit.",
      price: "79.99"
    },
    {
      id: 4,
      image: hoodie,
      title: "Sneakers",
      description: "Comfortable sneakers for daily activities.",
      price: "89.99"
    }
  ]

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (addToCart) {
      addToCart(product)
      navigate('/cart')
    } else {
      console.log('Add to cart function not available')
      alert('Added to cart: ' + product.title)
    }
  }

  return (
    <div className='cards-container'>
      {products.map((product) => (
        <Card
          key={product.id}
          image={product.image}
          title={product.title}
          description={product.description}
          price={product.price}
          onAddToCart={() => handleAddToCart(product)}
        />
      ))}
    </div>
  )
}

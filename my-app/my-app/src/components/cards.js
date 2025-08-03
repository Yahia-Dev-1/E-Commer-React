import React, { useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import '../styles/cards.css'

// Individual Card Component with props
function Card({ image, title, description, price, quantity, onAddToCart }) {
  const handleImageError = (e) => {
    // Fallback to a placeholder if image fails to load
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB4PSIzNSIgeT0iMzUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiA2Yy0zLjMxIDAtNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo8L3N2Zz4K'
  }

  const handleClick = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart()
    }
    // No alert for out of stock - visual feedback is enough
  }

  const isOutOfStock = quantity <= 0

  return (
    <div className={`card ${isOutOfStock ? 'out-of-stock' : ''}`} style={{ 
      cursor: isOutOfStock ? 'not-allowed' : 'default',
      opacity: isOutOfStock ? 0.6 : 1,
      pointerEvents: isOutOfStock ? 'none' : 'auto'
    }}>
      <div className="card-img">
        <img 
          className="img" 
          src={image} 
          alt={title}
          onError={handleImageError}
          style={{ filter: isOutOfStock ? 'grayscale(100%)' : 'none' }}
        />
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>
      <div className="card-title">{title}</div>
      <div className="card-subtitle">{description}</div>
      <div className="card-quantity">
        <span className={`quantity-badge ${isOutOfStock ? 'out-of-stock' : quantity <= 5 ? 'low-stock' : 'in-stock'}`}>
          {isOutOfStock ? 'Out of Stock' : quantity <= 5 ? `Low Stock (${quantity})` : `${quantity} Available`}
        </span>
      </div>
      <hr className="card-divider"/>
      <div className="card-footer">
        <div className="card-price"><span>$</span> {price}</div>
        <button 
          className={`card-btn ${isOutOfStock ? 'disabled' : ''}`} 
          onClick={handleClick}
          disabled={isOutOfStock}
          style={{ 
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            opacity: isOutOfStock ? 0.5 : 1
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="m397.78 316h-205.13a15 15 0 0 1 -14.65-11.67l-34.54-150.48a15 15 0 0 1 14.62-18.36h274.27a15 15 0 0 1 14.65 18.36l-34.6 150.48a15 15 0 0 1 -14.62 11.67zm-193.19-30h181.25l27.67-120.48h-236.6z"></path><path d="m222 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z"></path><path d="m368.42 450a57.48 57.48 0 1 1 57.48-57.48 57.54 57.54 0 0 1 -57.48 57.48zm0-84.95a27.48 27.48 0 1 0 27.48 27.47 27.5 27.5 0 0 0 -27.48-27.47z"></path><path d="m158.08 165.49a15 15 0 0 1 -14.23-10.26l-25.71-77.23h-47.44a15 15 0 1 1 0-30h58.3a15 15 0 0 1 14.23 10.26l29.13 87.49a15 15 0 0 1 -14.23 19.74z"></path></svg>
        </button>
      </div>
    </div>
  )
}

// Filter Button Component
function FilterButton({ category, isActive, onClick }) {
  return (
    <button 
      className={`filter-btn ${isActive ? 'active' : ''}`}
      onClick={() => onClick(category)}
    >
      {category}
    </button>
  )
}

// Main Cards Container Component
export default function Cards({ addToCart, darkMode = false }) {
  // const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Load products from localStorage on component mount
  React.useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
    if (savedProducts.length > 0) {
      setProducts(savedProducts)
    } else {
      // Default products if no custom products exist
      const defaultProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      title: "Hoodie",
      description: "Comfortable and stylish hoodie for everyday wear.",
      price: "49.99",
      category: "Clothing",
      quantity: 10
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      title: "T-Shirt",
      description: "Classic cotton t-shirt with modern design.",
      price: "24.99",
      category: "Clothing",
      quantity: 20
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      title: "Jeans",
      description: "High-quality denim jeans for a perfect fit.",
      price: "79.99",
      category: "Clothing",
      quantity: 5
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      title: "Sneakers",
      description: "Comfortable sneakers for daily activities.",
      price: "89.99",
      category: "Shoes",
      quantity: 0
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
      title: "Running Shoes",
      description: "Professional running shoes for athletes.",
      price: "129.99",
      category: "Shoes",
      quantity: 15
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
      title: "Watch",
      description: "Elegant watch with modern design.",
      price: "199.99",
      category: "Accessories",
      quantity: 8
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      title: "Backpack",
      description: "Stylish backpack for daily use.",
      price: "59.99",
      category: "Accessories",
      quantity: 25
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop",
      title: "Cap",
      description: "Trendy cap for outdoor activities.",
      price: "19.99",
      category: "Accessories",
      quantity: 12
    }
  ]
      setProducts(defaultProducts)
    }
  }, [])

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))]

  // Filter products based on active filter and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeFilter === 'All' || product.category === activeFilter
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Handle filter change
  const handleFilterChange = (category) => {
    setActiveFilter(category)
  }

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (addToCart) {
      addToCart(product)
    }
  }

  return (
    <div className={`cards-section ${darkMode ? 'dark-mode' : ''}`}>
      {/* Lottie Animation at Top */}
      <div className="lottie-container">
        <DotLottieReact
          src="https://lottie.host/9e31c819-612c-4f38-b3fd-2e53e6a10104/EEfP3i9LcG.lottie"
          loop
          autoplay
        />
      </div>

   
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-container">
        <h3 className="filter-title">Filter by Category:</h3>
        <div className="filter-buttons">
          {categories.map((category) => (
            <FilterButton
              key={category}
              category={category}
              isActive={activeFilter === category}
              onClick={handleFilterChange}
            />
          ))}
        </div>
      </div>

             {/* Products Count and Stock Stats */}
               <div className="products-count">
          <p>Products Count: {filteredProducts.length}</p>
          <div className="stock-stats">
            <span className="stat-item in-stock">
              In Stock: {filteredProducts.filter(p => p.quantity > 5).length}
            </span>
            <span className="stat-item low-stock">
              Low Stock: {filteredProducts.filter(p => p.quantity > 0 && p.quantity <= 5).length}
            </span>
            <span className="stat-item out-of-stock">
              Out of Stock: {filteredProducts.filter(p => p.quantity <= 0).length}
            </span>
          </div>
        </div>

      {/* Products Grid */}
      <div className='cards-container'>
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            image={product.image}
            title={product.title}
            description={product.description}
            price={product.price}
            quantity={product.quantity}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>

      {/* No Products Message */}
      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found in this category</p>
        </div>
      )}
    </div>
  )
}

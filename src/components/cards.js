import React, { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import SEO from './SEO'
import '../styles/cards.css'

// Function to check if current user is admin
const isCurrentUserAdmin = () => {
  const currentUserEmail = localStorage.getItem('currentUserEmail');
  if (!currentUserEmail) return false;
  
  const adminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
  const defaultAdminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com'];
  const allAdminEmails = adminEmails.length > 0 ? adminEmails : defaultAdminEmails;
  
  return allAdminEmails.includes(currentUserEmail);
};

// Optimized Card Component with lazy loading images
function Card({ image, title, description, price, quantity, onAddToCart }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('http://localhost:1337/api/products?populate=*')
      .then(res => res.json())
      .then(data => {
        // تأكد من شكل البيانات في console
        console.log(data)
        // لو البيانات في data.data حسب Strapi 4
        setProducts(data.data)
      })
      .catch(err => console.error(err))
  }, [])



  

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // تأكد من وجود جميع الخصائص المطلوبة
  const safeTitle = title || 'Untitled Product';
  const safeDescription = description || 'No description available';
  const safePrice = price || '0.00';
  const safeQuantity = typeof quantity === 'number' ? quantity : 0;
  const safeImage = image || 'https://via.placeholder.com/400x400?text=No+Image';

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = (e) => {
    setImageError(true)
    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found'
  }

  const handleClick = () => {
    if (safeQuantity > 0) {
      onAddToCart();
    }
  }

  const isOutOfStock = safeQuantity <= 0;
  const isLowStock = safeQuantity > 0 && safeQuantity <= 5;
  const isInStock = safeQuantity > 5;
  const isAdmin = isCurrentUserAdmin();

  return (<div>

<div className="cards-container">
  {products.length === 0 ? (
    <div className="no-products">
      <p>No products found</p>
    </div>
  ) : (
    products.map(product => {
      // تعيين حالة المخزون حسب بيانات المنتج
      let stockStatusClass = ""; // in-stock, low-stock, out-of-stock
      if (product.status === "in-stock") stockStatusClass = "in-stock";
      else if (product.status === "low-stock") stockStatusClass = "low-stock";
      else if (product.status === "out-of-stock") stockStatusClass = "out-of-stock";

      return (
        <div key={product.id} className={`card ${product.status === "out-of-stock" ? "out-of-stock" : ""}`}>
          <div className="card-img">
            {product.status === "out-of-stock" && (
              <div className="out-of-stock-overlay">Out of Stock</div>
            )}
            {product.img && (
              <img
                className="img"
                src={typeof product.img === "string" ? product.img : product.img.url}
                alt={product.title}
              />
            )}
          </div>

          <h3 className="card-title">{product.title}</h3>
          <p className="card-subtitle">{product.description}</p>

    

          <hr className="card-divider" />

          <div className="card-footer">
            <div className="card-price">
              <span className="currency-symbol">$</span>
              <span className="price-value">{product.price}</span>
              <span className="price-decoration"></span>
            </div>

            <button 
          className={`card-btn ${isOutOfStock ? 'disabled' : ''} ${isLowStock ? 'low-stock' : ''} ${isInStock ? 'in-stock' : ''}`} 
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
      );
    })
  )}
</div>
 




    <div className={`card ${isOutOfStock ? 'out-of-stock' : ''}`} style={{ 
      cursor: isOutOfStock ? 'not-allowed' : 'default',
      opacity: isOutOfStock ? 0.6 : 1,
      pointerEvents: isOutOfStock ? 'none' : 'auto'
    }}>
      <div className="card-img">
        {/* Placeholder while image loads */}
        {!imageLoaded && !imageError && (
          <div className="image-placeholder" style={{
            width: '100%',
            height: '200px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            borderRadius: '8px'
          }}></div>
        )}
        <img 
          className="img" 
          src={safeImage} 
          alt={safeTitle}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            filter: isOutOfStock ? 'grayscale(100%)' : 'none',
            display: imageLoaded && !imageError ? 'block' : 'none'
          }}
        />
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>
      <div className="card-title">{safeTitle}</div>
      <div className="card-subtitle">{safeDescription}</div>
      <div className="quantity-badge-container" style={{ textAlign: 'center', margin: '8px 0' }}>
        <span className={`quantity-badge ${isOutOfStock ? 'out-of-stock' : safeQuantity <= 5 ? 'low-stock' : 'in-stock'}`}>
          {isOutOfStock ? 'Out of Stock' : 
           isAdmin ? (safeQuantity <= 5 ? `Low (${safeQuantity})` : `${safeQuantity}`) : 
           'In Stock'}
        </span>
      </div>
      <hr className="card-divider"/>
      <div className="card-footer">
        <div className="card-price">
          <span className="currency-symbol">$</span>
          <span className="price-value">{safePrice}</span>
          <div className="price-decoration"></div>
        </div>
        <button 
          className={`card-btn ${isOutOfStock ? 'disabled' : ''} ${isLowStock ? 'low-stock' : ''} ${isInStock ? 'in-stock' : ''}`} 
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
    </div>
  )
}

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
export default function Cards({ addToCart, darkMode = false, products = [], productsVersion = 0 }) {
  // const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Products are now passed from App.js, no need to load from localStorage
  console.log(`📦 Cards: Received ${products.length} products from App.js (version: ${productsVersion})`)
  
  // Log when products change
  React.useEffect(() => {
    console.log(`🔄 Cards: Products updated - ${products.length} products (version: ${productsVersion})`)
    console.log('📋 Products titles:', products.map(p => p.title))
  }, [products, productsVersion])

  // Get unique categories (memoized)
  const categories = React.useMemo(() => {
    try {
      const savedCategories = JSON.parse(localStorage.getItem('ecommerce_categories') || '[]');
      if (savedCategories.length === 0) {
        return ['All', ...new Set(products.map(product => product.category))];
      }
      return ['All', ...savedCategories];
    } catch (error) {
      return ['All', ...new Set(products.map(product => product.category))];
    }
  }, [products])

  // Filter products based on active filter and search term (memoized)
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeFilter === 'All' || product.category === activeFilter
      const matchesSearch = (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [products, activeFilter, searchTerm])

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

  // Function to refresh products (now triggers App.js to reload)
  const refreshProducts = () => {
    console.log('🔄 Cards: Requesting refresh from App.js...')
    window.dispatchEvent(new CustomEvent('productsUpdated'))
  }

  // دالة لمسح جميع المنتجات من اللوكل استورج
  const clearAllProducts = () => {
    if (window.confirm('Are you sure you want to clear all products? This action cannot be undone.')) {
      try {
        localStorage.removeItem('ecommerce_products')
        localStorage.removeItem('has_default_products')
        // Trigger App.js to reload products
        window.dispatchEvent(new CustomEvent('productsUpdated'))
        console.log('🗑️ All products cleared from localStorage')
        alert('All products have been cleared successfully!')
      } catch (error) {
        console.error('Error clearing products:', error)
        alert('Error clearing products')
      }
    }
  }

  const isAdmin = isCurrentUserAdmin();

  return (
    <>
      <SEO 
        title="Yahia Store - Advanced E-commerce Store | Safe and Fast Shopping"
        description="Discover a wide range of clothing, shoes, and accessories in our e-commerce store. Safe and fast shopping with excellent customer service and competitive prices."
        keywords="e-commerce store, clothing, shoes, accessories, online shopping, offers, discounts, hoodie, t-shirt, jeans, running shoes, watch, backpack, cap"
        url="https://yahia-dev-1.github.io/E-Commer-React"
      />
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
        {/* Show products count for regular users */}
        {!isAdmin && (
          <div className="products-count-simple">
            <p>Products Count: {filteredProducts.length}</p>
          </div>
        )}
      </div>

      {/* Products Count and Stock Stats - Only for Admins */}
      {isAdmin && (
        <div className="products-count">
          <div className="count-header">
            <p>Products Count: {filteredProducts.length}</p>
            <button 
              className="refresh-btn"
              onClick={refreshProducts}
              title="Refresh Products"
            >
              🔄 Refresh
            </button>
            <button 
              className="clear-btn"
              onClick={clearAllProducts}
              title="Clear All Products"
            >
              🗑️ Clear All
            </button>
          </div>
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
      )}

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
    
    </>
  )
}

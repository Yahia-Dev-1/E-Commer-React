import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AddProducts.css'

export default function AddProducts({ darkMode = false }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showCategoriesSection, setShowCategoriesSection] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['electronics', 'clothing', 'books', 'home', 'sports', 'other'])
  const [newCategory, setNewCategory] = useState('')
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    quantity: 1,
    image: '',
    description: '',
    category: 'electronics'
  })
  const [editingProduct, setEditingProduct] = useState(null)

  // Protected admin emails
  const protectedAdmins = [
    'yahiapro400@gmail.com',
    'yahiacool2009@gmail.com'
  ]

  const isProtectedAdmin = () => {
    const currentUserEmail = localStorage.getItem('currentUserEmail') || 
                            localStorage.getItem('loggedInUser') || 
                            localStorage.getItem('userEmail')
    return currentUserEmail && protectedAdmins.includes(currentUserEmail)
  }

  const canModifyProtectedAdmin = () => {
    const currentUserEmail = localStorage.getItem('currentUserEmail') || 
                            localStorage.getItem('loggedInUser') || 
                            localStorage.getItem('userEmail')
    return currentUserEmail && protectedAdmins.includes(currentUserEmail)
  }

  useEffect(() => {
    // Preload images for faster loading
    const preloadImages = () => {
      products.forEach(product => {
        if (product.image) {
          const img = new Image();
          img.src = product.image;
        }
      });
    };

    // Check if user is logged in - try multiple possible keys
    const currentUserEmail = localStorage.getItem('currentUserEmail') || 
                            localStorage.getItem('loggedInUser') || 
                            localStorage.getItem('userEmail')
    
    // If no user email found, check if there are any users in localStorage
    if (!currentUserEmail) {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      if (users.length === 0) {
        // If no users exist, allow access (first time setup)
        setUser({ email: 'admin@gmail.com' })
        loadProducts()
        loadCategories()
        setIsLoading(false)
        return
      }
      // If users exist but no current user, redirect to login
      navigate('/login')
      return
    }

    // Get user data
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const currentUser = users.find(u => u.email === currentUserEmail)
    
    if (!currentUser) {
      // If user not found in users array, check if it's an admin email
      const adminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com', 'admin-test@gmail.com', 'admin@gmail.com']
      if (adminEmails.includes(currentUserEmail)) {
        setUser({ email: currentUserEmail })
        loadProducts()
        loadCategories()
        setIsLoading(false)
        return
      }
      navigate('/login')
      return
    }

    // Check if user is admin
    const adminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com', 'admin-test@gmail.com', 'admin@gmail.com']
    if (!adminEmails.includes(currentUser.email)) {
      navigate('/')
      return
    }

    setUser(currentUser)

    loadProducts()
    loadCategories()
    
    // Preload images after products are loaded
    setTimeout(() => {
      preloadImages();
    }, 100);
    
    // Auto-cleanup on page load to prevent memory issues
    try {
      const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
      if (products.length > 50) {
        const limitedProducts = products.slice(-50)
        localStorage.setItem('ecommerce_products', JSON.stringify(limitedProducts))
        console.log('🧹 Auto-cleanup: Reduced products from', products.length, 'to', limitedProducts.length)
      }
    } catch (error) {
      console.error('Error during auto-cleanup:', error)
    }

    // تنظيف التخزين لمنع مشاكل الذاكرة
    cleanupStorage()
    
    setIsLoading(false)

    // Event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'ecommerce_products') {
        // Debounce the update to prevent excessive re-renders
        clearTimeout(window.storageTimeout)
        window.storageTimeout = setTimeout(() => {
          loadProducts()
        }, 500)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Click outside listener for category dropdown
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-selector')) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('mousedown', handleClickOutside)
      clearTimeout(window.storageTimeout)
    }
  }, [navigate])

  const loadProducts = () => {
    try {
      const storedProducts = localStorage.getItem('ecommerce_products')
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts)
        setProducts(parsedProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    }
  }

  const loadCategories = () => {
    try {
      const storedCategories = localStorage.getItem('ecommerce_categories')
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories)
        setCategories(parsedCategories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // دالة لتنظيف التخزين
  const cleanupStorage = () => {
    try {
      // تنظيف البيانات القديمة
      const keysToClean = [
        'ecommerce_products_old',
        'ecommerce_categories_old',
        'cartItems_old',
        'users_old'
      ]
      
      keysToClean.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e)
        }
      })
      
      // تنظيف sessionStorage
      try {
        sessionStorage.clear()
      } catch (e) {
        console.warn('Failed to clear sessionStorage:', e)
      }
      
      console.log('✅ Storage cleanup completed')
    } catch (error) {
      console.error('Error during storage cleanup:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!newProduct.title || !newProduct.price || !newProduct.image || !newProduct.quantity) {
      setMessage('Please fill in all required fields')
      return
    }

    const product = {
      id: Date.now(),
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
      image: newProduct.image,
      description: newProduct.description,
      category: newProduct.category,
      createdAt: new Date().toISOString(),
      createdBy: `${localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUser') || localStorage.getItem('userEmail') || 'Admin'} (Admin)`,
      isProtected: isProtectedAdmin()
    }

    // إضافة المنتج الجديد إلى المنتجات الموجودة
    const updatedProducts = [...products, product]
    setProducts(updatedProducts)
    
    // تحسين التخزين مع ضغط البيانات
    try {
      // تحسين البيانات قبل التخزين
      const optimizedProducts = updatedProducts.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: product.quantity,
        image: product.image,
        description: product.description,
        category: product.category,
        createdAt: product.createdAt
      }))
      
      // Limit products before saving to prevent memory issues
      const limitedProducts = optimizedProducts.slice(-50) // Keep only last 50 products
      const compressedData = JSON.stringify(limitedProducts)
      
      // محاولة التخزين مع معالجة الأخطاء
      try {
        localStorage.setItem('ecommerce_products', compressedData)
      } catch (storageError) {
        console.warn('Storage error, trying to clear old data:', storageError)
        
        // محاولة تنظيف التخزين وإعادة المحاولة
        try {
          localStorage.removeItem('ecommerce_products')
          localStorage.setItem('ecommerce_products', compressedData)
        } catch (retryError) {
          console.error('Failed to store even after cleanup:', retryError)
          throw new Error('Storage is full or not available')
        }
      }
      
      // التحقق من نجاح التخزين
      const storedData = localStorage.getItem('ecommerce_products')
      if (!storedData) {
        throw new Error('Failed to store products')
      }
      
      console.log(`✅ Successfully stored ${limitedProducts.length} products in localStorage`)
      
      // إضافة تأكيد إضافي للتخزين
      const verificationData = JSON.parse(storedData)
      if (verificationData.length !== limitedProducts.length) {
        console.warn('Storage verification failed, data may be corrupted')
      }
      
    } catch (error) {
      console.error('Error storing products:', error)
      
      // محاولة حفظ في sessionStorage كبديل
      try {
        const fallbackData = JSON.stringify(updatedProducts.slice(-20))
        sessionStorage.setItem('ecommerce_products_fallback', fallbackData)
        console.log('✅ Saved to sessionStorage as fallback')
        setMessage('⚠️ Warning: Product added to temporary storage. Data may be lost on page refresh.')
      } catch (fallbackError) {
        console.error('Fallback storage also failed:', fallbackError)
        setMessage('❌ Error: Unable to save product. Please try again or clear browser data.')
      }
      
      setTimeout(() => setMessage(''), 8000)
    }
    
    // إرسال حدث مخصص لتحديث المنتجات في الصفحة الرئيسية
    window.dispatchEvent(new Event('productsUpdated'))
    
    setMessage(`✅ Product "${product.title}" with ${product.quantity} pieces added successfully!`)
    
    // Clear form and redirect to products page
    clearForm()
    setTimeout(() => {
      setMessage('')
      // Redirect to products page
      window.location.href = '/'
    }, 2000)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    
    if (!editingProduct.title || !editingProduct.price || !editingProduct.image || !editingProduct.quantity) {
      setMessage('Please fill in all required fields')
      return
    }

    // Check if trying to edit a protected product
    if (editingProduct.isProtected && !canModifyProtectedAdmin()) {
      alert('❌ Cannot edit protected products!\n\nOnly yahiapro400@gmail.com and yahiacool2009@gmail.com can edit protected products.')
      return
    }

    const updatedProduct = {
      ...editingProduct,
      price: parseFloat(editingProduct.price),
      quantity: parseInt(editingProduct.quantity),
      updatedAt: new Date().toISOString(),
      updatedBy: `${localStorage.getItem('currentUserEmail') || localStorage.getItem('loggedInUser') || localStorage.getItem('userEmail') || 'Admin'} (Admin)`
    }

    const updatedProducts = products.map(product => 
      product.id === editingProduct.id ? updatedProduct : product
    )
    
    setProducts(updatedProducts)
    
    // تحسين التخزين مع ضغط البيانات
    try {
      // Limit products before saving to prevent memory issues
      const limitedProducts = updatedProducts.slice(-50) // Keep only last 50 products
      const compressedData = JSON.stringify(limitedProducts)
      
      // محاولة التخزين مع معالجة الأخطاء
      try {
        localStorage.setItem('ecommerce_products', compressedData)
      } catch (storageError) {
        console.warn('Storage error during edit, trying to clear old data:', storageError)
        
        // محاولة تنظيف التخزين وإعادة المحاولة
        try {
          localStorage.removeItem('ecommerce_products')
          localStorage.setItem('ecommerce_products', compressedData)
        } catch (retryError) {
          console.error('Failed to store even after cleanup:', retryError)
          throw new Error('Storage is full or not available')
        }
      }
      
      // التحقق من نجاح التخزين
      const storedData = localStorage.getItem('ecommerce_products')
      if (!storedData) {
        throw new Error('Failed to store products')
      }
      
      console.log(`✅ Successfully updated product. ${limitedProducts.length} products in localStorage`)
      
      // إضافة تأكيد إضافي للتخزين
      const verificationData = JSON.parse(storedData)
      if (verificationData.length !== limitedProducts.length) {
        console.warn('Storage verification failed during edit, data may be corrupted')
      }
      
    } catch (error) {
      console.error('Error updating product:', error)
      
      // محاولة حفظ في sessionStorage كبديل
      try {
        const fallbackData = JSON.stringify(updatedProducts.slice(-20))
        sessionStorage.setItem('ecommerce_products_fallback', fallbackData)
        console.log('✅ Saved to sessionStorage as fallback during edit')
        setMessage('⚠️ Warning: Product updated in temporary storage. Data may be lost on page refresh.')
      } catch (fallbackError) {
        console.error('Fallback storage also failed during edit:', fallbackError)
        setMessage('❌ Error: Unable to update product. Please try again or clear browser data.')
      }
      
      setTimeout(() => setMessage(''), 8000)
    }
    
    // إرسال حدث مخصص لتحديث المنتجات في الصفحة الرئيسية
    window.dispatchEvent(new Event('productsUpdated'))
    
    setMessage(`✅ Product "${updatedProduct.title}" updated successfully!`)
    setEditingProduct(null)
    setShowForm(false)
    
    setTimeout(() => setMessage(''), 3000)
  }

  // Function to clear form manually
  const clearForm = () => {
    setNewProduct({
      title: '',
      price: '',
      quantity: 1,
      image: '',
      description: '',
      category: 'electronics'
    })
    setMessage('Form cleared successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  // Function to add new category
  // دالة لحذف كاتجري
  const handleDeleteCategory = (categoryToDelete) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"? This will also remove it from all products.`)) {
      try {
        // حذف الكاتجري من قائمة الكاتجري
        const updatedCategories = categories.filter(cat => cat !== categoryToDelete)
        setCategories(updatedCategories)
        localStorage.setItem('ecommerce_categories', JSON.stringify(updatedCategories))
        
        // تحديث المنتجات التي تستخدم هذه الكاتجري
        const updatedProducts = products.map(product => {
          if (product.category === categoryToDelete) {
            return {
              ...product,
              category: 'Other' // تعيين كاتجري افتراضية
            }
          }
          return product
        })
        
        setProducts(updatedProducts)
        localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts))
        
        // إرسال حدث مخصص لتحديث المنتجات في الصفحة الرئيسية
        window.dispatchEvent(new Event('productsUpdated'))
        
        setMessage(`✅ Category "${categoryToDelete}" deleted successfully! Products moved to "Other" category.`)
        setTimeout(() => setMessage(''), 4000)
        
        console.log(`✅ Category "${categoryToDelete}" deleted and products updated`)
      } catch (error) {
        console.error('Error deleting category:', error)
        setMessage('⚠️ Error deleting category')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    
    if (!newCategory.trim()) {
      setMessage('Please enter a category name')
      return
    }

    const categoryName = newCategory.trim().toLowerCase()
    
    if (categories.includes(categoryName)) {
      setMessage('This category already exists')
      return
    }

    const updatedCategories = [...categories, categoryName]
    setCategories(updatedCategories)
    localStorage.setItem('ecommerce_categories', JSON.stringify(updatedCategories))
    
    setNewCategory('')
    setShowCategoryForm(false)
    setMessage(`Category "${categoryName}" added successfully!`)
    
    setTimeout(() => setMessage(''), 3000)
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Allow access if no users exist (first time setup) or if user is logged in
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 
                          localStorage.getItem('loggedInUser') || 
                          localStorage.getItem('userEmail')
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  if (!currentUserEmail && users.length > 0) {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <div className={`add-products-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="add-products-header">
        <h1>Product Management</h1>
        <p>Add, edit, and manage your products</p>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="admin-actions">
        {!showCategoriesSection && (
          <>
        <button 
              className="add-product-btn"
              onClick={() => {
                setShowForm(!showForm)
                setEditingProduct(null)
              }}
            >
              {showForm ? 'Cancel' : 'Add New Product'}
            </button>

          </>
        )}
        <button // Categories Management button
          className="categories-management-btn"
          onClick={() => {
            setShowCategoriesSection(!showCategoriesSection)
            if (!showCategoriesSection) {
              // Scroll to categories section when showing
              setTimeout(() => {
                const categoriesSection = document.querySelector('.categories-section')
                if (categoriesSection) {
                  categoriesSection.scrollIntoView({ behavior: 'smooth' })
                }
              }, 100)
            }
          }}
          title="Manage product categories"
        >
          {showCategoriesSection ? '⬆️ Back to Top' : '📂 Categories'}
        </button>
      </div>

      {/* Product Form */}
      {showForm && !showCategoriesSection && (
        <div className="product-form-container">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          
          <form onSubmit={editingProduct ? handleEditSubmit : handleSubmit} className="product-form">
          <div className="form-group">
              <label htmlFor="title">Product Title *</label>
            <input
              type="text"
                id="title"
                name="title"
                value={editingProduct ? editingProduct.title : newProduct.title}
                onChange={editingProduct ? handleEditInputChange : handleInputChange}
                placeholder="Enter product title"
              required
            />
          </div>

            <div className="form-row">
          <div className="form-group">
                <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
                  value={editingProduct ? editingProduct.price : newProduct.price}
                  onChange={editingProduct ? handleEditInputChange : handleInputChange}
                  placeholder="0.00"
              step="0.01"
                  min="0"
              required
            />
          </div>

          <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                  onChange={editingProduct ? handleEditInputChange : handleInputChange}
                  placeholder="1"
                  min="1"
              required
            />
              </div>
          </div>

          <div className="form-group">
              <label htmlFor="category">Category *</label>
              <div className="category-selector">
                <button
                  type="button"
                  className="category-dropdown-btn"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {editingProduct ? editingProduct.category : newProduct.category}
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showCategoryDropdown && (
                  <div className="category-dropdown">
                    {categories.map(category => (
                      <div
                        key={category}
                        className="category-option"
                        onClick={() => {
                          if (editingProduct) {
                            setEditingProduct(prev => ({ ...prev, category }))
                          } else {
                            setNewProduct(prev => ({ ...prev, category }))
                          }
                          setShowCategoryDropdown(false)
                        }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>

          <div className="form-group">
              <label htmlFor="image">Product Image *</label>
              <div className="image-upload-container">
            <input
                  type="text"
              id="image"
              name="image"
                  value={editingProduct ? editingProduct.image : newProduct.image}
                  onChange={editingProduct ? handleEditInputChange : handleInputChange}
                  placeholder="Enter image URL (supports: jpg, png, webp, gif)"
              required
            />
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        if (editingProduct) {
                          setEditingProduct(prev => ({
                            ...prev,
                            image: e.target.result
                          }))
                        } else {
                          setNewProduct(prev => ({
                            ...prev,
                            image: e.target.result
                          }))
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="file-input"
                />
                <label htmlFor="imageFile" className="file-label">
                  <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Choose Image
                </label>
                {(editingProduct ? editingProduct.image : newProduct.image) && (
                  <div className="image-preview">
                    <img 
                      src={editingProduct ? editingProduct.image : newProduct.image} 
                      alt="Preview" 
                      loading="eager"
                      decoding="async"
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                      }}
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => {
                        if (editingProduct) {
                          setEditingProduct(prev => ({ ...prev, image: '' }))
                        } else {
                          setNewProduct(prev => ({ ...prev, image: '' }))
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
          </div>

          <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={editingProduct ? editingProduct.description : newProduct.description}
                onChange={editingProduct ? handleEditInputChange : handleInputChange}
                rows="4"
                placeholder="Enter product description"
            />
          </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>

              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
              >
                Cancel
          </button>
            </div>
        </form>
        </div>
      )}

      {/* Products Display Section */}
      {!showCategoriesSection && (
        <div className="products-section">
          <div className="products-header">
            <h2>Products Management ({products.length})</h2>
      </div>

        {products.length === 0 ? (
            <div className="no-products">
              <p>No products added yet.</p>
            </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1)';
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                      style={{
                        opacity: 0,
                        transform: 'scale(0.95)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <div className="image-placeholder" style={{ display: 'none' }}>
                      <span>📷</span>
                      <p>No Image</p>
                    </div>
                    
                    {/* Stock Status Overlay */}
                    <div className="stock-status-overlay">
                      {product.quantity === 0 ? (
                        <span className="out-of-stock-overlay">
                          <span className="stock-icon">❌</span>
                          <span className="stock-text">Out of Stock</span>
                        </span>
                      ) : product.quantity <= 5 ? (
                        <span className="low-stock-overlay">
                          <span className="stock-icon">⚠️</span>
                          <span className="stock-text">Low Stock</span>
                        </span>
                      ) : (
                        <span className="in-stock-overlay">
                          <span className="stock-icon">✅</span>
                          <span className="stock-text">In Stock</span>
                        </span>
                      )}
                    </div>
                    
                    {product.updatedAt && (
                      <div className="updated-badge">Updated</div>
                    )}
                    {product.isProtected && (
                      <div className="protected-badge">🔒 Protected</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="price">${product.price}</p>
                    <p className="quantity">Quantity: {product.quantity || 1}</p>

                    <p className="category">{product.category}</p>
                    {product.description && (
                      <p className="description">{product.description}</p>
                    )}
                    <p className="product-id">ID: {product.id}</p>
                    <p className="created-date">
                      Created: {new Date(product.createdAt).toLocaleDateString()}
                      {product.createdBy && ` by ${product.createdBy}`}
                    </p>
                    {product.updatedAt && (
                      <p className="updated-date">
                        Updated: {new Date(product.updatedAt).toLocaleDateString()}
                        {product.updatedBy && ` by ${product.updatedBy}`}
                      </p>
                    )}
                    {product.isProtected && (
                      <p className="protected-info">
                        🔒 Protected Product - Only yahiapro400@gmail.com and yahiacool2009@gmail.com can modify
                      </p>
                    )}
                </div>
                <div className="product-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        setEditingProduct({
                          ...product,
                          price: product.price.toString(),
                          quantity: product.quantity.toString()
                        })
                        setShowForm(true)
                      }}
                      title="Edit Product"
                    >
                      ✏️ Edit
                    </button>
                  <button 
                    className="delete-btn"
                      onClick={() => {
                        const productToDelete = products.find(p => p.id === product.id)
                        
                        // Check if trying to delete a protected product
                        if (productToDelete && productToDelete.isProtected && !canModifyProtectedAdmin()) {
                          alert('❌ Cannot delete protected products!\n\nOnly yahiapro400@gmail.com and yahiacool2009@gmail.com can delete protected products.')
                          return
                        }
                        
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          const updatedProducts = products.filter(p => p.id !== product.id)
                          setProducts(updatedProducts)
                          
                          try {
                            const limitedProducts = updatedProducts.slice(-50)
                            const compressedData = JSON.stringify(limitedProducts)
                            localStorage.setItem('ecommerce_products', compressedData)
                            
                            const storedData = localStorage.getItem('ecommerce_products')
                            if (!storedData) {
                              throw new Error('Failed to store products')
                            }
                            
                            console.log(`✅ Successfully deleted product. ${limitedProducts.length} products remaining in localStorage`)
                          } catch (error) {
                            console.error('Error deleting product:', error)
                            setMessage('⚠️ Warning: Product deleted but storage may be limited.')
                            setTimeout(() => setMessage(''), 5000)
                          }
                          
                          window.dispatchEvent(new Event('productsUpdated'))
                          
                          setMessage(`Product "${productToDelete.title}" deleted successfully! Remaining products: ${updatedProducts.length}`)
                          setTimeout(() => setMessage(''), 3000)
                        }
                      }}
                      title="Delete Product"
                    >
                      🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Categories Management Section */}
      {showCategoriesSection && (
        <div className="categories-section">
        <div className="categories-header">
          <h2>Categories Management ({categories.length})</h2>
          <div className="categories-actions">
            <button 
              className="add-category-btn"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
            >
              {showCategoryForm ? 'Cancel' : '➕ Add New Category'}
            </button>
            <button 
              className="back-to-top-btn"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              ⬆️ Back to Top
            </button>
          </div>
        </div>

        {showCategoryForm && (
          <div className="category-form">
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label htmlFor="newCategory">Category Name</label>
                <input
                  type="text"
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Add Category</button>
            </form>
          </div>
        )}

        <div className="categories-grid">
          {categories.map(category => (
            <div key={category} className="category-card">
              <div className="category-info">
                <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <p>Products in this category: {products.filter(p => p.category === category).length}</p>
              </div>
              <div className="category-actions">
                <button 
                  className="delete-category-btn"
                  onClick={() => handleDeleteCategory(category)}
                  disabled={category === 'other'}
                  title={category === 'other' ? 'Cannot delete default category' : 'Delete category'}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  )
} 
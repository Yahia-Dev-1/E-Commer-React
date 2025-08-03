import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AddProducts.css'

export default function AddProducts({ darkMode = false }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    quantity: 1,
    image: '',
    description: '',
    category: 'electronics'
  })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [showStats, setShowStats] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState([
    'electronics',
    'clothing', 
    'books',
    'home',
    'sports',
    'other'
  ])

  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Check if user is admin
  useEffect(() => {
    const savedUserEmail = localStorage.getItem('currentUserEmail')
    if (savedUserEmail) {
      const savedUser = JSON.parse(localStorage.getItem('ecommerce_users') || '[]')
        .find(user => user.email === savedUserEmail)
      if (savedUser && ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com'].includes(savedUser.email)) {
        setUser(savedUser)
      } else {
        navigate('/')
        return
      }
    } else {
      navigate('/')
      return
    }
    
    // Load existing products
    const loadProducts = () => {
      const existingProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
      setProducts(existingProducts)
    }
    
    loadProducts()
    
    // مراقبة التغييرات في localStorage للمنتجات
    const handleStorageChange = (e) => {
      if (e.key === 'ecommerce_products') {
        loadProducts()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Load existing categories
    const savedCategories = JSON.parse(localStorage.getItem('ecommerce_categories') || '[]')
    if (savedCategories.length > 0) {
      setCategories(savedCategories)
    }
    
    setIsLoading(false)
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProduct(prev => ({
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
      createdAt: new Date().toISOString()
    }

    // إضافة المنتج الجديد إلى المنتجات الموجودة
    const updatedProducts = [...products, product]
    setProducts(updatedProducts)
    localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts))
    
    // إرسال حدث مخصص لتحديث المنتجات في الصفحة الرئيسية
    window.dispatchEvent(new Event('productsUpdated'))
    
    // الاحتفاظ بالبيانات في النموذج بدلاً من مسحها
    // setNewProduct({
    //   title: '',
    //   price: '',
    //   quantity: 1,
    //   image: '',
    //   description: '',
    //   category: 'electronics'
    // })
    // setShowForm(false)
    
    setMessage(`✅ Product "${product.title}" with ${product.quantity} pieces added successfully! 
    
    📊 Product Details:
    • Title: ${product.title}
    • Price: $${product.price}
    • Quantity: ${product.quantity}
    • Category: ${product.category}
    • Total Products: ${updatedProducts.length}
    
    💡 Tip: You can add more products without clearing the form!`)
    
    // تحديث الإحصائيات تلقائياً
    if (showStats) {
      // الإحصائيات ستتحدث تلقائياً لأنها تعتمد على products state
    }
    
    setTimeout(() => setMessage(''), 3000)
  }

  // Function to delete a product
  const handleDeleteProduct = (productId) => {
    const productToDelete = products.find(product => product.id === productId)
    const updatedProducts = products.filter(product => product.id !== productId)
    setProducts(updatedProducts)
    localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts))
    
    // إرسال حدث مخصص لتحديث المنتجات في الصفحة الرئيسية
    window.dispatchEvent(new Event('productsUpdated'))
    
    setMessage(`Product "${productToDelete.title}" deleted successfully! Remaining products: ${updatedProducts.length}`)
    setTimeout(() => setMessage(''), 3000)
  }

  // Function to calculate product statistics
  const calculateProductStats = () => {
    const stats = {}
    
    products.forEach(product => {
      if (stats[product.title]) {
        stats[product.title].count += (product.quantity || 1)
        stats[product.title].totalPrice += product.price * (product.quantity || 1)
      } else {
        stats[product.title] = {
          count: product.quantity || 1,
          totalPrice: product.price * (product.quantity || 1),
          category: product.category,
          image: product.image
        }
      }
    })
    
    return stats
  }

  const productStats = calculateProductStats()

  // Function to send rejection email
  const sendRejectionEmail = async (orderId, userEmail, reason = '') => {
    try {
      // هنا يمكنك إضافة كود إرسال البريد الإلكتروني الفعلي
      // مثال باستخدام EmailJS أو أي خدمة بريد إلكتروني أخرى
      
      const emailData = {
        to: userEmail,
        subject: 'Order Rejection Notification',
        message: `Dear Customer,\n\nYour order (ID: ${orderId}) has been rejected.\n\nReason: ${reason || 'Order does not meet our requirements'}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nAdmin Team`
      }

      // محاكاة إرسال البريد الإلكتروني
      console.log('Sending rejection email:', emailData)
      
      // يمكنك استبدال هذا بكود إرسال البريد الفعلي
      // مثال: await emailjs.send('service_id', 'template_id', emailData)
      
      setMessage(`Rejection email sent to ${userEmail}`)
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      console.error('Error sending email:', error)
      setMessage('Error sending rejection email')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Function to handle order rejection
  const handleOrderRejection = async (order) => {
    setSelectedOrder(order)
    setShowRejectionForm(true)
  }

  // Function to confirm rejection and send email
  const confirmRejection = async () => {
    if (!selectedOrder) return

    await sendRejectionEmail(
      selectedOrder.id, 
      selectedOrder.email, 
      rejectionReason
    )

    // إزالة الطلب من القائمة (محاكاة)
    // const updatedOrders = orders.filter(order => order.id !== selectedOrder.id)
    // setOrders(updatedOrders)

    setShowRejectionForm(false)
    setRejectionReason('')
    setSelectedOrder(null)
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

  if (!user) {
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
        <p>Add new products and manage existing ones</p>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="admin-actions">
        <button 
          className="add-product-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
        <button 
          className="stats-btn"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? '📊 Hide Statistics' : '📊 Show Statistics'}
        </button>
      </div>

      {showForm && (
        <div className="product-form-container">
          <form className="product-form" onSubmit={handleSubmit}>
            <h3>Add New Product</h3>
            
            <div className="form-group">
              <label htmlFor="title">Product Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProduct.title}
                onChange={handleInputChange}
                required
                placeholder="Enter product title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="1"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Selected Category</label>
                <div className="category-display">
                  <span className="category-badge">{newProduct.category}</span>
                </div>
              </div>
            </div>

            <div className="category-actions">
              <button 
                type="button"
                className="add-category-btn"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
              >
                {showCategoryForm ? 'Cancel' : '➕ Add New Category'}
              </button>
            </div>

            {showCategoryForm && (
              <div className="category-form">
                <h4>Add New Category</h4>
                <div className="form-row">
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
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button 
                      type="button"
                      className="submit-category-btn"
                      onClick={handleAddCategory}
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="image">Product Image *</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setNewProduct(prev => ({
                          ...prev,
                          image: e.target.result
                        }));
                      };
                      reader.readAsDataURL(file);
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
                {newProduct.image && (
                  <div className="image-preview">
                    <img src={newProduct.image} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => setNewProduct(prev => ({ ...prev, image: '' }))}
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
                value={newProduct.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter product description"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Add Product
              </button>
              <button 
                type="button" 
                className="clear-btn"
                onClick={clearForm}
              >
                Clear Form
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showStats && (
        <div className="stats-section">
          <h2>Product Statistics</h2>
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Total Products:</span>
              <span className="summary-value">{products.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Pieces:</span>
              <span className="summary-value">{products.reduce((sum, product) => sum + (product.quantity || 1), 0)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Unique Products:</span>
              <span className="summary-value">{Object.keys(productStats).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Value:</span>
              <span className="summary-value">${products.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0).toFixed(2)}</span>
            </div>
          </div>
          {Object.keys(productStats).length === 0 ? (
            <div className="no-stats">
              <p>No products to show statistics for.</p>
            </div>
          ) : (
            <div className="stats-grid">
              {Object.entries(productStats).map(([productName, stats]) => (
                <div key={productName} className="stat-card">
                  <div className="stat-image">
                    <img src={stats.image} alt={productName} />
                  </div>
                  <div className="stat-info">
                    <h3>{productName}</h3>
                    <div className="stat-details">
                      <div className="stat-item">
                        <span className="stat-label">Quantity:</span>
                        <span className="stat-value">{stats.count}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Value:</span>
                        <span className="stat-value">${stats.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Category:</span>
                        <span className="stat-value">{stats.category}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Average Price:</span>
                        <span className="stat-value">${(stats.totalPrice / stats.count).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="products-section">
        <h2>Existing Products ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products added yet.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.title} />
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="price">${product.price}</p>
                  <p className="quantity">Quantity: {product.quantity || 1}</p>
                  <p className="category">{product.category}</p>
                  {product.description && (
                    <p className="description">{product.description}</p>
                  )}
                  <p className="product-id">ID: {product.id}</p>
                </div>
                <div className="product-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteProduct(product.id)}
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

      {/* Rejection Form Modal */}
      {showRejectionForm && (
        <div className="rejection-modal">
          <div className="rejection-form">
            <h3>Reject Order</h3>
            <p>Order ID: {selectedOrder?.id}</p>
            <p>Customer Email: {selectedOrder?.email}</p>
            
            <div className="form-group">
              <label htmlFor="rejectionReason">Rejection Reason</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
              />
            </div>

            <div className="rejection-actions">
              <button 
                className="confirm-rejection-btn"
                onClick={confirmRejection}
              >
                Send Rejection Email
              </button>
              <button 
                className="cancel-rejection-btn"
                onClick={() => {
                  setShowRejectionForm(false)
                  setRejectionReason('')
                  setSelectedOrder(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
} 
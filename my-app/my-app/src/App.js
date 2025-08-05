import './styles/App.css';
import Nav from './components/nav';
import Cart from './components/cart';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async';
import { useState, useEffect, Suspense, lazy } from 'react'
import database from './utils/database'

// Lazy load components for better performance
const About = lazy(() => import('./components/About'))
const Services = lazy(() => import('./components/Services'))
const AddProducts = lazy(() => import('./components/AddProducts'))
const CategoryManagement = lazy(() => import('./components/CategoryManagement'))
const Cards = lazy(() => import('./components/cards'))
const Login = lazy(() => import('./components/Login'))
const Orders = lazy(() => import('./components/Orders'))
const Modal = lazy(() => import('./components/Modal'))
const Admin = lazy(() => import('./components/Admin'))
const Footer = lazy(() => import('./components/Footer'))

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    background: '#1a1a2e'
  }}>
    <div style={{
      textAlign: 'center',
      color: '#e0e0e0'
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

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation();
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [productsVersion, setProductsVersion] = useState(0) // For forcing re-renders
  // Dark mode is always enabled

  // Load products function
  const loadProducts = () => {
    try {
      const savedProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
      console.log('🔍 App.js: Raw products from localStorage:', savedProducts)
      
      const validProducts = savedProducts.filter(product => 
        product && 
        product.id && 
        product.title && 
        product.description && 
        product.price !== undefined && 
        product.category && 
        product.quantity !== undefined
      )
      
      console.log('🔍 App.js: Valid products after filtering:', validProducts)
      console.log('🔍 App.js: Product titles:', validProducts.map(p => p.title))
      
      setProducts(validProducts)
      console.log(`📦 App.js: Loaded ${validProducts.length} products`)
    } catch (error) {
      console.error('Error loading products in App.js:', error)
      setProducts([])
    }
  }

  // Handle products update
  const handleProductsUpdate = () => {
    console.log('🔄 App.js: Products updated, reloading...')
    // Reload immediately and also with delay to ensure we get the latest data
    loadProducts()
    setProductsVersion(prev => prev + 1)
    console.log('✅ App.js: Products reloaded immediately')
    
    setTimeout(() => {
      loadProducts()
      setProductsVersion(prev => prev + 1)
      console.log('✅ App.js: Products reloaded with delay')
    }, 100)
  }

  // Check for saved user and cart data on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Create admin-test@gmail.com user if it doesn't exist
        const users = database.getUsers();
        if (!users.some(user => user.email === 'admin-test@gmail.com')) {
          try {
            database.registerUser({
              email: 'admin-test@gmail.com',
              password: 'admin123',
              name: 'Admin Test'
            });
            console.log('Created admin-test@gmail.com user in App.js');
          } catch (error) {
            console.log('admin-test@gmail.com already exists:', error.message);
          }
        }

        const savedUserEmail = localStorage.getItem('currentUserEmail')
        const savedCartItems = localStorage.getItem('cartItems')
        
        if (savedUserEmail) {
          const savedUser = database.getUsers().find(user => user.email === savedUserEmail)
          if (savedUser) {
            setUser(savedUser)
          }
        }
        
        if (savedCartItems) {
          try {
            const parsedCartItems = JSON.parse(savedCartItems)
            setCartItems(parsedCartItems)
          } catch (error) {
            console.error('Error loading cart items:', error)
            setCartItems([])
          }
        }

        // Load products initially
        loadProducts()
        
        // Listen for product updates
        window.addEventListener('productsUpdated', handleProductsUpdate)
        
        // Always use dark mode (no need to set since it's always true)
        
        // Clean up localStorage to prevent quota issues
        cleanupLocalStorage()
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
    
    // Cleanup function for event listeners
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate)
    }
  }, [])

  // Additional effect to listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ecommerce_products') {
        console.log('🔄 App.js: localStorage changed, reloading products...')
        loadProducts()
        setProductsVersion(prev => prev + 1)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const addToCart = (product) => {
    if (!user) {
      setPendingProduct(product)
      setShowModal(true)
      return
    }
    
    // التحقق من الكمية المتاحة
    const availableQuantity = checkAvailableQuantity(product.id)
    if (availableQuantity <= 0) {
      alert('Sorry, this product is out of stock and cannot be added to cart!')
      return
    }
    
    // Add product to cart first, then show modal
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      // التحقق من أن الكمية المطلوبة لا تتجاوز المتاح
      const newQuantity = existingItem.quantity + 1
      if (newQuantity > availableQuantity) {
        alert(`Sorry, only ${availableQuantity} items available for this product.`)
        return
      }
      
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: newQuantity }
            : item
        )
        
        // Save to localStorage immediately after updating state
        try {
          // Limit cart items to prevent memory issues
          const limitedItems = updatedItems.slice(-20)
          localStorage.setItem('cartItems', JSON.stringify(limitedItems))
          return limitedItems
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded in addToCart, clearing old data...')
            cleanupLocalStorage()
            alert('Storage was full, some data was cleared. Please try adding the product again.')
          }
          return updatedItems
        }
      })
    } else {
      setCartItems(prevItems => {
        const updatedItems = [...prevItems, { ...product, quantity: 1 }]
        
        // Save to localStorage immediately after updating state
        try {
          // Limit cart items to prevent memory issues
          const limitedItems = updatedItems.slice(-20)
          localStorage.setItem('cartItems', JSON.stringify(limitedItems))
          return limitedItems
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded in addToCart, clearing old data...')
            cleanupLocalStorage()
            alert('Storage was full, some data was cleared. Please try adding the product again.')
          }
          return updatedItems
        }
      })
    }
    
    // Show modal asking if user wants to go to cart or continue shopping
    setShowAddToCartModal(true)
  }



  // دالة للتحقق من الكمية المتاحة
  const checkAvailableQuantity = (productId) => {
    try {
      const existingProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
      const product = existingProducts.find(p => p.id === productId)
      
      // إذا لم نجد المنتج في localStorage، نستخدم الكمية الافتراضية
      if (!product) {
        // الكميات الافتراضية للمنتجات
        const defaultQuantities = {
          1: 10, // Hoodie
          2: 20, // T-Shirt
          3: 5,  // Jeans
          4: 0,  // Sneakers (out of stock)
          5: 15, // Running Shoes
          6: 8,  // Watch
          7: 25, // Backpack
          8: 12  // Cap
        }
        return defaultQuantities[productId] || 0
      }
      
      // التحقق من أن الكمية صحيحة وليست سالبة
      const quantity = Math.max(0, product.quantity || 0)
      
      // إذا كانت الكمية 0، المنتج نفذ مخزونه
      if (quantity === 0) {
        console.log(`Product ${product.title} is out of stock`)
      }
      
      return quantity
    } catch (error) {
      console.error('Error checking available quantity:', error)
      return 0
    }
  }

  const updateCartItemQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== id)
        
        // Save to localStorage immediately
        try {
          // Limit cart items to prevent memory issues
          const limitedItems = updatedItems.slice(-20)
          localStorage.setItem('cartItems', JSON.stringify(limitedItems))
          return limitedItems
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded, clearing old data...')
            cleanupLocalStorage()
            alert('Storage was full, some data was cleared. Please try again.')
          }
          return updatedItems
        }
      })
    } else {
      // التحقق من الكمية المتاحة
      const availableQuantity = checkAvailableQuantity(id)
      let finalQuantity = newQuantity
      
      if (newQuantity > availableQuantity) {
        alert(`Sorry, only ${availableQuantity} items available for this product.`)
        finalQuantity = availableQuantity
      }
      
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.id === id ? { ...item, quantity: finalQuantity } : item
        )
        
        // Save to localStorage immediately
        try {
          // Limit cart items to prevent memory issues
          const limitedItems = updatedItems.slice(-20)
          localStorage.setItem('cartItems', JSON.stringify(limitedItems))
          return limitedItems
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded, clearing old data...')
            cleanupLocalStorage()
            alert('Storage was full, some data was cleared. Please try again.')
          }
          return updatedItems
        }
      })
    }
  }

  // Save cart items to localStorage whenever they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cartItems.length > 0) {
        try {
          // Limit cart items to prevent memory issues
          const limitedItems = cartItems.slice(-20)
          localStorage.setItem('cartItems', JSON.stringify(limitedItems))
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded in useEffect, clearing old data...')
            try {
              // Clear old data and retry with minimal data
              localStorage.removeItem('cartItems')
              localStorage.removeItem('ecommerce_products')
              localStorage.removeItem('ecommerce_orders')
              localStorage.removeItem('ecommerce_users')
              
              const minimalCartItems = cartItems.slice(-10).map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity
              }))
              
              localStorage.setItem('cartItems', JSON.stringify(minimalCartItems))
            } catch (retryError) {
              console.error('Failed to save cart in useEffect:', retryError)
            }
          }
        }
      } else {
        localStorage.removeItem('cartItems')
      }
    }, 500) // Increased debounce to 500ms

    return () => clearTimeout(timeoutId)
  }, [cartItems])

  // دالة لتنظيف اللوكل ستورج
  const cleanupLocalStorage = () => {
    try {
      // حذف البيانات غير الضرورية
      const keysToRemove = [
        'react-devtools',
        'react-devtools::Dock',
        'react-devtools::Panel',
        'react-devtools::Tab',
        'react-devtools::Tab::DevTools',
        'react-devtools::Tab::Components',
        'react-devtools::Tab::Profiler',
        'react-devtools::Tab::Settings'
      ]
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('LocalStorage cleaned successfully')
    } catch (error) {
      console.error('Error cleaning localStorage:', error)
    }
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cartItems')
  }

  const createOrder = (shippingData = null) => {
    if (cartItems.length === 0) return
    
    const newOrder = {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      status: 'Processing',
      userId: user?.id,
      userEmail: user?.email,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shipping: shippingData || {}
    }
    
    // حفظ الطلب في قاعدة البيانات
    const savedOrder = database.saveOrder(newOrder)
    setOrders(prevOrders => [savedOrder, ...prevOrders])
    
    // طرح الكمية المباعة من المنتجات
    updateProductQuantities(cartItems)
    
    setCartItems([])
    localStorage.removeItem('cartItems')
  }

  // دالة جديدة لطرح الكمية المباعة من المنتجات
  const updateProductQuantities = (purchasedItems) => {
    try {
      // جلب المنتجات الحالية من localStorage
      const existingProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
      
      // قائمة المنتجات التي نفدت مخزونها
      const outOfStockProducts = []
      
      // تحديث الكميات لكل منتج تم شراؤه
      const updatedProducts = existingProducts.map(product => {
        const purchasedItem = purchasedItems.find(item => item.id === product.id)
        if (purchasedItem) {
          const oldQuantity = product.quantity || 1
          const newQuantity = Math.max(0, oldQuantity - purchasedItem.quantity)
          
          // إذا كان المنتج نفذ مخزونه بعد الطلب
          if (oldQuantity > 0 && newQuantity === 0) {
            outOfStockProducts.push(product.title)
          }
          
          return {
            ...product,
            quantity: newQuantity
          }
        }
        return product
      })
      
      // حفظ المنتجات المحدثة
      localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts))
      
      // إرسال حدث مخصص لتحديث المنتجات في الصفحة الرئيسية
      window.dispatchEvent(new Event('productsUpdated'))
      
      console.log('Product quantities updated after purchase')
      
      // إظهار رسالة للمنتجات التي نفدت مخزونها (تم إزالتها)
      // if (outOfStockProducts.length > 0) {
      //   const message = `تم إغلاق المنتجات التالية لانتهاء مخزونها:\n${outOfStockProducts.join('\n')}\n\nسيتم إعادة فتحها عند إضافة كمية جديدة من Admin.`
      //   alert(message)
      // }
      
    } catch (error) {
      console.error('Error updating product quantities:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    // Save current user email to localStorage for admin access
    localStorage.setItem('currentUserEmail', userData.email)
    // Check if there's a pending product to add to cart
    if (pendingProduct) {
      // Add the pending product to cart first
      const existingItem = cartItems.find(item => item.id === pendingProduct.id)
      
      if (existingItem) {
        setCartItems(prevItems => {
          const updatedItems = prevItems.map(item => 
            item.id === pendingProduct.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
          
          // Save to localStorage immediately
          try {
            localStorage.setItem('cartItems', JSON.stringify(updatedItems))
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              console.warn('LocalStorage quota exceeded in handleLogin, clearing old data...')
              cleanupLocalStorage()
              alert('Storage was full, some data was cleared. Please try again.')
            }
          }
          
          return updatedItems
        })
      } else {
        setCartItems(prevItems => {
          const updatedItems = [...prevItems, { ...pendingProduct, quantity: 1 }]
          
          // Save to localStorage immediately
          try {
            localStorage.setItem('cartItems', JSON.stringify(updatedItems))
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              console.warn('LocalStorage quota exceeded in handleLogin, clearing old data...')
              cleanupLocalStorage()
              alert('Storage was full, some data was cleared. Please try again.')
            }
          }
          
          return updatedItems
        })
      }
      
      // Then show the modal
      setShowAddToCartModal(true)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setCartItems([])
    // Remove current user email and cart items from localStorage
    localStorage.removeItem('currentUserEmail')
    localStorage.removeItem('cartItems')
  }

  const handleModalConfirm = () => {
    setShowModal(false)
    navigate('/login')
  }

  const handleModalClose = () => {
    setShowModal(false)
    setPendingProduct(null)
  }

  const handleAddToCartAfterLogin = () => {
    // Product is already added to cart, navigate to cart
    setShowAddToCartModal(false)
    setPendingProduct(null)
    navigate('/cart')
  }

  const handleAddToCartModalClose = () => {
    setShowAddToCartModal(false)
    setPendingProduct(null)
  }

  // Calculate cart count - show number of unique items
  const cartCount = cartItems.length

  // Function to toggle dark mode (disabled - always dark)
  // Dark mode is always enabled (no toggle needed)

  // Apply dark mode to body (always dark)
  useEffect(() => {
    document.body.classList.add('dark-mode')
  }, [])

  // Show loading screen while checking saved user
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="dark-mode">
      <Nav cartItemsCount={cartCount} user={user} onLogout={handleLogout} darkMode={true} toggleDarkMode={undefined} />
      <Routes>
        <Route path='/' element={
          <Suspense fallback={<LoadingSpinner />}>
            <Cards 
              addToCart={addToCart} 
              darkMode={true} 
              products={products}
              productsVersion={productsVersion}
            />
          </Suspense>
        } />
        <Route path='/about' element={
          <Suspense fallback={<LoadingSpinner />}>
            <About darkMode={true} />
          </Suspense>
        } />

        <Route path='/services' element={
          <Suspense fallback={<LoadingSpinner />}>
            <Services darkMode={true} />
          </Suspense>
        } />
        <Route path='/cart' element={
          user ? (
            <Suspense fallback={<LoadingSpinner />}>
              <Cart 
                cartItems={cartItems} 
                updateQuantity={updateCartItemQuantity}
                clearCart={clearCart}
                createOrder={createOrder}
                darkMode={true}
              />
            </Suspense>
          ) : (
            <div className="login-prompt">
              <h2>Login Required</h2>
              <p>Please login to view your cart</p>
              <button onClick={() => navigate('/login')} className="login-btn">
                Login
              </button>
            </div>
          )
        } />
        <Route path='/login' element={
          <Suspense fallback={<LoadingSpinner />}>
            <Login onLogin={handleLogin} darkMode={true} />
          </Suspense>
        } />
        <Route path='/orders' element={
          user ? (
            <Suspense fallback={<LoadingSpinner />}>
              <Orders user={user} orders={orders} darkMode={true} />
            </Suspense>
          ) : (
            <div className="login-prompt">
              <h2>Login Required</h2>
              <p>Please login to view your orders</p>
              <button onClick={() => navigate('/login')} className="login-btn">
                Login
              </button>
            </div>
          )
        } />
        <Route path='/admin' element={
          <Suspense fallback={<LoadingSpinner />}>
            <Admin darkMode={true} />
          </Suspense>
        } />
        <Route path='/add-products' element={
          <Suspense fallback={<LoadingSpinner />}>
            <AddProducts 
              darkMode={true} 
              products={products}
              productsVersion={productsVersion}
            />
          </Suspense>
        } />
        <Route path='/category-management' element={
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryManagement darkMode={true} />
          </Suspense>
        } />
      </Routes>
      {/* إظهار الفوتر في كل الصفحات ما عدا صفحة اللوجين و My Orders والأدمن والسلة */}
      {location.pathname !== '/login' && 
       location.pathname !== '/orders' && 
       location.pathname !== '/admin' && 
       location.pathname !== '/add-products' && 
       location.pathname !== '/category-management' && 
       location.pathname !== '/cart' && 
        <Suspense fallback={<LoadingSpinner />}>
          <Footer darkMode={true} />
        </Suspense>
      }
      <Suspense fallback={<LoadingSpinner />}>
        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title="Login Required"
          message="You need to login to add items to your cart. Would you like to go to the login page?"
          onConfirm={handleModalConfirm}
        />
        <Modal
          isOpen={showAddToCartModal}
          onClose={handleAddToCartModalClose}
          title="Product Added"
          message={`"${pendingProduct?.title}" has been added to your cart.`}
          onAddToCart={handleAddToCartAfterLogin}
          showAddToCart={true}
        />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter basename="/E-Commer-React">
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

import './styles/App.css';
import Nav from './components/nav';
import Cart from './components/cart';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import About from './components/About'
import Services from './components/Services'
import AddProducts from './components/AddProducts'
import Cards from './components/cards'
import Login from './components/Login'
import Orders from './components/Orders'
import Modal from './components/Modal'
import Admin from './components/Admin'
import { useState, useEffect } from 'react'
import database from './utils/database'

function AppContent() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // Check for saved user and cart data on component mount
  useEffect(() => {
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

    // Always use dark mode
    setDarkMode(true)
    
    setIsLoading(false)
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
      
      setCartItems(prevItems => prevItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    } else {
      setCartItems(prevItems => [...prevItems, { ...product, quantity: 1 }])
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
      setCartItems(prevItems => prevItems.filter(item => item.id !== id))
    } else {
      // التحقق من الكمية المتاحة
      const availableQuantity = checkAvailableQuantity(id)
      let finalQuantity = newQuantity
      
      if (newQuantity > availableQuantity) {
        alert(`Sorry, only ${availableQuantity} items available for this product.`)
        finalQuantity = availableQuantity
      }
      
      setCartItems(prevItems => prevItems.map(item => 
        item.id === id ? { ...item, quantity: finalQuantity } : item
      ))
      
      // Save cart items to localStorage
      const updatedCartItems = cartItems.map(item => 
        item.id === id ? { ...item, quantity: finalQuantity } : item
      ).filter(item => item.quantity > 0)
      
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))
    }
  }

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
    } else {
      localStorage.removeItem('cartItems')
    }
  }, [cartItems])

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
      
      // إظهار رسالة للمنتجات التي نفدت مخزونها
      if (outOfStockProducts.length > 0) {
        const message = `تم إغلاق المنتجات التالية لانتهاء مخزونها:\n${outOfStockProducts.join('\n')}\n\nسيتم إعادة فتحها عند إضافة كمية جديدة من Admin.`
        alert(message)
      }
      
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
        setCartItems(prevItems => prevItems.map(item => 
          item.id === pendingProduct.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        setCartItems(prevItems => [...prevItems, { ...pendingProduct, quantity: 1 }])
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
  const toggleDarkMode = () => {
    // Dark mode is always enabled
    setDarkMode(true)
  }

  // Apply dark mode to body (always dark)
  useEffect(() => {
    document.body.classList.add('dark-mode')
  }, [])

  // Show loading screen while checking saved user
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
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
  }

  return (
    <div className="dark-mode">
      <Nav cartItemsCount={cartCount} user={user} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Routes>
        <Route path='/' element={
          <Cards addToCart={addToCart} darkMode={darkMode} />
        } />
        <Route path='/about' element={<About darkMode={darkMode} />} />

        <Route path='/services' element={<Services darkMode={darkMode} />} />
        <Route path='/cart' element={
          user ? (
            <Cart 
              cartItems={cartItems} 
              updateQuantity={updateCartItemQuantity}
              clearCart={clearCart}
              createOrder={createOrder}
              darkMode={darkMode}
            />
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
        <Route path='/login' element={<Login onLogin={handleLogin} darkMode={darkMode} />} />
        <Route path='/orders' element={
          user ? (
            <Orders user={user} orders={orders} darkMode={darkMode} />
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
        <Route path='/admin' element={<Admin darkMode={darkMode} />} />
        <Route path='/add-products' element={<AddProducts darkMode={darkMode} />} />
      </Routes>
      
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
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/E-Commer-React">
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

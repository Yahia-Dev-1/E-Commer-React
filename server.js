const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { readData, writeData, getNextId } = require('./server/utils/storage');
const { validateProduct, validateUser, validateLogin, validateOrder } = require('./server/utils/validation');
const { isAdmin, isAuthenticated } = require('./server/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Check if we're in a Vercel environment
if (process.env.VERCEL) {
  console.log("Running in Vercel environment");
} else {
  // Serve static files from build directory (only when running locally)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
  }
}

// Initialize default data if files don't exist
function initializeDefaultData() {
  const productsPath = path.join(__dirname, 'server/data/products.json');
  const usersPath = path.join(__dirname, 'server/data/users.json');
  const ordersPath = path.join(__dirname, 'server/data/orders.json');
  
  if (!fs.existsSync(productsPath)) {
    const defaultProducts = [
      {
        id: 1,
        title: "Hoodie",
        description: "Comfortable cotton hoodie",
        price: 29.99,
        quantity: 10,
        image: "https://via.placeholder.com/400x400?text=Hoodie",
        category: "clothing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "T-Shirt",
        description: "Casual cotton t-shirt",
        price: 19.99,
        quantity: 20,
        image: "https://via.placeholder.com/400x400?text=T-Shirt",
        category: "clothing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    writeData('products.json', defaultProducts);
  }
  
  if (!fs.existsSync(usersPath)) {
    const defaultUsers = [
      {
        id: 1,
        email: "yahiapro400@gmail.com",
        password: "yahia2024",
        name: "Yahia Pro",
        createdAt: new Date().toISOString(),
        orders: [],
        isProtected: true
      },
      {
        id: 2,
        email: "yahiacool2009@gmail.com",
        password: "yahia2009",
        name: "Yahia Cool",
        createdAt: new Date().toISOString(),
        orders: [],
        isProtected: true
      }
    ];
    writeData('users.json', defaultUsers);
    
    // Initialize admin emails
    const adminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com'];
    writeData('admin_emails.json', adminEmails);
  }
  
  if (!fs.existsSync(ordersPath)) {
    writeData('orders.json', []);
  }
}

// Initialize data on startup
initializeDefaultData();

// ==================== PRODUCTS API ====================

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = readData('products.json');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

// Get latest products
app.get('/api/products/latest', (req, res) => {
  try {
    const products = readData('products.json');
    const sortedProducts = [...products].sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    res.json(sortedProducts);
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res.status(500).json({ error: 'Failed to fetch latest products', message: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const products = readData('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product', message: error.message });
  }
});

// Create product (Admin only)
app.post('/api/products', isAdmin, (req, res) => {
  try {
    const validation = validateProduct(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const products = readData('products.json');
    const newProduct = {
      ...req.body,
      id: getNextId(products),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    writeData('products.json', products);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', isAdmin, (req, res) => {
  try {
    const products = readData('products.json');
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const validation = validateProduct({ ...products[index], ...req.body });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    products[index] = { 
      ...products[index], 
      ...req.body, 
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString() 
    };
    
    writeData('products.json', products);
    res.json(products[index]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', message: error.message });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', isAdmin, (req, res) => {
  try {
    const products = readData('products.json');
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const deletedProduct = products.splice(index, 1)[0];
    writeData('products.json', products);
    
    res.json(deletedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
});

// ==================== USERS API ====================

// Get all users (Admin only)
app.get('/api/users', isAdmin, (req, res) => {
  try {
    const users = readData('users.json');
    // Don't send passwords in response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

// Get single user
app.get('/api/users/:id', isAuthenticated, (req, res) => {
  try {
    const users = readData('users.json');
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only return password if it's the user's own account or admin
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

// Register new user
app.post('/api/users/register', (req, res) => {
  try {
    const validation = validateUser(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const users = readData('users.json');
    
    // Check if user already exists
    if (users.some(u => u.email.toLowerCase() === req.body.email.toLowerCase())) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const newUser = {
      ...req.body,
      id: getNextId(users),
      createdAt: new Date().toISOString(),
      orders: [],
      isProtected: false
    };
    
    users.push(newUser);
    writeData('users.json', users);
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user', message: error.message });
  }
});

// Login user
app.post('/api/users/login', (req, res) => {
  try {
    const validation = validateLogin(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const users = readData('users.json');
    const user = users.find(u => 
      u.email.toLowerCase() === req.body.email.toLowerCase() && 
      u.password === req.body.password
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
});

// Update user
app.put('/api/users/:id', isAuthenticated, (req, res) => {
  try {
    const users = readData('users.json');
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent modification of protected admins
    if (users[index].isProtected && req.userEmail !== users[index].email) {
      return res.status(403).json({ error: 'Cannot modify protected admin account' });
    }
    
    const updatedUser = {
      ...users[index],
      ...req.body,
      id, // Ensure ID doesn't change
      isProtected: users[index].isProtected // Preserve protection status
    };
    
    users[index] = updatedUser;
    writeData('users.json', users);
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', isAdmin, (req, res) => {
  try {
    const users = readData('users.json');
    const id = parseInt(req.params.id);
    const userToDelete = users.find(u => u.id === id);
    
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deletion of protected admins
    if (userToDelete.isProtected) {
      return res.status(403).json({ error: 'Cannot delete protected admin account' });
    }
    
    const filteredUsers = users.filter(u => u.id !== id);
    writeData('users.json', filteredUsers);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

// ==================== ORDERS API ====================

// Get all orders (Admin only)
app.get('/api/orders', isAdmin, (req, res) => {
  try {
    const orders = readData('orders.json');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

// Get user orders
app.get('/api/orders/user/:userEmail', isAuthenticated, (req, res) => {
  try {
    const orders = readData('orders.json');
    const userOrders = orders.filter(o => o.userEmail === req.params.userEmail);
    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders', message: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', isAuthenticated, (req, res) => {
  try {
    const orders = readData('orders.json');
    const order = orders.find(o => o.id === parseInt(req.params.id));
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Only allow access if user owns the order or is admin
    const users = readData('users.json');
    const isUserAdmin = users.some(u => u.email === req.userEmail && u.isProtected);
    
    if (order.userEmail !== req.userEmail && !isUserAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order', message: error.message });
  }
});

// Create order
app.post('/api/orders', isAuthenticated, (req, res) => {
  try {
    const validation = validateOrder(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    // Verify product quantities
    const products = readData('products.json');
    const insufficientStock = [];
    
    req.body.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        insufficientStock.push(`Product ${item.name} not found`);
      } else if (product.quantity < item.quantity) {
        insufficientStock.push(`Insufficient stock for ${item.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
      }
    });
    
    if (insufficientStock.length > 0) {
      return res.status(400).json({ 
        error: 'Insufficient stock', 
        errors: insufficientStock 
      });
    }
    
    // Update product quantities
    req.body.items.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.id);
      if (productIndex !== -1) {
        products[productIndex].quantity -= item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }
    });
    writeData('products.json', products);
    
    // Create order
    const orders = readData('orders.json');
    const newOrder = {
      ...req.body,
      id: getNextId(orders),
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      status: 'Processing',
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeData('orders.json', orders);
    
    // Update user's orders list
    const users = readData('users.json');
    const userIndex = users.findIndex(u => u.email === req.body.userEmail);
    if (userIndex !== -1) {
      users[userIndex].orders.push(newOrder.id);
      writeData('users.json', users);
    }
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id/status', isAdmin, (req, res) => {
  try {
    const orders = readData('orders.json');
    const id = parseInt(req.params.id);
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const validStatuses = ['Processing', 'Approved', 'Rejected', 'Shipped', 'Delivered'];
    const newStatus = req.body.status;
    
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ 
        error: 'Invalid status', 
        validStatuses 
      });
    }
    
    orders[index].status = newStatus;
    orders[index].updatedAt = new Date().toISOString();
    
    writeData('orders.json', orders);
    res.json(orders[index]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status', message: error.message });
  }
});

// Delete order (Admin only)
app.delete('/api/orders/:id', isAdmin, (req, res) => {
  try {
    const orders = readData('orders.json');
    const id = parseInt(req.params.id);
    const orderToDelete = orders.find(o => o.id === id);
    
    if (!orderToDelete) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Restore product quantities
    const products = readData('products.json');
    orderToDelete.items.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.id);
      if (productIndex !== -1) {
        products[productIndex].quantity += item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }
    });
    writeData('products.json', products);
    
    // Remove order
    const filteredOrders = orders.filter(o => o.id !== id);
    writeData('orders.json', filteredOrders);
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order', message: error.message });
  }
});

// ==================== ADMIN API ====================

// Get admin emails
app.get('/api/admin/emails', isAdmin, (req, res) => {
  try {
    const users = readData('users.json');
    const adminEmails = users
      .filter(user => user.isProtected)
      .map(user => user.email);
    
    // Also check for stored admin emails
    const storedAdminEmails = readData('admin_emails.json');
    const allAdminEmails = [...new Set([...adminEmails, ...storedAdminEmails])];
    
    res.json(allAdminEmails);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    res.status(500).json({ error: 'Failed to fetch admin emails', message: error.message });
  }
});

// Add admin email
app.post('/api/admin/emails', isAdmin, (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    const users = readData('users.json');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const adminEmails = readData('admin_emails.json');
    if (!adminEmails.includes(email)) {
      adminEmails.push(email);
      writeData('admin_emails.json', adminEmails);
    }
    
    res.json({ message: 'Admin email added successfully', email });
  } catch (error) {
    console.error('Error adding admin email:', error);
    res.status(500).json({ error: 'Failed to add admin email', message: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (only if not in Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📁 Data directory: ${path.join(__dirname, 'server/data')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;

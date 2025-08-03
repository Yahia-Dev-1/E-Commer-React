import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';
import database from '../utils/database';

export default function Admin({ darkMode = false }) {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  // const [currentUser, setCurrentUser] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    checkAuthorization();
    loadData();
    
    // Create admin-test@gmail.com user if it doesn't exist
    const users = JSON.parse(localStorage.getItem('ecommerce_users') || '[]');
    if (!users.some(user => user.email === 'admin-test@gmail.com')) {
      const newAdminUser = {
        id: Date.now(),
        email: 'admin-test@gmail.com',
        password: 'admin123',
        name: 'Admin Test',
        createdAt: new Date().toISOString(),
        orders: []
      };
      users.push(newAdminUser);
      localStorage.setItem('ecommerce_users', JSON.stringify(users));
      console.log('Created admin-test@gmail.com user successfully');
    }
    
    // Create new regular admin user
    if (!users.some(user => user.email === 'admin@gmail.com')) {
      const newRegularAdmin = {
        id: Date.now() + 1,
        email: 'admin@gmail.com',
        password: 'admin123',
        name: 'Regular Admin',
        createdAt: new Date().toISOString(),
        orders: []
      };
      users.push(newRegularAdmin);
      localStorage.setItem('ecommerce_users', JSON.stringify(users));
      console.log('Created admin@gmail.com user successfully');
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [showAllUsers, isAuthorized]);

  const checkAuthorization = () => {
    // Get admin emails from localStorage or use default list
    const savedAdminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
    const defaultAdminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com', 'admin-test@gmail.com', 'admin@gmail.com'];
    const adminEmails = savedAdminEmails.length > 0 ? savedAdminEmails : defaultAdminEmails;
    
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    if (currentUserEmail && adminEmails.includes(currentUserEmail)) {
      setIsAuthorized(true);
      // setCurrentUser(currentUserEmail);
    } else {
      setIsAuthorized(false);
      // setCurrentUser(null);
    }
  };

  const loadData = () => {
    setLoading(true);
    const allUsers = database.getUsers();
    const allOrders = database.getOrders();
    
    // Add admin-test@gmail.com if it doesn't exist
    if (!allUsers.some(user => user.email === 'admin-test@gmail.com')) {
      try {
        database.registerUser({
          email: 'admin-test@gmail.com',
          password: 'admin123',
          name: 'Admin Test'
        });
        console.log('Added admin-test@gmail.com user');
      } catch (error) {
        console.log('admin-test@gmail.com already exists or error occurred:', error.message);
      }
    }
    
    // Filter users to show only specific admin accounts
    const savedAdminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
    const defaultAdminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com', 'admin-test@gmail.com', 'admin@gmail.com'];
    const adminEmails = savedAdminEmails.length > 0 ? savedAdminEmails : defaultAdminEmails;
    const filteredUsers = allUsers.filter(user => adminEmails.includes(user.email));
    
    // Show admin users by default, or all users if toggle is on
    const usersToShow = showAllUsers ? allUsers : filteredUsers;
    
    setUsers(usersToShow);
    setOrders(allOrders);
    setLastSaveTime(database.getLastSaveTime());
    setLoading(false);
  };

  const deleteUser = (userId) => {
    const userToDelete = users.find(user => user.id === userId);
    
    if (!userToDelete) {
      alert('User not found!');
      return;
    }

    // Check if trying to delete a protected admin
    const protectedAdmins = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com'];
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    if (protectedAdmins.includes(userToDelete.email)) {
      alert('❌ Cannot delete protected admin accounts!\n\nOnly yahiapro400@gmail.com and yahiacool2009@gmail.com can delete protected admins.');
      return;
    }

    // Check if current user is authorized to delete admins
    const adminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
    const isCurrentUserAdmin = adminEmails.includes(currentUserEmail);
    
    if (adminEmails.includes(userToDelete.email) && !protectedAdmins.includes(currentUserEmail)) {
      alert('❌ Only protected admins can delete other admin accounts!\n\nContact yahiapro400@gmail.com or yahiacool2009@gmail.com to delete admin accounts.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${userToDelete.email}?`)) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('ecommerce_users', JSON.stringify(updatedUsers));
      
      // Remove from admin list if it's an admin
      if (adminEmails.includes(userToDelete.email)) {
        const updatedAdminEmails = adminEmails.filter(email => email !== userToDelete.email);
        localStorage.setItem('admin_emails', JSON.stringify(updatedAdminEmails));
      }
      
      alert(`✅ User ${userToDelete.email} has been deleted successfully!`);
      loadData();
    }
  };

  const rejectOrder = (orderId) => {
    if (window.confirm('Are you sure you want to reject this order?')) {
      const order = orders.find(o => o.id === orderId);
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: 'rejected' } : order
      );
      localStorage.setItem('ecommerce_orders', JSON.stringify(updatedOrders));
      
      // Restore product quantities when order is rejected
      restoreProductQuantities(order);
      
      // Send notification to user
      addRejectionNotification(order);
      
      loadData();
    }
  };

  const approveOrder = (orderId) => {
    if (window.confirm('Are you sure you want to approve this order?')) {
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: 'approved' } : order
      );
      localStorage.setItem('ecommerce_orders', JSON.stringify(updatedOrders));
      loadData();
    }
  };

  const deleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone!')) {
      const order = orders.find(o => o.id === orderId);
      const updatedOrders = orders.filter(order => order.id !== orderId);
      localStorage.setItem('ecommerce_orders', JSON.stringify(updatedOrders));
      
      // Restore product quantities when order is deleted
      restoreProductQuantities(order);
      
      // Send deletion notification to user
      addDeletionNotification(order);
      
      loadData();
    }
  };

  const addRejectionNotification = (order) => {
    // Store rejection notification in localStorage
    const notifications = JSON.parse(localStorage.getItem('order_notifications') || '[]');
    const notification = {
      id: Date.now(),
      type: 'rejection',
      orderId: order.id,
      orderNumber: order.orderNumber,
      userEmail: order.userEmail,
      message: `Your order #${order.orderNumber} has been rejected. Please contact us for more information.`,
      date: new Date().toISOString(),
      read: false
    };
    notifications.push(notification);
    localStorage.setItem('order_notifications', JSON.stringify(notifications));
    
    console.log('Rejection notification added for:', order.userEmail);
    console.log('Notification:', notification);
  };

  const addDeletionNotification = (order) => {
    // Store deletion notification in localStorage
    const notifications = JSON.parse(localStorage.getItem('order_notifications') || '[]');
    const notification = {
      id: Date.now(),
      type: 'deletion',
      orderId: order.id,
      orderNumber: order.orderNumber,
      userEmail: order.userEmail,
      message: `Your order #${order.orderNumber} has been deleted. If you have any questions, please contact our support team.`,
      date: new Date().toISOString(),
      read: false
    };
    notifications.push(notification);
    localStorage.setItem('order_notifications', JSON.stringify(notifications));
    
    console.log('Deletion notification added for:', order.userEmail);
    console.log('Notification:', notification);
  };

  // Function to restore product quantities when order is rejected or deleted
  const restoreProductQuantities = (order) => {
    try {
      // Get current products from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
      
      // Update quantities for each product in the order
      const updatedProducts = existingProducts.map(product => {
        const orderItem = order.items.find(item => item.id === product.id)
        if (orderItem) {
          // Add sold quantity back to product
          const newQuantity = (product.quantity || 0) + orderItem.quantity
          return {
            ...product,
            quantity: newQuantity
          }
        }
        return product
      })
      
      // Save updated products
      localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts))
      
      console.log('Product quantities restored after order rejection/deletion')
      console.log('Order items restored:', order.items)
    } catch (error) {
      console.error('Error restoring product quantities:', error)
    }
  }



  // Function to add local notifications when product is deleted
  const addProductDeletionNotification = (product) => {
    // Get all users to notify them about product deletion
    const users = JSON.parse(localStorage.getItem('ecommerce_users') || '[]');
    
    if (users.length === 0) {
      alert('❌ No users found to notify.');
      return;
    }
    
    // Add local notification for all users
    const notifications = JSON.parse(localStorage.getItem('ecommerce_notifications') || '[]');
    
    users.forEach(user => {
      const notification = {
        id: Date.now() + Math.random(),
        userId: user.id,
        title: 'Product Deleted',
        message: `The product "${product.title}" has been removed from our store.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      notifications.push(notification);
    });
    
    localStorage.setItem('ecommerce_notifications', JSON.stringify(notifications));
    
    alert(`✅ Product "${product.title}" has been deleted successfully!\n\n📋 Local notifications have been added for ${users.length} users.`);
  };



  const clearDatabase = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
      database.clearDatabase();
      setUsers([]);
      setOrders([]);
      setLastSaveTime(null);
    }
  };



  const addNewAdmin = () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      setAdminMessage('Please fill in all fields');
      return;
    }

    if (newAdminPassword.length < 6) {
      setAdminMessage('Password must be at least 6 characters');
      return;
    }

    try {
      // Create new admin user
      const newAdminUser = {
        id: Date.now(),
        email: newAdminEmail,
        password: newAdminPassword,
        name: newAdminName,
        createdAt: new Date().toISOString(),
        orders: []
      };

      // Add to localStorage
      const users = JSON.parse(localStorage.getItem('ecommerce_users') || '[]');
      users.push(newAdminUser);
      localStorage.setItem('ecommerce_users', JSON.stringify(users));

      // Add to admin list
      const adminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
      if (!adminEmails.includes(newAdminEmail)) {
        adminEmails.push(newAdminEmail);
        localStorage.setItem('admin_emails', JSON.stringify(adminEmails));
      }

      setAdminMessage('Admin added successfully!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      
      // Reload data
      loadData();
      
      setTimeout(() => {
        setAdminMessage('');
      }, 3000);
    } catch (error) {
      setAdminMessage('Error adding admin: ' + error.message);
    }
  };

  // Function to add the specific admin user
  const addSpecificAdmin = () => {
    try {
      const adminEmail = 'amrkhaled10sa@gmail.com';
      const adminPassword = 'amr2009';
      const adminName = 'Amr Khaled';

      // Create admin user
      const newAdminUser = {
        id: Date.now(),
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        createdAt: new Date().toISOString(),
        orders: []
      };

      // Add to localStorage
      const users = JSON.parse(localStorage.getItem('ecommerce_users') || '[]');
      
      // Check if user already exists
      const existingUser = users.find(user => user.email === adminEmail);
      if (existingUser) {
        alert('Admin user already exists!');
        return;
      }
      
      users.push(newAdminUser);
      localStorage.setItem('ecommerce_users', JSON.stringify(users));

      // Add to admin list
      const adminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
      if (!adminEmails.includes(adminEmail)) {
        adminEmails.push(adminEmail);
        localStorage.setItem('admin_emails', JSON.stringify(adminEmails));
      }

      alert('Admin user added successfully!\n\nEmail: amrkhaled10sa@gmail.com\nPassword: amr2009');
      
      // Reload data
      loadData();
    } catch (error) {
      alert('Error adding admin: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthorized) {
    return (
      <div className={`admin-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="unauthorized">
          <div className="unauthorized-content">
            <h1>Access Denied</h1>
            <p>You are not authorized to access the admin dashboard.</p>
            <p>Only authorized admin accounts can access this page.</p>
            <div className="unauthorized-info">
              <h3>Authorized Admin Accounts:</h3>
              <ul>
                <li>yahiapro400@gmail.com</li>
                <li>yahiacool2009@gmail.com</li>
              </ul>
            </div>
            <button 
              className="back-btn" 
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`admin-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-container ${darkMode ? 'dark-mode' : ''}`}>
             <div className="admin-header">
         <h1>Admin Dashboard</h1>
                 <div className="admin-stats">
           <div className="stat-card">
             <h3>Admin Users</h3>
             <p>{users.length}</p>
           </div>
           <div className="stat-card">
             <h3>Orders</h3>
             <p>{orders.length}</p>
           </div>
           <div className="stat-card">
             <h3>Total Sales</h3>
             <p>${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
           </div>
           <div className="stat-card">
             <h3>Products</h3>
             <p>{(() => {
               const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
               return products.length;
             })()}</p>
           </div>
           <div className="stat-card">
             <h3>Last Save</h3>
             <p>{lastSaveTime ? formatShortDate(lastSaveTime) : 'Never'}</p>
           </div>
         </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Admin Users ({users.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage-admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-admins')}
        >
          Manage Admins
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>{showAllUsers ? 'All Users List' : 'Admin Users List'}</h2>
              <div className="header-actions">
                <button 
                  className={`toggle-btn ${showAllUsers ? 'active' : ''}`}
                  onClick={() => setShowAllUsers(!showAllUsers)}
                >
                  {showAllUsers ? 'Show Admin Only' : 'Show All Users'}
                </button>
                <button className="refresh-btn" onClick={loadData}>
                  Refresh Data
                </button>
              </div>
            </div>
            
            {users.length === 0 ? (
              <div className="no-data">
                <p>No admin users found</p>
              </div>
            ) : (
              <div className="users-list">
                {users.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                      <p className="user-date">Registration Date: {formatDate(user.createdAt)}</p>
                      <p className="user-orders">Number of Orders: {user.orders?.length || 0}</p>
                    </div>
                    <div className="user-actions">
                                              <button 
                          className="delete-btn"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Orders List</h2>
              <button className="refresh-btn" onClick={loadData}>
                Refresh Data
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div className="no-data">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                                         <div className="order-info">
                       <h3>Order #{order.orderNumber}</h3>
                       <p className="order-email font-weight-bold text-black">{order.userEmail}</p>
                       <p className="order-date font-weight-bold text-black ">Order Date: {formatDate(order.date)}</p>
                       <p className="order-status font-weight-bold text-black ">Status: {order.status}</p>
                       <p className="order-total font-weight-bold text-black ">Total: ${order.total.toFixed(2)}</p>
                       <p className="order-items font-weight-bold text-black ">Number of Items: {order.items.length}</p>
                       {order.shipping && Object.keys(order.shipping).length > 0 && (
                         <div className="shipping-info">
                           <h4>Shipping Details:</h4>
                           <p><strong>Name:</strong> {order.shipping.fullName}</p>
                           <p><strong>Phone:</strong> {order.shipping.phone}</p>
                           <p><strong>Address:</strong> {order.shipping.street}, {order.shipping.building}</p>
                           <p><strong>Address Inside Country:</strong> {order.shipping.addressInCountry}</p>
                           <p><strong>City:</strong> {order.shipping.city}, {order.shipping.governorate}</p>
                           {order.shipping.additionalInfo && (
                             <p><strong>Notes:</strong> {order.shipping.additionalInfo}</p>
                           )}
                         </div>
                       )}
                     </div>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p className="item-price">${item.price}</p>
                            <p className="item-quantity">Quantity Sold: {item.quantity}</p>
                            <p className="item-total">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-actions">
                      {order.status !== 'rejected' && order.status !== 'approved' && (
                        <button 
                          className="reject-btn"
                          onClick={() => rejectOrder(order.id)}
                        >
                          Reject Order
                        </button>
                      )}
                      {order.status === 'rejected' && (
                        <div className="order-actions">
                          <span className="rejected-status">Rejected</span>
                          <button 
                            className="approve-btn"
                            onClick={() => approveOrder(order.id)}
                          >
                            Re-activate
                          </button>
                        </div>
                      )}
                      {order.status === 'approved' && (
                        <span className="approved-status">Approved</span>
                      )}
                      <button 
                        className="delete-order-btn"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <div className="section-header">
              <h2>Detailed Statistics</h2>
              <button className="refresh-btn" onClick={loadData}>
                Refresh Data
              </button>
            </div>
            
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Products by Category</h3>
                <div className="category-stats">
                  {(() => {
                    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
                    const categoryStats = {};
                    products.forEach(product => {
                      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
                    });
                    return Object.entries(categoryStats).map(([category, count]) => (
                      <div key={category} className="category-item">
                        <span className="category-name">{category}</span>
                        <span className="category-count">{count}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="stats-card">
                <h3>Order Status</h3>
                <div className="status-stats">
                  {(() => {
                    const statusStats = {};
                    orders.forEach(order => {
                      const status = order.status || 'pending';
                      statusStats[status] = (statusStats[status] || 0) + 1;
                    });
                    return Object.entries(statusStats).map(([status, count]) => (
                      <div key={status} className="status-item">
                        <span className="status-name">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="stats-card">
                <h3>Top Products</h3>
                <div className="product-stats">
                  {(() => {
                    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
                    return products.slice(0, 5).map(product => (
                      <div key={product.id} className="product-item">
                        <span className="product-name">{product.title}</span>
                        <span className="product-price">${product.price}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>Products Management</h2>
              <button className="refresh-btn" onClick={loadData}>
                Refresh Data
              </button>
            </div>
            
            <div className="products-list">
              {(() => {
                const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
                const defaultProducts = [
                  { id: 1, title: "Hoodie", quantity: 10, category: "Clothing" },
                  { id: 2, title: "T-Shirt", quantity: 20, category: "Clothing" },
                  { id: 3, title: "Jeans", quantity: 5, category: "Clothing" },
                  { id: 4, title: "Sneakers", quantity: 0, category: "Shoes" },
                  { id: 5, title: "Running Shoes", quantity: 15, category: "Shoes" },
                  { id: 6, title: "Watch", quantity: 8, category: "Accessories" },
                  { id: 7, title: "Backpack", quantity: 25, category: "Accessories" },
                  { id: 8, title: "Cap", quantity: 12, category: "Accessories" }
                ];
                
                const allProducts = products.length > 0 ? products : defaultProducts;
                const outOfStockProducts = allProducts.filter(product => product.quantity <= 0);
                const inStockProducts = allProducts.filter(product => product.quantity > 0);
                
                return (
                  <div>
                    {outOfStockProducts.length > 0 && (
                      <div className="out-of-stock-section">
                        <h3>🛑 Out of Stock Products ({outOfStockProducts.length})</h3>
                        <div className="products-grid">
                          {outOfStockProducts.map((product) => (
                            <div key={product.id} className="product-card out-of-stock">
                              <div className="product-info">
                                <h4>{product.title}</h4>
                                <p className="product-category">{product.category}</p>
                                <p className="product-quantity">Quantity: <span className="out-of-stock-badge">0</span></p>
                              </div>
                              <div className="product-actions">
                                <button 
                                  className="restock-btn"
                                  onClick={() => {
                                    const newQuantity = prompt(`Enter new quantity for ${product.title}:`);
                                    if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
                                      const updatedProducts = allProducts.map(p => 
                                        p.id === product.id ? { ...p, quantity: parseInt(newQuantity) } : p
                                      );
                                      localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts));
                                      loadData();
                                      alert(`${product.title} has been restocked with ${newQuantity} items!`);
                                    }
                                  }}
                                >
                                  Restock
                                </button>
                                <button 
                                  className="delete-product-btn"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone!`)) {
                                      // Add notification before deleting
                                      addProductDeletionNotification(product);
                                      
                                      // Remove product from all products
                                      const updatedProducts = allProducts.filter(p => p.id !== product.id);
                                      localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts));
                                      loadData();
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="in-stock-section">
                      <h3>✅ In Stock Products ({inStockProducts.length})</h3>
                      <div className="products-grid">
                        {inStockProducts.map((product) => (
                          <div key={product.id} className="product-card in-stock">
                            <div className="product-info">
                              <h4>{product.title}</h4>
                              <p className="product-category">{product.category}</p>
                              <p className="product-quantity">Quantity: <span className="in-stock-badge">{product.quantity}</span></p>
                            </div>
                            <div className="product-actions">
                              <button 
                                className="update-quantity-btn"
                                onClick={() => {
                                  const newQuantity = prompt(`Enter new quantity for ${product.title} (current: ${product.quantity}):`);
                                  if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) >= 0) {
                                    const updatedProducts = allProducts.map(p => 
                                      p.id === product.id ? { ...p, quantity: parseInt(newQuantity) } : p
                                    );
                                    localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts));
                                    loadData();
                                    alert(`${product.title} quantity updated to ${newQuantity}!`);
                                  }
                                }}
                              >
                                Update Quantity
                              </button>
                              <button 
                                className="delete-product-btn"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone!`)) {
                                    // Add notification before deleting
                                    addProductDeletionNotification(product);
                                    
                                    // Remove product from all products
                                    const updatedProducts = allProducts.filter(p => p.id !== product.id);
                                    localStorage.setItem('ecommerce_products', JSON.stringify(updatedProducts));
                                    loadData();
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'manage-admins' && (
          <div className="manage-admins-section">
            <div className="section-header">
              <h2>Add New Admin</h2>
              <div className="header-actions">
                <button className="add-specific-admin-btn" onClick={addSpecificAdmin}>
                  Add Amr Admin
                </button>
                <button className="refresh-btn" onClick={loadData}>
                  Refresh Data
                </button>
              </div>
            </div>
            
            <div className="add-admin-form">
              <div className="form-group">
                <label>Admin Name:</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Enter admin name"
                  className="admin-input"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address:</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="admin-input"
                />
              </div>
              
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className="admin-input"
                />
              </div>
              
              <button 
                className="add-admin-btn"
                onClick={addNewAdmin}
              >
                Add New Admin
              </button>
              
              {adminMessage && (
                <div className={`admin-message ${adminMessage.includes('Error') ? 'error' : 'success'}`}>
                  {adminMessage}
                </div>
              )}
            </div>

            <div className="current-admins">
              <h3>Current Admin List</h3>
              <div className="admins-list">
                {(() => {
                  const savedAdminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
                  const defaultAdminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com', 'admin-test@gmail.com', 'admin@gmail.com'];
                  const allAdminEmails = savedAdminEmails.length > 0 ? savedAdminEmails : defaultAdminEmails;
                  
                  return allAdminEmails.map((email, index) => (
                    <div key={index} className="admin-item">
                      <span className="admin-email">{email}</span>
                      <span className="admin-status">Active</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-footer">
         <div className="footer-actions">
           <button className="clear-db-btn" onClick={clearDatabase}>
             Clear All Data
           </button>
         </div>
         <p className="warning">Warning: Clear action cannot be undone!</p>
         <p className="save-info">
           Auto-save: Every 30 seconds | Last save: {lastSaveTime ? formatShortDate(lastSaveTime) : 'Never'}
         </p>
       </div>
    </div>
  );
} 
// Simple database using localStorage
class Database {
  constructor() {
    this.usersKey = 'ecommerce_users';
    this.ordersKey = 'ecommerce_orders';
    this.lastSaveKey = 'ecommerce_last_save';
    this.initDatabase();
    this.setupAutoSave();
  }

  // Initialize database
  initDatabase() {
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.ordersKey)) {
      localStorage.setItem(this.ordersKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.lastSaveKey)) {
      localStorage.setItem(this.lastSaveKey, new Date().toISOString());
    }
  }

  // Setup auto save functionality
  setupAutoSave() {
    // Save data when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.saveLastSaveTime();
      this.saveAllData();
    });

    // Save data when user navigates away
    window.addEventListener('pagehide', () => {
      this.saveLastSaveTime();
      this.saveAllData();
    });

    // Save data when user switches tabs
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveLastSaveTime();
        this.saveAllData();
      }
    });

    // Save data periodically (every 30 seconds)
    setInterval(() => {
      this.saveLastSaveTime();
      this.saveAllData();
    }, 30000);
  }

  // Save last save time
  saveLastSaveTime() {
    localStorage.setItem(this.lastSaveKey, new Date().toISOString());
  }

  // Save all data to localStorage
  saveAllData() {
    try {
      // Force save current data
      const users = this.getUsers();
      const orders = this.getOrders();
      
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      localStorage.setItem(this.ordersKey, JSON.stringify(orders));
      this.saveLastSaveTime();
      
      console.log('All data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Get all users
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    } catch (error) {
      console.error('Error reading user data:', error);
      return [];
    }
  }

  // Get all orders
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(this.ordersKey)) || [];
    } catch (error) {
      console.error('Error reading orders:', error);
      return [];
    }
  }

  // Check if user exists by email
  userExists(email) {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Validate login credentials
  validateLogin(email, password) {
    const users = this.getUsers();
    const user = users.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );
    return user || null;
  }

  // Register new user
  registerUser(userData) {
    const users = this.getUsers();
    
    // Check if email already exists
    if (this.userExists(userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now(),
      email: userData.email,
      password: userData.password,
      name: userData.name || userData.email.split('@')[0],
      createdAt: new Date().toISOString(),
      orders: []
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.saveLastSaveTime();
    this.saveAllData(); // Force save all data
    
    return newUser;
  }

  // Save new order
  saveOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      ...orderData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));

    // Add order to user's order list
    if (orderData.userId) {
      const users = this.getUsers();
      const userIndex = users.findIndex(user => user.id === orderData.userId);
      if (userIndex !== -1) {
        users[userIndex].orders.push(newOrder.id);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
      }
    }

    this.saveLastSaveTime();
    this.saveAllData(); // Force save all data

    return newOrder;
  }

  // Get orders for specific user
  getUserOrders(userId) {
    const orders = this.getOrders();
    return orders.filter(order => order.userId === userId);
  }

  // Update user data
  updateUser(userId, updates) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      return users[userIndex];
    }
    
    return null;
  }

  // Delete user
  deleteUser(userId) {
    const users = this.getUsers();
    const userToDelete = users.find(user => user.id === userId);
    
    if (!userToDelete) {
      console.error('User not found for deletion:', userId);
      return false;
    }

    // Check if trying to delete a protected admin
    const protectedAdmins = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com'];
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    if (protectedAdmins.includes(userToDelete.email)) {
      console.error('Attempted to delete protected admin:', userToDelete.email);
      return false;
    }

    // Check if current user is authorized to delete admins
    const adminEmails = JSON.parse(localStorage.getItem('admin_emails') || '[]');
    
    if (adminEmails.includes(userToDelete.email) && !protectedAdmins.includes(currentUserEmail)) {
      console.error('Unauthorized attempt to delete admin:', userToDelete.email);
      return false;
    }

    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));
    
    // Remove from admin list if it's an admin
    if (adminEmails.includes(userToDelete.email)) {
      const updatedAdminEmails = adminEmails.filter(email => email !== userToDelete.email);
      localStorage.setItem('admin_emails', JSON.stringify(updatedAdminEmails));
    }
    
    return true;
  }

  // Get last save time
  getLastSaveTime() {
    try {
      const lastSave = localStorage.getItem(this.lastSaveKey);
      return lastSave ? new Date(lastSave) : null;
    } catch (error) {
      console.error('Error reading last save time:', error);
      return null;
    }
  }

  // Export all data
  exportData() {
    try {
      const data = {
        users: this.getUsers(),
        orders: this.getOrders(),
        lastSave: this.getLastSaveTime(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.users) {
        localStorage.setItem(this.usersKey, JSON.stringify(data.users));
      }
      if (data.orders) {
        localStorage.setItem(this.ordersKey, JSON.stringify(data.orders));
      }
      if (data.lastSave) {
        localStorage.setItem(this.lastSaveKey, data.lastSave);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data (for development only)
  clearDatabase() {
    localStorage.removeItem(this.usersKey);
    localStorage.removeItem(this.ordersKey);
    localStorage.removeItem(this.lastSaveKey);
    this.initDatabase();
  }
}

// إنشاء نسخة واحدة من قاعدة البيانات
const database = new Database();

export default database; 
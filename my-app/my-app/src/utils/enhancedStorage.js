// Enhanced LocalStorage Management System
class EnhancedStorage {
  constructor() {
    this.maxSize = 10 * 1024 * 1024; // 10MB
    this.compressionThreshold = 0.8; // 80% usage triggers compression
    this.autoCleanup = false; // Disabled to prevent infinite loops
    this.backupEnabled = false; // Disabled to prevent infinite loops
    this.encryptionEnabled = false;
    this.isCompressing = false; // Flag to prevent infinite loops
  }

  // Initialize storage with default data if empty
  initializeStorage() {
    try {
      const products = this.get('ecommerce_products')
      if (!products || products.length === 0) {
        this.setDefaultData()
      }
      
      // Disable auto-cleanup to prevent infinite loops
      // if (this.autoCleanup) {
      //   this.autoCleanupStorage()
      // }
      
      console.log('✅ Enhanced Storage initialized successfully!')
      return true
    } catch (error) {
      console.error('❌ Error initializing enhanced storage:', error)
      return false
    }
  }

  // Set default data for new installations
  setDefaultData() {
    const defaultProducts = [
      {
        id: 1,
        title: "Premium Hoodie",
        price: 49.99,
        quantity: 15,
        image: "https://picsum.photos/400/400?random=1",
        description: "High-quality premium hoodie with modern design",
        category: "clothing",
        createdAt: new Date().toISOString(),
        tags: ["premium", "trending", "winter"]
      },
      {
        id: 2,
        title: "Classic T-Shirt",
        price: 24.99,
        quantity: 30,
        image: "https://picsum.photos/400/400?random=2",
        description: "Comfortable classic t-shirt for everyday wear",
        category: "clothing",
        createdAt: new Date().toISOString(),
        tags: ["classic", "comfortable", "summer"]
      },
      {
        id: 3,
        title: "Designer Jeans",
        price: 89.99,
        quantity: 8,
        image: "https://picsum.photos/400/400?random=3",
        description: "Premium designer jeans with perfect fit",
        category: "clothing",
        createdAt: new Date().toISOString(),
        tags: ["designer", "premium", "fashion"]
      },
      {
        id: 4,
        title: "Sport Sneakers",
        price: 129.99,
        quantity: 12,
        image: "https://picsum.photos/400/400?random=4",
        description: "Professional sport sneakers for athletes",
        category: "footwear",
        createdAt: new Date().toISOString(),
        tags: ["sport", "professional", "athletic"]
      },
      {
        id: 5,
        title: "Luxury Watch",
        price: 299.99,
        quantity: 5,
        image: "https://picsum.photos/400/400?random=5",
        description: "Elegant luxury watch with premium materials",
        category: "accessories",
        createdAt: new Date().toISOString(),
        tags: ["luxury", "premium", "elegant"]
      }
    ]

    const defaultCategories = [
      'electronics',
      'clothing', 
      'books',
      'home',
      'sports',
      'accessories',
      'footwear',
      'other'
    ]

    const defaultAdminEmails = [
      'yahiapro400@gmail.com',
      'yahiacool2009@gmail.com', 
      'admin-test@gmail.com',
      'admin@gmail.com'
    ]

    this.set('ecommerce_products', defaultProducts)
    this.set('ecommerce_categories', defaultCategories)
    this.set('admin_emails', defaultAdminEmails)
    
    console.log('✅ Default data set successfully!')
  }

  // Enhanced get method with error handling
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      
      const parsed = JSON.parse(item)
      return parsed
    } catch (error) {
      console.error(`❌ Error getting item ${key}:`, error)
      return defaultValue
    }
  }

  // Enhanced set method with compression and error handling
  set(key, value) {
    try {
      // Prevent infinite loops
      if (this.isCompressing) {
        // Use direct localStorage when compressing
        const serialized = JSON.stringify(value)
        localStorage.setItem(key, serialized)
        return true
      }
      
      // Check storage capacity before saving
      const currentUsage = this.getStorageUsage()
      
      if (currentUsage.percentage > this.compressionThreshold) {
        this.compressStorage()
      }
      
      const serialized = JSON.stringify(value)
      
      // Check if item would exceed quota
      if (serialized.length > this.maxSize * 0.1) { // Max 10% of total storage per item
        throw new Error('Item too large for storage')
      }
      
      localStorage.setItem(key, serialized)
      
      // Create backup if enabled (but not during compression)
      if (this.backupEnabled && !this.isCompressing) {
        this.createBackup(key, value)
      }
      
      return true
    } catch (error) {
      console.error(`❌ Error setting item ${key}:`, error)
      
      // Try to free space and retry
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded(key, value)
      }
      
      return false
    }
  }

  // Remove item with backup
  remove(key) {
    try {
      // Create backup before removal
      if (this.backupEnabled) {
        const value = this.get(key)
        if (value !== null) {
          this.createBackup(key, value)
        }
      }
      
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`❌ Error removing item ${key}:`, error)
      return false
    }
  }

  // Get storage usage statistics
  getStorageUsage() {
    try {
      const totalSize = JSON.stringify(localStorage).length
      const percentage = (totalSize / this.maxSize) * 100
      
      return {
        used: totalSize,
        total: this.maxSize,
        percentage: percentage.toFixed(2),
        available: this.maxSize - totalSize,
        items: Object.keys(localStorage).length
      }
    } catch (error) {
      console.error('❌ Error calculating storage usage:', error)
      return { used: 0, total: this.maxSize, percentage: 0, available: this.maxSize, items: 0 }
    }
  }

  // Intelligent storage compression
  compressStorage() {
    try {
      // Prevent infinite loops by checking if already compressing
      if (this.isCompressing) {
        console.log('⚠️ Compression already in progress, skipping...')
        return false
      }
      
      this.isCompressing = true
      console.log('🔄 Compressing storage...')
      
      // Remove unnecessary keys
      const keysToRemove = [
        'react-devtools',
        'react-devtools::Dock',
        'react-devtools::Panel',
        'react-devtools::Tab',
        'redux-devtools-extension'
      ]
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
        }
      })
      
      // Optimize existing data - limit to 50 products
      const products = this.get('ecommerce_products', [])
      if (products.length > 50) {
        const limitedProducts = products.slice(-50)
        const optimizedProducts = limitedProducts.map(product => ({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          image: product.image,
          description: product.description,
          category: product.category,
          createdAt: product.createdAt
        }))
        
        // Use direct localStorage to avoid recursion
        localStorage.setItem('ecommerce_products', JSON.stringify(optimizedProducts))
        console.log(`✅ Compressed products from ${products.length} to ${optimizedProducts.length}`)
      }
      
      this.isCompressing = false
      console.log('✅ Storage compressed successfully!')
      return true
    } catch (error) {
      this.isCompressing = false
      console.error('❌ Error compressing storage:', error)
      return false
    }
  }

  // Handle quota exceeded error
  handleQuotaExceeded(key, value) {
    try {
      console.log('⚠️ Storage quota exceeded, attempting to free space...')
      
      // Remove cart items first (least critical)
      if (key !== 'cartItems') {
        localStorage.removeItem('cartItems')
      }
      
      // Remove old orders (keep only last 10)
      const orders = this.get('ecommerce_orders', [])
      if (orders.length > 10) {
        const recentOrders = orders.slice(-10)
        this.set('ecommerce_orders', recentOrders)
      }
      
      // Try to save again
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      
      console.log('✅ Successfully freed space and saved item!')
      return true
    } catch (error) {
      console.error('❌ Failed to handle quota exceeded error:', error)
      return false
    }
  }

  // Create backup of important data
  createBackup(key, value) {
    try {
      const backupKey = `${key}_backup_${Date.now()}`
      const backup = {
        key: key,
        value: value,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
      
      localStorage.setItem(backupKey, JSON.stringify(backup))
      
      // Keep only last 3 backups
      this.cleanupOldBackups(key)
      
      return true
    } catch (error) {
      console.error('❌ Error creating backup:', error)
      return false
    }
  }

  // Cleanup old backups
  cleanupOldBackups(key) {
    try {
      const backupKeys = Object.keys(localStorage).filter(k => k.startsWith(`${key}_backup_`))
      
      if (backupKeys.length > 3) {
        // Sort by timestamp and remove oldest
        backupKeys.sort().slice(0, -3).forEach(oldKey => {
          localStorage.removeItem(oldKey)
        })
      }
    } catch (error) {
      console.error('❌ Error cleaning up old backups:', error)
    }
  }

  // Auto cleanup storage
  autoCleanupStorage() {
    try {
      const usage = this.getStorageUsage()
      
      if (usage.percentage > 70) {
        console.log('🧹 Auto-cleanup triggered...')
        this.compressStorage()
      }
      
      // Cleanup old backups
      const allKeys = Object.keys(localStorage)
      const backupKeys = allKeys.filter(k => k.includes('_backup_'))
      
      backupKeys.forEach(backupKey => {
        const backup = this.get(backupKey)
        if (backup && backup.timestamp) {
          const backupAge = Date.now() - new Date(backup.timestamp).getTime()
          const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
          
          if (backupAge > maxAge) {
            localStorage.removeItem(backupKey)
          }
        }
      })
      
      console.log('✅ Auto-cleanup completed!')
    } catch (error) {
      console.error('❌ Error in auto-cleanup:', error)
    }
  }

  // Get storage health status
  getStorageHealth() {
    const usage = this.getStorageUsage()
    const health = {
      status: 'healthy',
      score: 100,
      issues: [],
      recommendations: []
    }
    
    if (usage.percentage > 90) {
      health.status = 'critical'
      health.score = 10
      health.issues.push('Storage almost full')
      health.recommendations.push('Consider removing old data')
    } else if (usage.percentage > 70) {
      health.status = 'warning'
      health.score = 60
      health.issues.push('Storage usage high')
      health.recommendations.push('Monitor storage usage')
    }
    
    return health
  }

  // Export storage data
  exportData() {
    try {
      const data = {}
      Object.keys(localStorage).forEach(key => {
        if (!key.includes('_backup_')) {
          data[key] = this.get(key)
        }
      })
      
      return {
        data: data,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
    } catch (error) {
      console.error('❌ Error exporting data:', error)
      return null
    }
  }

  // Import storage data
  importData(importData) {
    try {
      if (!importData || !importData.data) {
        throw new Error('Invalid import data')
      }
      
      Object.keys(importData.data).forEach(key => {
        this.set(key, importData.data[key])
      })
      
      console.log('✅ Data imported successfully!')
      return true
    } catch (error) {
      console.error('❌ Error importing data:', error)
      return false
    }
  }
}

// Create singleton instance
const enhancedStorage = new EnhancedStorage()

// Export functions for easy use
export const initializeStorage = () => enhancedStorage.initializeStorage()
export const getStorageUsage = () => enhancedStorage.getStorageUsage()
export const getStorageHealth = () => enhancedStorage.getStorageHealth()
export const compressStorage = () => enhancedStorage.compressStorage()
export const exportData = () => enhancedStorage.exportData()
export const importData = (data) => enhancedStorage.importData(data)

// Enhanced get/set methods
export const get = (key, defaultValue = null) => enhancedStorage.get(key, defaultValue)
export const set = (key, value) => enhancedStorage.set(key, value)
export const remove = (key) => enhancedStorage.remove(key)

export default enhancedStorage 
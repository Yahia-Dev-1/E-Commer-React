// Storage Cleanup Utility
export const cleanupStorage = () => {
  try {
    // Get all storage keys
    const keys = Object.keys(localStorage)
    
    // Remove old backup data
    const backupKeys = keys.filter(key => key.includes('backup') && key.includes('_'))
    backupKeys.forEach(key => {
      const timestamp = key.split('_').pop()
      const backupDate = new Date(parseInt(timestamp))
      const daysOld = (Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysOld > 7) {
        localStorage.removeItem(key)
        console.log(`Removed old backup: ${key}`)
      }
    })
    
    // Compress product data
    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]')
    if (products.length > 50) {
      const compressedProducts = products.slice(-50) // Keep only last 50 products
      localStorage.setItem('ecommerce_products', JSON.stringify(compressedProducts))
      console.log('Compressed products to last 50 items')
    }
    
    // Clear old cart items
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
    if (cartItems.length > 20) {
      const recentCartItems = cartItems.slice(-20) // Keep only last 20 items
      localStorage.setItem('cartItems', JSON.stringify(recentCartItems))
      console.log('Cleaned cart items to last 20 items')
    }
    
    console.log('✅ Storage cleanup completed')
    return true
  } catch (error) {
    console.error('Error during storage cleanup:', error)
    return false
  }
}

export const getStorageSize = () => {
  try {
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    return totalSize
  } catch (error) {
    console.error('Error calculating storage size:', error)
    return 0
  }
}

export const isStorageFull = () => {
  const size = getStorageSize()
  const maxSize = 5 * 1024 * 1024 // 5MB limit
  return size > maxSize
} 
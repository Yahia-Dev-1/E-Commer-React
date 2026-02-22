/**
 * Validation utilities for API requests
 */

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateProduct(product) {
  const errors = [];
  
  if (!product.title || typeof product.title !== 'string' || product.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (product.price === undefined || product.price === null) {
    errors.push('Price is required');
  } else if (typeof product.price !== 'number' || product.price < 0) {
    errors.push('Price must be a positive number');
  }
  
  if (product.quantity === undefined || product.quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof product.quantity !== 'number' || product.quantity < 0 || !Number.isInteger(product.quantity)) {
    errors.push('Quantity must be a non-negative integer');
  }
  
  if (!product.category || typeof product.category !== 'string' || product.category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  if (product.image && typeof product.image !== 'string') {
    errors.push('Image must be a valid URL string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateUser(user) {
  const errors = [];
  
  if (!user.email || !validateEmail(user.email)) {
    errors.push('Valid email is required');
  }
  
  if (!user.password || typeof user.password !== 'string' || user.password.length < 3) {
    errors.push('Password is required and must be at least 3 characters');
  }
  
  if (!user.name || typeof user.name !== 'string' || user.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateLogin(credentials) {
  const errors = [];
  
  if (!credentials.email || !validateEmail(credentials.email)) {
    errors.push('Valid email is required');
  }
  
  if (!credentials.password || typeof credentials.password !== 'string') {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateOrder(order) {
  const errors = [];
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }
  
  if (!order.userEmail || !validateEmail(order.userEmail)) {
    errors.push('Valid user email is required');
  }
  
  if (order.total === undefined || order.total === null || typeof order.total !== 'number' || order.total < 0) {
    errors.push('Valid total amount is required');
  }
  
  if (order.items) {
    order.items.forEach((item, index) => {
      if (!item.id) errors.push(`Item ${index + 1}: ID is required`);
      if (!item.name) errors.push(`Item ${index + 1}: Name is required`);
      if (!item.price || typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item ${index + 1}: Valid price is required`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateEmail,
  validateProduct,
  validateUser,
  validateLogin,
  validateOrder
};

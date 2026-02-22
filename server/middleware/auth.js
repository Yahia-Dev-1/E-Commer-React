/**
 * Authentication middleware
 */

const { readData } = require('../utils/storage');

/**
 * Check if user is admin
 */
function isAdmin(req, res, next) {
  const adminEmails = ['yahiapro400@gmail.com', 'yahiacool2009@gmail.com'];
  
  // Get admin emails from storage
  const users = readData('users.json');
  const storedAdminEmails = users
    .filter(user => user.isProtected || adminEmails.includes(user.email))
    .map(user => user.email);
  
  const allAdminEmails = [...new Set([...adminEmails, ...storedAdminEmails])];
  
  // Get user email from header or body
  const userEmail = req.headers['x-user-email'] || req.body.userEmail || req.query.userEmail;
  
  if (!userEmail) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'User email is required' 
    });
  }
  
  if (!allAdminEmails.includes(userEmail)) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required' 
    });
  }
  
  req.userEmail = userEmail;
  next();
}

/**
 * Check if user is authenticated (optional middleware)
 */
function isAuthenticated(req, res, next) {
  const userEmail = req.headers['x-user-email'] || req.body.userEmail || req.query.userEmail;
  
  if (!userEmail) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'User email is required' 
    });
  }
  
  req.userEmail = userEmail;
  next();
}

module.exports = {
  isAdmin,
  isAuthenticated
};

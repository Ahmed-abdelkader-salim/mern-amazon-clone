import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 


// Optional auth middleware for guest users
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't block the request
        req.user = null;
      }
    }
    
    // Always continue to next middleware
    next();
  } catch (error) {
    // Don't block the request even if there's an error
    req.user = null;
    next();
  }
};



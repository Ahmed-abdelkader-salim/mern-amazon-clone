import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAuth = async (req, res, next) => {
  try {
    // ✅ هنا نقرأ التوكن من الكوكي بدل الهيدر
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: "Access Denied. Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Access Denied. Invalid token" });
  }
};


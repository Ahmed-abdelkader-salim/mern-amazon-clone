import express from 'express'
import { isAuth } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
const router = express.Router();

import {
    getCart, mergeCart, addToCart, applyCoupons, getItemCount,
    updateCartItem, removeFromCart, clearCart
 } from '../controllers/cartController.js';

// Get Cart
router.get("/", optionalAuth, getCart);
// merge cart user and guest
router.post("/merge", isAuth, mergeCart);
// Add To Cart 
router.post("/add", optionalAuth, addToCart);

// applay cuponns
router.post("/coupons", isAuth, applyCoupons)

// Get itme Count
router.get("/count", optionalAuth, getItemCount);

// Update item quantity
router.put("/update/:id", optionalAuth, updateCartItem);

// remove Item
router.delete("/remove/:id", optionalAuth, removeFromCart);

// clear Cart
router.delete("/", optionalAuth, clearCart);




export default router;
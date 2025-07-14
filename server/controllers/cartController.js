import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

// Helper function to get or create user identifier
const getUserIdentifier = (req) => {
  if (req.user && req.user._id) {
    return {
      identifier: req.user._id,
      isGuest: false,
      field: 'userId'
    };
  } else {
    // Create guest session ID
    let guestId = req.cookies.guestId;
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return {
      identifier: guestId,
      isGuest: true,
      field: 'sessionId'
    };
  }
};

// Add to Cart
export const addToCart = async (req, res) => {
  try {
    console.log('Add to cart request body:', req.body);
    console.log('User:', req.user);
    
    const { productId, quantity = 1, selectedVariant } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({
        message: 'Product ID is required',
        error: 'MISSING_PRODUCT_ID'
      });
    }
    
    // Validate quantity
    if (quantity < 1 || quantity > 30) {
      return res.status(400).json({
        message: 'Invalid quantity. Must be between 1 and 30',
        error: 'INVALID_QUANTITY'
      });
    }

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID format',
        error: 'INVALID_PRODUCT_ID'
      });
    }

    // Get user identifier
    const { identifier, isGuest, field } = getUserIdentifier(req);
    
    // Find or create cart
    let cart = await Cart.findOne({ [field]: identifier });
    
    if (!cart) {
      const cartData = {
        items: [],
        savedForLater: []
      };
      
      if (isGuest) {
        cartData.sessionId = identifier;
        cartData.userId = new mongoose.Types.ObjectId(); // Temporary ObjectId for guest
      } else {
        cartData.userId = identifier;
      }
      
      cart = new Cart(cartData);
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId &&
              (item.selectedVariant || '') === (selectedVariant || '')
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      console.log('Updated existing cart item');
      return res.json({ 
        message: 'Cart item updated successfully', 
        updated: true,
      });
    } else {
      // Add new item - validate all required fields from your schema
      const newItem = {
        productId: new mongoose.Types.ObjectId(productId),
        quantity: Number(quantity),
        selectedVariant: selectedVariant || '',
        slug: req.body.slug || '',
        name: req.body.name || 'Unknown Product',
        image: req.body.image || '',
        price: Number(req.body.price) || 0,
        originalPrice: Number(req.body.originalPrice) || Number(req.body.price) || 0,
        brand: req.body.brand || '',
        category: req.body.category || '',
        isPrime: Boolean(req.body.isPrime),
        isFreeShipping: Boolean(req.body.isFreeShipping),
        hasCoupon: Boolean(req.body.hasCoupon),
        isGift: Boolean(req.body.isGift),
        giftMessage: req.body.giftMessage || '',
        variants: req.body.variants || []
      };
      
      cart.items.push(newItem);
      console.log('Added new cart item');
    }

    // Save cart
    const savedCart = await cart.save();
    console.log('Cart saved successfully');

    // Set guest cookie if needed
    if (isGuest && !req.cookies.guestId) {
      res.cookie('guestId', identifier, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: savedCart,
      itemCount: savedCart.items.length,
      isGuest: isGuest
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid cart data',
        error: 'VALIDATION_ERROR',
        details: error.message
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid product ID format',
        error: 'INVALID_PRODUCT_ID'
      });
    }
    
    // Generic error response
    res.status(500).json({
      message: 'Failed to add item to cart',
      error: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const { identifier, field } = getUserIdentifier(req);
    
    const cart = await Cart.findOne({ [field]: identifier })
      .populate('items.productId', 'name slug image price originalPrice countInStock');
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: null,
        itemCount: 0,
        message: 'Cart is empty'
      });
    }

    res.status(200).json({
      success: true,
      cart: cart,
      itemCount: cart.items.length
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
};

// Get Item Count
export const getItemCount = async (req, res) => {
  try {
    const { identifier, field } = getUserIdentifier(req);
    
    const cart = await Cart.findOne({ [field]: identifier });
    
    const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
    
    res.status(200).json({
      success: true,
      itemCount: itemCount
    });

  } catch (error) {
    console.error('Get item count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get item count',
      itemCount: 0
    });
  }
};

// Update Cart Item
export const updateCartItem = async (req, res) => {
  try {
    let productId = req.params.id || req.body.productId;
    const { quantity, selectedVariant } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: 'MISSING_PRODUCT_ID'
      });
    }
    
    // Convert productId to string if it's an ObjectId object
    if (typeof productId === 'object' && productId.toString) {
      productId = productId.toString();
    }
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'INVALID_PRODUCT_ID'
      });
    }
    
    if (!quantity || quantity < 1 || quantity > 30) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 30'
      });
    }
    
    console.log('Updating item:', { productId, quantity, selectedVariant });
    
    const { identifier, field } = getUserIdentifier(req);
    
    const cart = await Cart.findOne({ [field]: identifier });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find the item to update
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId &&
              (item.selectedVariant || '') === (selectedVariant || '')
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Update the quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Save the cart (this will trigger the pre-save hook to recalculate totals)
    const savedCart = await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: savedCart,
      itemCount: savedCart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
    
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};
// removeFromCart controller
export const removeFromCart = async (req, res) => {
  try {
    // Get productId from URL params
    let productId = req.params.id;
    // Get selectedVariant from request body
    console.log(productId)
    const { selectedVariant } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: 'MISSING_PRODUCT_ID'
      });
    }
    
    // Convert productId to string if it's an ObjectId object
    if (typeof productId === 'object' && productId.toString) {
      productId = productId.toString();
    }
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'INVALID_PRODUCT_ID'
      });
    }
    
    console.log('Removing item:', { productId, selectedVariant });
    
    const { identifier, field } = getUserIdentifier(req);
    
    const cart = await Cart.findOne({ [field]: identifier });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find the item to remove
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId &&
              (item.selectedVariant || '') === (selectedVariant || '')
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Remove the item
    cart.items.splice(itemIndex, 1);
    
    // Save the cart (this will trigger the pre-save hook to recalculate totals)
    const savedCart = await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: savedCart,
      itemCount: savedCart.items.length
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};
// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const { identifier, field } = getUserIdentifier(req);
    
    const cart = await Cart.findOne({ [field]: identifier });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.savedForLater = [];
    const savedCart = await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: savedCart,
      itemCount: 0
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Merge Cart (when user logs in)
export const mergeCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'User authentication required',
        error: 'MISSING_USER_AUTH'
      });
    }

    const { guestCartId } = req.body;
    
    if (!guestCartId) {
      return res.status(400).json({
        message: 'Guest cart ID is required',
        error: 'MISSING_GUEST_CART_ID'
      });
    }

    // Find guest cart
    const guestCart = await Cart.findOne({ sessionId: guestCartId });
    
    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No guest cart items to merge',
        cart: null
      });
    }

    // Find or create user cart
    let userCart = await Cart.findOne({ userId: req.user._id });
    
    if (!userCart) {
      // Create new user cart with guest cart items
      userCart = new Cart({
        userId: req.user._id,
        items: guestCart.items,
        savedForLater: guestCart.savedForLater || []
      });
    } else {
      // Merge items from guest cart
      guestCart.items.forEach(guestItem => {
        const existingItemIndex = userCart.items.findIndex(
          item => item.productId.toString() === guestItem.productId.toString() &&
                  (item.selectedVariant || '') === (guestItem.selectedVariant || '')
        );

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          userCart.items.push(guestItem);
        }
      });
    }

    // Save user cart and delete guest cart
    const savedCart = await userCart.save();
    await Cart.deleteOne({ sessionId: guestCartId });

    res.status(200).json({
      success: true,
      message: 'Cart merged successfully',
      cart: savedCart,
      itemCount: savedCart.items.length
    });

  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge cart',
      error: error.message
    });
  }
};

// Apply Coupons (requires authentication)
export const applyCoupons = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'User authentication required',
        error: 'MISSING_USER_AUTH'
      });
    }

    const { couponCode } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        message: 'Coupon code is required',
        error: 'MISSING_COUPON_CODE'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Here you would implement coupon validation logic
    // For now, we'll just add a placeholder response
    
    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      cart: cart
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon',
      error: error.message
    });
  }
};


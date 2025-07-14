import mongoose from "mongoose";

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
  },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, max: 30 },
  isPrime: { type: Boolean, default: false },
  hasCoupon: { type: Boolean, default: false },
  isFreeShipping: { type: Boolean, default: false },
  isGift: { type: Boolean, default: false },
  giftMessage: String,
  selectedVariant: String, // For size, color variations
  variants: [{
    type: String
  }],
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Save Item to Later Schema
const savedItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  brand: { type: String, required: true },
  isPrime: { type: Boolean, default: false },
  hasCoupon: { type: Boolean, default: false },
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Main Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  sessionId: String, // For guest users
  items: [cartItemSchema],
  savedForLater: [savedItemSchema],
  
  // Pricing breakdown
  subtotal: { type: Number, default: 0 },
  itemsDiscount: { type: Number, default: 0 }, // From original price
  couponDiscount: { type: Number, default: 0 },
  primeDiscount: { type: Number, default: 0 },
  estimatedTax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  
  currency: { type: String, default: 'USD' },
  
  // Prime and shipping info
  hasPrimeItems: { type: Boolean, default: false },
  qualifiesForFreeShipping: { type: Boolean, default: false },
  freeShippingThreshold: { type: Number, default: 35 },
  
  // Applied coupons
  appliedCoupons: [{
      code: String,
      discount: Number,
      type: { type: String, enum: ['percentage', 'fixed', 'item_specific'] },
      minOrder: Number,
      applicableItems: [String] // product IDs
  }],
  
  // Address for tax calculation
  shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

// Indexes for performance 
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.calculateTotals();
  next();
});

cartSchema.methods.calculateTotals = function() {
  this.subtotal = 0;
  this.itemsDiscount = 0;
  this.hasPrimeItems = false;
  let freeShippingItems = 0;

  this.items.forEach(item => {
      this.subtotal += item.price * item.quantity;
      this.itemsDiscount += (item.originalPrice - item.price) * item.quantity;

      if (item.isPrime) this.hasPrimeItems = true;
      if (item.isFreeShipping || item.isPrime) freeShippingItems += item.quantity;
  });

  this.couponDiscount = 0;
  this.appliedCoupons.forEach(coupon => {
      if (coupon.minOrder && this.subtotal < coupon.minOrder) return;
      
      if (coupon.type === 'percentage') {
          this.couponDiscount += this.subtotal * (coupon.discount / 100);
      } else if (coupon.type === 'fixed') {
          this.couponDiscount += coupon.discount;
      }
  });

  this.qualifiesForFreeShipping = this.subtotal >= this.freeShippingThreshold || 
      this.hasPrimeItems || 
      freeShippingItems === this.items.length;

  this.shippingCost = this.qualifiesForFreeShipping ? 0 : 8.99;
  this.primeDiscount = this.hasPrimeItems && !this.qualifiesForFreeShipping ? this.shippingCost : 0;

  const taxRate = this.getTaxRate();
  const taxableAmount = this.subtotal - this.couponDiscount;
  this.estimatedTax = Math.max(0, taxableAmount * taxRate);

  this.total = this.subtotal - this.couponDiscount + this.shippingCost + this.estimatedTax;
};

// Fixed: Changed CartSchema to cartSchema (lowercase)
cartSchema.methods.getTaxRate = function() {
  const stateTaxRates = {
      'CA': 0.0875, 'NY': 0.08, 'TX': 0.0625, 'FL': 0.06
  };
  return stateTaxRates[this.shippingAddress?.state] || 0.085;
};


const Cart = mongoose.model("Cart", cartSchema);


export default Cart;
import React, { useState } from 'react';
import toast from "react-hot-toast";

import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
} from '../app/api';
import LoadingBox from '../components/LoadingBox';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

const Cart = () => {
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const { data: cartData, isLoading, error, refetch } = useGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();
  const [applyCoupons, { isLoading: isApplyingCoupon }] =
    useApplyCouponMutation();

  // Extract cart from the response structure
  const cart = cartData?.cart;
  const cartItems = cart?.items || [];

  // Helper to always get string productId
  const getProductId = (productId) =>
    typeof productId === 'object' && productId?._id ? productId._id : productId;

  const updateQuantity = async (
    productId,
    newQuantity,
    selectedVariant = ''
  ) => {
    try {
      const id = getProductId(productId);
      if (newQuantity === 0) {
        await removeFromCart({
          productId: id,
          selectedVariant,
        }).unwrap();
        toast.success('Item removed from cart');
      } else {
        await updateCartItem({
          productId: id,
          quantity: newQuantity,
          selectedVariant,
        }).unwrap();
        toast.success('Cart updated');
      }
      refetch();
    } catch (error) {
      if (error?.data?.error === 'INVALID_PRODUCT_ID') {
        toast.error('Invalid product ID format');
      } else {
        toast.error(error?.data?.message || 'Failed to update cart');
      }
      console.error('Update cart error:', error);
    }
  };

  const removeItem = async (productId, selectedVariant = '') => {
    try {
      const id = getProductId(productId);
      await removeFromCart({
        productId: id,
        selectedVariant,
      }).unwrap();
      toast.success('Item removed from cart');
      refetch();
    } catch (error) {
      if (error?.data?.error === 'INVALID_PRODUCT_ID') {
        toast.error('Invalid product ID format');
      } else {
        toast.error(error?.data?.message || 'Failed to remove item');
      }
      console.error('Remove item error:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      toast.success('Cart cleared successfully');
      refetch(); // Refresh cart data
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to clear cart');
      console.error('Clear cart error:', error);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      await applyCoupons({ couponCode }).unwrap();
      toast.success('Coupon applied successfully!');
      setCouponCode('');
      setShowCouponInput(false);
      refetch(); // Refresh cart data
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to apply coupon');
    }
  };

  if (isLoading) return <LoadingBox />;
  if (error)
    return (
      <div className="text-center text-red-600 p-4">
        Error loading cart: {error?.data?.message || 'Unknown error'}
      </div>
    );

  // Use cart totals from schema calculations
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal || 0;
  const itemsDiscount = cart?.itemsDiscount || 0;
  const couponDiscount = cart?.couponDiscount || 0;
  const primeDiscount = cart?.primeDiscount || 0;
  const estimatedTax = cart?.estimatedTax || 0;
  const shippingCost = cart?.shippingCost || 0;
  const total = cart?.total || 0;
  const qualifiesForFreeShipping = cart?.qualifiesForFreeShipping || false;
  const freeShippingThreshold = cart?.freeShippingThreshold || 35;
  const hasPrimeItems = cart?.hasPrimeItems || false;

  return (
    <div className="bg-gray-100 min-h-screen">
      <PageTitle title="Cart Page"/>
      <div className="min-w-[1000px] max-w-[1500px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-7 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 relative">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-normal text-gray-900">
                  Shopping Cart
                </h1>
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 absolute right-6 bottom-1">
                Price
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div
                  key={`${getProductId(item.productId)}-${
                    item.selectedVariant || 'default'
                  }`}
                  className="p-6"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                        {item.name}
                      </h3>
                    </Link>

                      {/* Brand */}
                      {item.brand && (
                        <p className="text-sm text-gray-600 mt-1">
                          by {item.brand}
                        </p>
                      )}

                      {/* Variant */}
                      {item.selectedVariant && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Option:</span>{' '}
                          {item.selectedVariant}
                        </p>
                      )}

                      {/* Category */}
                      {item.category && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span>{' '}
                          {item.category}
                        </p>
                      )}

                      {/* Stock Status */}
                      <p className="text-sm mt-1 font-medium text-green-600">
                        In Stock
                      </p>

                      {/* Prime/Free Shipping */}
                      <div className="flex gap-2 mt-2">
                        {item.isPrime && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Prime
                          </span>
                        )}
                        {item.isFreeShipping && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Free Shipping
                          </span>
                        )}
                        {item.hasCoupon && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Coupon Available
                          </span>
                        )}
                      </div>

                      {/* Gift Option */}
                      <div className="flex gap-4 mt-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={item.isGift}
                            readOnly
                          />
                          <span>This is a gift</span>
                        </label>
                      </div>

                      {/* Gift Message */}
                      {item.isGift && item.giftMessage && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Gift Message:</span>{' '}
                          {item.giftMessage}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(
                                getProductId(item.productId),
                                item.quantity - 1,
                                item.selectedVariant
                              )
                            }
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                getProductId(item.productId),
                                item.quantity + 1,
                                item.selectedVariant
                              )
                            }
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                            disabled={
                              item.quantity >= 30 ||
                              (typeof item.productId === 'object' &&
                              item.productId?.countInStock
                                ? item.quantity >= item.productId.countInStock
                                : false)
                            }
                          >
                            +
                          </button>
                        </div>
                        {typeof item.productId === 'object' &&
                          item.productId?.countInStock && (
                            <div className="text-xs text-gray-500 mt-1">
                              In stock: {item.productId.countInStock}
                            </div>
                          )}

                        <button
                          onClick={() =>
                            removeItem(
                              getProductId(item.productId),
                              item.selectedVariant
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Delete
                        </button>

                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Save for later
                        </button>

                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Share
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      {item.originalPrice > item.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ${(item.originalPrice * item.quantity).toFixed(2)}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Your cart is empty</h3>
                  <p className="mt-1">Add some items to get started!</p>
                </div>
              )}
            </div>

            {/* Subtotal at bottom of left column */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 text-right">
                <span className="text-lg">
                  Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''}):
                  <span className="font-bold text-xl ml-1">
                    ${subtotal.toFixed(2)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Right Column - Checkout */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              {/* Free Shipping Notice */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    {qualifiesForFreeShipping
                      ? 'Your order qualifies for FREE Shipping'
                      : `Add $${(freeShippingThreshold - subtotal).toFixed(
                          2
                        )} for FREE Shipping`}
                  </span>
                </div>
                {hasPrimeItems && (
                  <div className="text-xs text-blue-600 mt-1">
                    Prime shipping benefits applied
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
                  </span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>

                {/* Items Discount (from original price) */}
                {itemsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Items Discount</span>
                    <span>-${itemsDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Coupon Discount */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Prime Discount */}
                {primeDiscount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Prime Shipping Discount</span>
                    <span>-${primeDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'FREE'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Applied Coupons Display */}
              {cart?.appliedCoupons && cart.appliedCoupons.length > 0 && (
                <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-medium text-green-800 mb-1">
                    Applied Coupons:
                  </div>
                  {cart.appliedCoupons.map((coupon, index) => (
                    <div
                      key={index}
                      className="text-xs text-green-700 flex justify-between"
                    >
                      <span>{coupon.code}</span>
                      <span>
                        {coupon.type === 'percentage'
                          ? `${coupon.discount}% off`
                          : `$${coupon.discount} off`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Input */}
              <div className="mb-4">
                {!showCouponInput ? (
                  <button
                    onClick={() => setShowCouponInput(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Add coupon code
                  </button>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isApplyingCoupon}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCouponInput(false);
                          setCouponCode('');
                        }}
                        className="px-3 py-1 text-gray-600 border rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Gift Option */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>This order contains a gift</span>
                </label>
              </div>

              {/* Checkout Button */}
              <button
                disabled={cartItems.length === 0}
                className={`w-full py-2 px-4 rounded-full font-medium transition-colors ${
                  cartItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                }`}
              >
                <Link to='/shipping'>Proceed to checkout</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

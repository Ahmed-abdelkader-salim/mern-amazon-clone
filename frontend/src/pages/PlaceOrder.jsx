import { Package } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import CheckoutSteps from "../components/CheckoutSteps";
import { usePlaceOrderMutation, useGetPendingOrderQuery } from "../app/api";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [placeOrder, { isLoading }] = usePlaceOrderMutation();
  // Get pending order data to display items, shipping, and payment info
  const { data: orderData, isLoading: loadingOrder, error: orderError } = useGetPendingOrderQuery('pending');
console.log(orderData)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await placeOrder({}).unwrap();
      
      // Handle success response
      if (res.success) {
        toast.success(res.message || "Order placed successfully!");
        navigate(`/order/${res.order._id}`);
      } else {
        toast.error(res.message || "Order failed");
      }
    } catch (err) {
      // Handle error response - check for the new error structure
      const errorMessage = err?.data?.message || err?.message || "Order failed";
      toast.error(errorMessage);
      
      // Handle specific error cases and redirect appropriately
      if (err?.data?.message?.includes('No pending order found')) {
        toast.error("Please complete the checkout process first");
        navigate('/cart');
      } else if (err?.data?.message?.includes('shipping address')) {
        toast.error("Please add shipping address");
        navigate('/shipping');
      } else if (err?.data?.message?.includes('payment method')) {
        toast.error("Please select payment method");
        navigate('/payment');
      } else if (err?.data?.message?.includes('Cart is empty')) {
        toast.error("Your cart is empty");
        navigate('/cart');
      }
    }
  };

  if (loadingOrder) return <div className="text-center py-10">Loading order...</div>;
  if (orderError) return <div className="text-center text-red-500 py-10">Error loading order data</div>;

  const order = orderData?.order;

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Preview Order</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Shipping</h3>
                <Link to="/shipping" className="text-orange-600 hover:text-orange-700 text-sm font-medium">Edit</Link>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong className="text-gray-900">Name:</strong> {order?.shippingAddress?.fullName}</p>
                <p><strong className="text-gray-900">Address:</strong> {order?.shippingAddress?.address}, {order?.shippingAddress?.city}, {order?.shippingAddress?.postalCode}, {order?.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
                <Link to="/payment" className="text-orange-600 hover:text-orange-700 text-sm font-medium">Edit</Link>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong className="text-gray-900">Method:</strong> {order?.paymentMethod}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                <Link to="/cart" className="text-orange-600 hover:text-orange-700 text-sm font-medium">Edit</Link>
              </div>
              <div className="space-y-4">
                {order?.orderItems?.length > 0 ? (
                  order.orderItems.map((item) => (
                    <div key={item._id} className="flex items-center py-4 border-b border-gray-100 last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                      <div className="flex-1">
                        <Link to={`/product/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-orange-600">
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{item.brand} • {item.category}</p>
                      </div>
                      <div className="text-sm text-gray-600 mr-6">Qty: {item.quantity}</div>
                      <div className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No items in order. Please add items to your cart first.</p>
                    <Link to="/cart" className="text-orange-600 hover:text-orange-700 font-medium">
                      Go to Cart
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items</span>
                  <span className="text-gray-900">${order?.itemsPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${order?.shippingPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${order?.taxPrice?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                <span>Order Total</span>
                <span>${order?.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>

              {/* Order Status Info */}
              {order?.orderStatus && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Status:</strong> {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </p>
                  {order.orderNumber && (
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>Order #:</strong> {order.orderNumber}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !order?.orderItems?.length || !order?.shippingAddress || !order?.paymentMethod}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Place Order
                  </>
                )}
              </button>

              {/* Validation Messages */}
              {(!order?.shippingAddress || !order?.paymentMethod || !order?.orderItems?.length) && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700 font-medium">Complete these steps:</p>
                  <ul className="text-sm text-yellow-600 mt-1">
                    {!order?.shippingAddress && (
                      <li>• <Link to="/shipping" className="text-orange-600 hover:text-orange-700">Add shipping address</Link></li>
                    )}
                    {!order?.paymentMethod && (
                      <li>• <Link to="/payment" className="text-orange-600 hover:text-orange-700">Select payment method</Link></li>
                    )}
                    {!order?.orderItems?.length && (
                      <li>• <Link to="/cart" className="text-orange-600 hover:text-orange-700">Add items to cart</Link></li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
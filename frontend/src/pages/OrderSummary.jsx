import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import toast from "react-hot-toast";
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  Package, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Loader2,
  AlertTriangle,
  RefreshCw,
  Shield
} from 'lucide-react';

// Import your RTK Query hooks
import { 
  useGetOrderByIdQuery, 
  useUpdateOrderPaymentMutation, 
  useDeliverOrderMutation,
  useGetCurrentUserQuery,
  useInitiatePaymobPaymentMutation,
  useVerifyPaymentMutation,
  useProcessPaypalPaymentMutation
} from '../app/api';

// Environment configuration
const PAYMENT_CONFIG = {
  paymob: {
    publicKey: process.env.REACT_APP_PAYMOB_PUBLIC_KEY,
    iframeId: process.env.REACT_APP_PAYMOB_IFRAME_ID
  },
  paypal: {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID
  }
};

// Utility function
const getError = (error) => {
  return error.response?.data?.message || error.data?.message || error.message || 'Something went wrong';
};

// Loading Component
const LoadingBox = () => (
  <div className="flex justify-center items-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

// Message Component
const MessageBox = ({ variant, children }) => {
  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]}`}>
      {children}
    </div>
  );
};

// Payment Status Component
const PaymentStatus = ({ order, isProcessingPayment, onRefresh }) => {
  const [lastChecked, setLastChecked] = useState(Date.now());

  const handleRefresh = async () => {
    setLastChecked(Date.now());
    await onRefresh();
    toast.success('Order status refreshed');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Payment Status</h3>
        <button
          onClick={handleRefresh}
          disabled={isProcessingPayment}
          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Payment</span>
          <div className="flex items-center">
            {order.isPaid ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">Paid</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm font-medium text-red-600">Pending</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Delivery</span>
          <div className="flex items-center">
            {order.isDelivered ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">Delivered</span>
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm font-medium text-orange-600">Processing</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last checked: {new Date(lastChecked).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

// Enhanced Payment Section Component
const PaymentSection = ({ 
  order, 
  selectedPaymentMethod, 
  isProcessingPayment, 
  paymentError, 
  handlePaymobPayment, 
  retryPayment, 
  createPayPalOrder, 
  onPayPalApprove, 
  onPayPalError, 
  onPayPalCancel,
  isPending,
  isResolved,
  isRejected,
  loadingPay
}) => {
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const [showRetryOptions, setShowRetryOptions] = useState(false);

  const handlePaymentAttempt = async (paymentMethod) => {
    setPaymentAttempts(prev => prev + 1);
    setShowRetryOptions(false);
    
    if (paymentMethod === 'Paymob') {
      await handlePaymobPayment();
    }
  };

  const handleRetry = () => {
    setShowRetryOptions(true);
    retryPayment();
  };

  if (order.isPaid) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">Payment Completed</p>
              <p className="text-sm text-green-600">
                Paid on {new Date(order.paidAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Complete Payment</h3>
        {paymentAttempts > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Attempts: {paymentAttempts}
          </span>
        )}
      </div>
      
      {/* Payment Processing Status */}
      {isProcessingPayment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Processing Payment...
              </p>
              <p className="text-sm text-blue-600">
                Please complete the payment in the popup window. Keep this page open.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Error Handling */}
      {paymentError && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Payment Failed</p>
                <p className="text-sm text-red-600 mt-1">{paymentError}</p>
              </div>
            </div>
          </div>
          
          {!showRetryOptions ? (
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                Ready to try again? Contact support if the issue persists.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePaymentAttempt(selectedPaymentMethod)}
                  disabled={isProcessingPayment}
                  className="bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Retry Payment
                </button>
                <button
                  onClick={() => setShowRetryOptions(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Paymob Payment Button */}
      {selectedPaymentMethod === 'Paymob' && !paymentError && (
        <div className="space-y-3">
          <button
            onClick={() => handlePaymentAttempt('Paymob')}
            disabled={isProcessingPayment || loadingPay}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {(isProcessingPayment || loadingPay) ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing with Paymob...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ${order.totalPrice.toFixed(2)} with Paymob
              </div>
            )}
          </button>
          
          {/* Payment Security Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-1" />
              Secured by Paymob SSL encryption
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment Button */}
      {selectedPaymentMethod === 'PayPal' && !paymentError && (
        <div className="space-y-3">
          {isResolved && (
            <div className="w-full">
              <PayPalButtons
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={onPayPalError}
                onCancel={onPayPalCancel}
                disabled={isProcessingPayment}
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'paypal',
                  tagline: false
                }}
              />
            </div>
          )}

          {isPending && (
            <div className="w-full bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading PayPal...
              </div>
            </div>
          )}

          {isRejected && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center text-red-700">
                <XCircle className="h-5 w-5 mr-2" />
                PayPal failed to load. Please try refreshing the page.
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Payment Method Selected */}
      {!selectedPaymentMethod && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="font-medium text-yellow-800">Payment method required</p>
              <p className="text-sm text-yellow-600">
                Please go back to checkout and select a payment method.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Instructions */}
      {selectedPaymentMethod && !isProcessingPayment && !paymentError && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click the payment button to open secure payment window</li>
            <li>• Complete your payment using your preferred method</li>
            <li>• Keep this page open during the payment process</li>
            <li>• You'll return here automatically after payment</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const OrderSummary = () => {
  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();
  
  // State for payment processing
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentWindow, setPaymentWindow] = useState(null);
  
  // RTK Query hooks
  const { data: orderData, isLoading, error, refetch } = useGetOrderByIdQuery({ orderId });
  const order = orderData?.order;
  
  const [updateOrderPayment, { isLoading: loadingPay }] = useUpdateOrderPaymentMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [initiatePaymobPayment] = useInitiatePaymobPaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [processPaypalPayment] = useProcessPaypalPaymentMutation();
  
  const { data: user } = useGetCurrentUserQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    retry: true,
  });
  
  // PayPal script reducer
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();

  // Get payment method more reliably
  const getPaymentMethod = useCallback(() => {
    if (!order) return null;
    
    if (typeof order.paymentMethod === 'string') {
      return order.paymentMethod;
    }
    
    if (order.paymentMethod?.paymentMethod) {
      return order.paymentMethod.paymentMethod;
    }
    
    return null;
  }, [order]);

  const selectedPaymentMethod = getPaymentMethod();

  // Cleanup payment window on unmount
  useEffect(() => {
    return () => {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    };
  }, [paymentWindow]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && paymentWindow && paymentWindow.closed) {
        checkPaymentStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [paymentWindow]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
      setPaymentWindow(null);
      setIsProcessingPayment(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [paymentWindow]);

  // ENHANCED PAYMENT VERIFICATION FUNCTION WITH RETRY LOGIC
  const checkPaymentStatus = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      setIsProcessingPayment(true);
      
      // Add longer delay for first check to ensure payment is processed
      const delay = retryCount === 0 ? 3000 : retryDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Checking payment status (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const verificationResult = await verifyPayment({
        orderId: order._id,
        paymentProvider: 'paymob'
      }).unwrap();

      console.log('Payment verification result:', verificationResult);

      if (verificationResult.success && verificationResult.isPaid) {
        toast.success('Payment verified successfully! Your order has been paid.');
        setPaymentError(null);
        await refetch();
        return true; // Payment successful
      } else if (verificationResult.success && !verificationResult.isPaid) {
        // Payment not completed yet, retry if we have attempts left
        if (retryCount < maxRetries) {
          console.log(`Payment not yet completed, retrying in ${retryDelay}ms...`);
          return await checkPaymentStatus(retryCount + 1);
        } else {
          setPaymentError('Payment verification timeout. Please contact support if you were charged.');
          toast.error('Payment verification timeout. Please contact support if you were charged.');
          return false;
        }
      } else {
        setPaymentError('Payment verification failed. Please contact support if you were charged.');
        toast.error('Payment verification failed. Please contact support if you were charged.');
        return false;
      }
      
    } catch (verifyError) {
      console.error('Payment verification error:', verifyError);
      
      // If it's a network error and we have retries left, try again
      if (retryCount < maxRetries && (
        verifyError.status === 500 || 
        verifyError.message?.includes('network') ||
        verifyError.message?.includes('timeout')
      )) {
        console.log(`Network error, retrying in ${retryDelay}ms...`);
        return await checkPaymentStatus(retryCount + 1);
      }
      
      setPaymentError('Unable to verify payment. Please contact support if you were charged.');
      toast.error('Unable to verify payment. Please contact support if you were charged.');
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ENHANCED PAYMOB PAYMENT HANDLER WITH BETTER WINDOW MONITORING
  const handlePaymobPayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      if (!order || !order._id || !order.totalPrice) {
        throw new Error('Invalid order data');
      }

      if (!PAYMENT_CONFIG.paymob.iframeId) {
        throw new Error('Paymob configuration is missing. Please check environment variables.');
      }

      const customerInfo = {
        firstName: order.shippingAddress?.fullName?.split(' ')[0] || user?.firstName || 'Customer',
        lastName: order.shippingAddress?.fullName?.split(' ').slice(1).join(' ') || user?.lastName || 'User',
        email: user?.email || 'customer@example.com',
        phone: order.shippingAddress?.phone || '+201000000000',
        address: order.shippingAddress?.address || 'N/A',
        city: order.shippingAddress?.city || 'Cairo',
        country: order.shippingAddress?.country || 'Egypt',
        postalCode: order.shippingAddress?.postalCode || '12345'
      };

      const orderItems = order.orderItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      console.log('Initiating Paymob payment...');

      const paymentData = await initiatePaymobPayment({
        orderId: order._id,
        amount: order.totalPrice,
        currency: 'EGP',
        customerInfo: customerInfo,
        orderItems: orderItems
      }).unwrap();

      if (!paymentData.success || !paymentData.paymentToken) {
        throw new Error(paymentData.message || 'Failed to initiate payment');
      }

      console.log('Payment initiated successfully, opening payment window...');

      const callbackUrl = `${window.location.origin}/payment-callback?orderId=${order._id}&provider=paymob&paymobOrderId=${paymentData.paymobOrderId}`;
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMENT_CONFIG.paymob.iframeId}?payment_token=${paymentData.paymentToken}&callback_url=${encodeURIComponent(callbackUrl)}`;
      
      const newPaymentWindow = window.open(
        iframeUrl,
        'paymob_payment',
        'width=900,height=700,scrollbars=yes,resizable=yes,location=yes,status=yes'
      );

      if (!newPaymentWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site and try again.');
      }

      setPaymentWindow(newPaymentWindow);

      // Enhanced monitoring with better timing
      let pollCount = 0;
      const maxPollCount = 900; // 15 minutes with 1 second intervals
      
      const pollInterval = setInterval(async () => {
        pollCount++;
        
        try {
          if (newPaymentWindow.closed) {
            console.log('Payment window closed, checking payment status...');
            clearInterval(pollInterval);
            setPaymentWindow(null);
            
            // Check payment status with retry logic
            await checkPaymentStatus();
            return;
          }
          
          // Check if we've been polling too long
          if (pollCount >= maxPollCount) {
            console.log('Polling timeout reached');
            clearInterval(pollInterval);
            newPaymentWindow.close();
            setPaymentWindow(null);
            setIsProcessingPayment(false);
            setPaymentError('Payment session expired. Please try again.');
            toast.error('Payment session expired. Please try again.');
            return;
          }
          
          // Try to access the window URL to detect callback
          try {
            const windowUrl = newPaymentWindow.location.href;
            if (windowUrl.includes('payment-callback')) {
              console.log('Callback detected in payment window');
              clearInterval(pollInterval);
              newPaymentWindow.close();
              setPaymentWindow(null);
              await checkPaymentStatus();
              return;
            }
          } catch (e) {
            // Cross-origin error is expected when window is on different domain
            // This is normal behavior and not an error
          }
          
        } catch (error) {
          console.error('Polling error:', error);
          clearInterval(pollInterval);
          setPaymentWindow(null);
          setIsProcessingPayment(false);
          setPaymentError('Payment monitoring failed. Please refresh and try again.');
          toast.error('Payment monitoring failed. Please refresh and try again.');
        }
      }, 1000); // Check every second

      // Store the interval for cleanup
      const cleanup = () => {
        clearInterval(pollInterval);
        if (newPaymentWindow && !newPaymentWindow.closed) {
          newPaymentWindow.close();
        }
        setPaymentWindow(null);
        setIsProcessingPayment(false);
      };

      // Return cleanup function
      return cleanup;

    } catch (error) {
      console.error('Paymob payment error:', error);
      setIsProcessingPayment(false);
      setPaymentError(getError(error));
      toast.error(getError(error));
    }
  };

  // Enhanced PayPal Payment
  const createPayPalOrder = async (data, actions) => {
    try {
      if (!order || !order.totalPrice) {
        throw new Error('Invalid order data');
      }

      return await actions.order.create({
        purchase_units: [
          {
            amount: { 
              value: order.totalPrice.toFixed(2),
              currency_code: 'USD'
            },
            description: `Order #${order._id}`,
            custom_id: order._id,
            soft_descriptor: 'Amazon Clone'
          },
        ],
        application_context: {
          brand_name: 'Amazon Clone',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}/order/${order._id}`,
          cancel_url: `${window.location.origin}/order/${order._id}`
        }
      });
    } catch (error) {
      console.error('PayPal order creation error:', error);
      toast.error('Failed to create PayPal order');
      throw error;
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);
      
      const details = await actions.order.capture();
      
      const paymentResult = await processPaypalPayment({
        orderId: order._id,
        paypalOrderId: data.orderID,
        paymentDetails: details
      }).unwrap();

      if (paymentResult.success) {
        toast.success('Payment successful! Your order has been paid.');
        refetch();
      } else {
        throw new Error(paymentResult.message || 'Payment processing failed');
      }
      
    } catch (error) {
      console.error('PayPal payment error:', error);
      setPaymentError(getError(error));
      toast.error(getError(error));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onPayPalError = (err) => {
    console.error('PayPal error:', err);
    setPaymentError('PayPal payment failed. Please try again.');
    toast.error('PayPal payment failed. Please try again.');
    setIsProcessingPayment(false);
  };

  const onPayPalCancel = () => {
    toast.info('Payment cancelled');
    setPaymentError(null);
    setIsProcessingPayment(false);
  };

  // Delivery handler
  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(order._id).unwrap();
      toast.success('Order marked as delivered');
      refetch();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  // Retry payment handler
  const retryPayment = async () => {
    setPaymentError(null);
    setIsProcessingPayment(false);
    
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.close();
    }
    setPaymentWindow(null);
    
    try {
      await refetch();
    } catch (error) {
      console.error('Error refetching order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingBox />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MessageBox variant="danger">
          {getError(error)}
        </MessageBox>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MessageBox variant="danger">
          Order not found
        </MessageBox>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Order {order.orderNumber || order._id}</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Order {order.orderNumber || order._id}
          </h1>
          <p className="text-gray-600 mt-2">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Status */}
            <PaymentStatus 
              order={order} 
              isProcessingPayment={isProcessingPayment}
              onRefresh={refetch}
            />

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </MessageBox>
              ) : (
                <MessageBox variant="warning">
                  Not delivered
                </MessageBox>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                Payment Method
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Method: <span className="font-medium">{selectedPaymentMethod || 'Not specified'}</span>
                </p>
                {order.paymentMethod?.type && (
                  <p className="text-gray-600">
                    Type: <span className="font-medium">{order.paymentMethod.type}</span>
                  </p>
                )}
              </div>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">
                  Not paid
                </MessageBox>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-gray-600" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <Link 
                        to={`/product/${item.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                        <span className="text-gray-600">Price: ${item.price}</span>
                        <span className="font-medium">
                          Subtotal: ${(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            {user && user.isAdmin && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Admin Actions
                </h2>
                <div className="space-y-3">
                  {order.isPaid && !order.isDelivered && (
                    <button
                      onClick={deliverOrderHandler}
                      disabled={loadingDeliver}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingDeliver ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Marking as Delivered...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Truck className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <PaymentSection
                order={order}
                selectedPaymentMethod={selectedPaymentMethod}
                isProcessingPayment={isProcessingPayment}
                paymentError={paymentError}
                handlePaymobPayment={handlePaymobPayment}
                retryPayment={retryPayment}
                createPayPalOrder={createPayPalOrder}
                onPayPalApprove={onPayPalApprove}
                onPayPalError={onPayPalError}
                onPayPalCancel={onPayPalCancel}
                isPending={isPending}
                isResolved={isResolved}
                isRejected={isRejected}
                loadingPay={loadingPay}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
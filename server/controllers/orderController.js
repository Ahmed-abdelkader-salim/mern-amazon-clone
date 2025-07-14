import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import crypto from 'crypto'

export const saveShippingAddress = async (req, res) => {
  try {
    const { fullName, address, city, postalCode, country, location } = req.body;

    // Validate required fields
    if (!fullName || !address || !city || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required',
      });
    }

    // Create shipping address object
    const shippingAddress = {
      fullName,
      address,
      city,
      postalCode,
      country,
      location: location || {},
    };

    // Find existing pending order for user or create new one
    let order = await Order.findOne({
      user: req.user._id,
      orderStatus: 'pending',
    });

    if (order) {
      // Update existing order with shipping address
      order.shippingAddress = shippingAddress;
      await order.save();
    } else {
      // Create new order with shipping address
      order = new Order({
        user: req.user._id,
        orderItems: [], // Will be populated later
        shippingAddress,
        paymentMethod: 'Cash_on_Delivery', // Default, can be changed later
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
      });
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Shipping address saved successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    console.error('Error saving shipping address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save shipping address',
      error: error.message,
    });
  }
};

export const SavePaymentMethod = async(req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Validate payment method
    const validPaymentMethods = ['PayPal', 'Paymob', 'Cash_on_Delivery'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required',
        validMethods: validPaymentMethods
      });
    }

    // Find existing pending order for user
    let order = await Order.findOne({ 
      user: req.user._id, 
      orderStatus: 'pending' 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No pending order found. Please add shipping address first.'
      });
    }

    // Update order with payment method
    order.paymentMethod = paymentMethod;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment method saved successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod
      }
    });

  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment method',
      error: error.message
    });
  }
}


// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    },
  });
};

// Email template function
const createOrderEmailTemplate = (order, user) => {
  const formatPrice = (price) => `$${price.toFixed(2)}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #232F3E; margin-bottom: 10px; }
        .order-number { font-size: 20px; color: #007185; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #232F3E; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; }
        .order-item { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #f0f0f0; }
        .item-image { width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 5px; }
        .item-details { flex: 1; }
        .item-name { font-weight: bold; color: #232F3E; margin-bottom: 5px; }
        .item-price { color: #007185; font-weight: bold; }
        .address-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007185; }
        .total-section { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total-final { font-weight: bold; font-size: 18px; color: #007185; border-top: 2px solid #ddd; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ff9900; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        .order-item-table { width: 100%; }
        .order-item-table td { padding: 15px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
        .order-item-table img { width: 80px; height: 80px; object-fit: cover; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Amazon Clone</div>
          <h2 style="color: #232F3E; margin: 0;">Order Confirmation</h2>
          <div class="order-number">Order #${order.orderNumber}</div>
        </div>

        <!-- Order Status -->
        <div class="section">
          <div class="section-title">Order Status</div>
          <p style="color: #007185; font-weight: bold; font-size: 16px;">✓ Order Confirmed</p>
          <p style="color: #666;">Thank you for your order! We'll send you updates as your order progresses.</p>
        </div>

        <!-- Order Items -->
        <div class="section">
          <div class="section-title">Order Items</div>
          <table class="order-item-table">
            ${order.orderItems.map(item => `
              <tr>
                <td style="width: 100px;">
                  <img src="${item.image}" alt="${item.name}" />
                </td>
                <td>
                  <div class="item-name">${item.name}</div>
                  <div style="color: #666; font-size: 14px;">Brand: ${item.brand}</div>
                  <div style="color: #666; font-size: 14px;">Category: ${item.category}</div>
                  <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
                </td>
                <td style="text-align: right;">
                  <div class="item-price">${formatPrice(item.price)}</div>
                  <div style="color: #666; font-size: 14px;">Total: ${formatPrice(item.price * item.quantity)}</div>
                </td>
              </tr>
            `).join('')}
          </table>
        </div>

        <!-- Shipping Address -->
        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div class="address-box">
            <strong>${order.shippingAddress.fullName}</strong><br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}
          </div>
        </div>

        <!-- Payment Method -->
        <div class="section">
          <div class="section-title">Payment Method</div>
          <p style="color: #666;">${order.paymentMethod}</p>
        </div>

        <!-- Order Summary -->
        <div class="section">
          <div class="section-title">Order Summary</div>
          <div class="total-section">
            <div class="total-row">
              <span>Items Total:</span>
              <span>${formatPrice(order.itemsPrice)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>${order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatPrice(order.taxPrice)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>${formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/order/${order._id}" class="button">
            View Order Details
          </a>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>If you have any questions, please contact our customer service.</p>
          <p style="font-size: 12px; color: #999;">
            This email was sent to ${user.email} regarding order #${order.orderNumber}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Amazon Clone',
        address: process.env.GMAIL_USER
      },
      to: user.email,
      subject: `Order Confirmation - Order #${order.orderNumber}`,
      html: createOrderEmailTemplate(order, user),
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get the pending order
    let order = await Order.findOne({
      user: userId,
      orderStatus: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No pending order found. Please complete checkout process first.'
      });
    }

    // Step 2: Validate shipping and payment
    if (!order.shippingAddress || !order.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Order is incomplete. Please add shipping address and payment method.'
      });
    }

    // Step 3: Get user's cart
    const cart = await Cart.findOne({ userId }); // note: userId not user
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items to cart first.'
      });
    }

    // Step 4: Map cart items to order items
    let itemsPrice = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.price * item.quantity;
      itemsPrice += itemTotal;

      return {
        product: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        brand: item.brand,
        category: item.category
      };
    });

    // Step 5: Calculate totals
    const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
    const taxPrice = Math.round((itemsPrice * 0.1) * 100) / 100;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Step 6: Update the order
    order.orderItems = orderItems;
    order.itemsPrice = itemsPrice;
    order.shippingPrice = shippingPrice;
    order.taxPrice = taxPrice;
    order.totalPrice = totalPrice;
    order.orderStatus = 'confirmed';
    order.placedAt = new Date();

    await order.save();

    // Step 7: Get user details for email
    const user = await User.findById(userId);

    // Step 8: Send order confirmation email
    const emailSent = await sendOrderConfirmationEmail(order, user);

    // Step 9: Delete cart
    await Cart.findOneAndDelete({ userId });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      emailSent,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        totalPrice: order.totalPrice,
        placedAt: order.placedAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        orderItems: order.orderItems
      }
    });

  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};

export const getPendingOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      orderStatus: 'pending'
    }).populate('orderItems.product', 'name price image slug brand category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No pending order found'
      });
    }

    let orderItems = order.orderItems;

    // Fallback to cart if orderItems is empty
    if (!orderItems || orderItems.length === 0) {
      const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
      
      if (cart && cart.items.length > 0) {
        orderItems = cart.items.map(item => ({
          _id: item._id,
          product: item.productId?._id, // populate may return undefined
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          slug: item.slug || item.productId?.slug,
          brand: item.brand,
          category: item.category
        }));

        const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
        const taxPrice = Math.round(itemsPrice * 0.1 * 100) / 100;
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        return res.json({
          success: true,
          order: {
            _id: order._id,
            orderItems,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt
          }
        });
      }
    }

    // Default return if order has items
    const responseOrder = {
      _id: order._id,
      orderItems: orderItems.map(item => ({
        _id: item._id,
        product: item.product?._id,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product?.image || item.image,
        slug: item.product?.slug || item.slug,
        brand: item.product?.brand || item.brand,
        category: item.product?.category || item.category
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      itemsPrice: order.itemsPrice,
      shippingPrice: order.shippingPrice,
      taxPrice: order.taxPrice,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt
    };

    res.json({
      success: true,
      order: responseOrder
    });

  } catch (error) {
    console.error('Error fetching pending order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending order',
      error: error.message
    });
  }
};


export const getOrders = async(req, res) => {
  try{
    const orders = await Order.find();
    if(!orders || orders.length === 0){
      return res.status(404).json({success:false, message:'Not Found Orders'});
    }

    res.status(200).json({success:true, data:orders});
  }catch(error){
    return res.status(500).json({
      success:false,
      message:'Failed to get Orders',
      error:error.message
    })
  }
};

export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Get order by ID and populate user info (optional)
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Optional: Check if the order belongs to the logged-in user (for security)
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting order",
      error: error.message,
    });
  }
};


// Paymob configuration
const PAYMOB_CONFIG = {
  apiKey: process.env.PAYMOB_API_KEY,
  integrationId: process.env.PAYMOB_INTEGRATION_ID,
  iframeId: process.env.PAYMOB_IFRAME_ID,
  hmacSecret: process.env.PAYMOB_HMAC_SECRET,
  baseUrl: 'https://accept.paymob.com/api'
};

// PayPal configuration
const PAYPAL_CONFIG = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com'
};

// Utility function to generate PayPal access token
export const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`).toString('base64');
  
  const response = await axios.post(`${PAYPAL_CONFIG.baseUrl}/v1/oauth2/token`, 
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  return response.data.access_token;
};

// Utility function to verify Paymob HMAC
export const verifyPaymobHMAC = (data, receivedHmac) => {
  const {
    amount_cents,
    created_at,
    currency,
    error_occured,
    has_parent_transaction,
    id,
    integration_id,
    is_3d_secure,
    is_auth,
    is_capture,
    is_refunded,
    is_standalone_payment,
    is_voided,
    order_id,
    owner,
    pending,
    source_data_pan,
    source_data_sub_type,
    source_data_type,
    success
  } = data;

  const concatenatedString = [
    amount_cents,
    created_at,
    currency,
    error_occured,
    has_parent_transaction,
    id,
    integration_id,
    is_3d_secure,
    is_auth,
    is_capture,
    is_refunded,
    is_standalone_payment,
    is_voided,
    order_id,
    owner,
    pending,
    source_data_pan,
    source_data_sub_type,
    source_data_type,
    success
  ].join('');

  const calculatedHmac = crypto
    .createHmac('sha512', PAYMOB_CONFIG.hmacSecret)
    .update(concatenatedString)
    .digest('hex');

  return calculatedHmac === receivedHmac;
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/pay
// @access  Private (Cookie-based auth)
export const updateOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order belongs to user (unless admin)
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const {
    paymentProvider,
    transactionId,
    paymentStatus,
    paymentDetails,
    paidAmount
  } = req.body;

  // Validate payment amount
  if (paidAmount && Math.abs(paidAmount - order.totalPrice) > 0.01) {
    res.status(400);
    throw new Error('Payment amount does not match order total');
  }

  // Update order payment info
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: transactionId,
    status: paymentStatus,
    update_time: new Date(),
    email_address: req.user.email,
    provider: paymentProvider,
    details: paymentDetails
  };

  // Update order status
  order.orderStatus = 'paid';

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Payment successful',
    order: updatedOrder
  });
});

// @desc    Mark order as delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin (Cookie-based auth)
export const deliverOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.isPaid) {
    res.status(400);
    throw new Error('Order is not paid yet');
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error('Order is already delivered');
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();
  order.orderStatus = 'delivered';

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Order marked as delivered',
    order: updatedOrder
  });
});




// @desc    Process PayPal payment
// @route   POST /api/orders/:id/paypal
// @access  Private (Cookie-based auth)
export const processPaypalPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const { paypalOrderId, paymentDetails } = req.body;

  try {
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Verify payment with PayPal
    const verifyResponse = await axios.get(
      `${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders/${paypalOrderId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paypalOrder = verifyResponse.data;
    const isCompleted = paypalOrder.status === 'COMPLETED';
    const paidAmount = parseFloat(paypalOrder.purchase_units[0].amount.value);

    // Verify amount matches
    if (Math.abs(paidAmount - order.totalPrice) > 0.01) {
      res.status(400);
      throw new Error('Payment amount mismatch');
    }

    if (isCompleted) {
      // Update order as paid
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paypalOrderId,
        status: paypalOrder.status,
        update_time: paypalOrder.update_time,
        email_address: paypalOrder.payer.email_address,
        provider: 'paypal',
        details: paymentDetails
      };
      order.orderStatus = 'paid';

      await order.save();

      res.json({
        success: true,
        message: 'PayPal payment processed successfully',
        order: order
      });
    } else {
      res.status(400);
      throw new Error('PayPal payment not completed');
    }

  } catch (error) {
    console.error('PayPal payment error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Failed to process PayPal payment');
  }
});



// @desc    Verify payment status
// @route   POST /api/orders/:id/verify
// @access  Private (Cookie-based auth)
export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to verify this order');
  }

  const { paymentProvider } = req.body;

  try {
    if (paymentProvider === 'paymob') {
      // Get the stored paymob order ID from our order
      const paymobOrderId = order.paymentInfo?.paymobOrderId;
      
      if (!paymobOrderId) {
        res.status(400);
        throw new Error('No Paymob order ID found for this order');
      }

      // Get authentication token
      const authResponse = await axios.post(`${PAYMOB_CONFIG.baseUrl}/auth/tokens`, {
        api_key: PAYMOB_CONFIG.apiKey
      });

      const authToken = authResponse.data.token;

      // Check order status from Paymob - Fix: Use query parameter, not Authorization header
      const orderStatusResponse = await axios.get(
        `${PAYMOB_CONFIG.baseUrl}/ecommerce/orders/${paymobOrderId}?token=${authToken}`
      );

      const paymobOrderData = orderStatusResponse.data;
      
      // Check if payment is successful
      const isPaid = paymobOrderData.paid_amount_cents > 0;
      
      console.log('Paymob order verification:', {
        paymobOrderId,
        paid_amount_cents: paymobOrderData.paid_amount_cents,
        isPaid,
        orderStatus: paymobOrderData
      });

      if (isPaid && !order.isPaid) {
        // Update order as paid
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: paymobOrderData.id,
          status: 'completed',
          update_time: new Date(),
          email_address: req.user.email,
          provider: 'paymob',
          details: paymobOrderData
        };
        order.orderStatus = 'paid';

        await order.save();
        
        console.log('Order marked as paid:', order._id);
      }

      res.json({
        success: true,
        isPaid: isPaid,
        paymentDetails: paymobOrderData,
        orderUpdated: isPaid && !order.isPaid
      });

    } else {
      res.status(400);
      throw new Error('Unsupported payment provider');
    }

  } catch (error) {
    console.error('Payment verification error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Send more detailed error info
    res.status(500);
    throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
  }
});

// @desc    Initiate Paymob payment (Enhanced with better error handling)
// @route   POST /api/orders/:id/paymob/initiate
// @access  Private (Cookie-based auth)
export const initiatePaymobPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email firstName lastName');
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order belongs to user
  if (order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const { amount, currency, customerInfo, orderItems } = req.body;

  // Create a safe customerInfo object with defaults
  const safeCustomerInfo = {
    firstName: customerInfo?.firstName || req.user?.firstName || 'Customer',
    lastName: customerInfo?.lastName || req.user?.lastName || 'User',
    email: customerInfo?.email || req.user?.email || 'customer@example.com',
    phone: customerInfo?.phone || '+201000000000',
    address: customerInfo?.address || order.shippingAddress?.address || 'N/A',
    city: customerInfo?.city || order.shippingAddress?.city || 'Cairo',
    country: customerInfo?.country || order.shippingAddress?.country || 'Egypt',
    postalCode: customerInfo?.postalCode || order.shippingAddress?.postalCode || '12345'
  };

  try {
    // Step 1: Get authentication token
    const authResponse = await axios.post(`${PAYMOB_CONFIG.baseUrl}/auth/tokens`, {
      api_key: PAYMOB_CONFIG.apiKey
    });

    const authToken = authResponse.data.token;

    // Step 2: Create order on Paymob
    const paymobOrder = await axios.post(`${PAYMOB_CONFIG.baseUrl}/ecommerce/orders`, {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: Math.round(order.totalPrice * 100), // Convert to cents
      currency: currency || 'EGP',
      items: order.orderItems.map(item => ({
        name: item.name,
        amount_cents: Math.round(item.price * 100),
        description: item.name,
        quantity: item.quantity
      }))
    });

    const paymobOrderId = paymobOrder.data.id;

    // Step 3: Create payment key
    const paymentKeyResponse = await axios.post(`${PAYMOB_CONFIG.baseUrl}/acceptance/payment_keys`, {
      auth_token: authToken,
      amount_cents: Math.round(order.totalPrice * 100),
      expiration: 3600, // 1 hour
      order_id: paymobOrderId,
      billing_data: {
        apartment: safeCustomerInfo.address,
        email: safeCustomerInfo.email,
        floor: 'NA',
        first_name: safeCustomerInfo.firstName,
        street: safeCustomerInfo.address,
        building: 'NA',
        phone_number: safeCustomerInfo.phone,
        shipping_method: 'NA',
        postal_code: safeCustomerInfo.postalCode,
        city: safeCustomerInfo.city,
        country: safeCustomerInfo.country,
        last_name: safeCustomerInfo.lastName,
        state: safeCustomerInfo.city
      },
      currency: currency || 'EGP',
      integration_id: PAYMOB_CONFIG.integrationId,
      lock_order_when_paid: true
    });

    const paymentToken = paymentKeyResponse.data.token;

    // Store payment info in order for later verification
    order.paymentInfo = {
      paymobOrderId: paymobOrderId,
      paymentToken: paymentToken,
      initiatedAt: new Date(),
      authToken: authToken // Store for later verification
    };

    await order.save();

    console.log('Paymob payment initiated:', {
      orderId: order._id,
      paymobOrderId,
      paymentToken: paymentToken.substring(0, 20) + '...' // Log partial token for debugging
    });

    res.json({
      success: true,
      paymentToken: paymentToken,
      paymobOrderId: paymobOrderId,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_CONFIG.iframeId}?payment_token=${paymentToken}`
    });

  } catch (error) {
    console.error('Paymob initiation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(500);
    throw new Error(`Failed to initiate Paymob payment: ${error.response?.data?.message || error.message}`);
  }
});

// @desc    Enhanced webhook handler with better error handling
// @route   POST /api/orders/paymob/webhook
// @access  Public (but verified via HMAC)
export const handlePaymobWebhook = asyncHandler(async (req, res) => {
  console.log('Received Paymob webhook:', req.body);
  
  const { hmac, ...paymentData } = req.body;

  // Verify HMAC if you have the function implemented
  if (typeof verifyPaymobHMAC === 'function') {
    if (!verifyPaymobHMAC(paymentData, hmac)) {
      res.status(400);
      throw new Error('Invalid HMAC signature');
    }
  }

  const { order_id, success, amount_cents, id: transactionId } = paymentData;

  try {
    // Find order by Paymob order ID
    const order = await Order.findOne({ 'paymentInfo.paymobOrderId': order_id });

    if (!order) {
      console.log('Order not found for Paymob webhook:', order_id);
      return res.status(200).json({ message: 'Order not found' });
    }

    console.log('Processing webhook for order:', order._id, 'Success:', success, 'Current isPaid:', order.isPaid);

    if (success && !order.isPaid) {
      // Update order as paid
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: transactionId,
        status: 'completed',
        update_time: new Date(),
        provider: 'paymob',
        details: paymentData
      };
      order.orderStatus = 'paid';

      await order.save();

      console.log('Order updated via Paymob webhook:', order._id);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});
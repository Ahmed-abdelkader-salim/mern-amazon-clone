import express from "express";
import {isAuth} from "../middleware/auth.js"
import {isAdmin} from "../middleware/isAdmin.js";
import { 
    getOrderById, getOrders, getPendingOrder, placeOrder, SavePaymentMethod, saveShippingAddress, 
    updateOrderPayment, deliverOrder, verifyPayment, initiatePaymobPayment, processPaypalPayment, handlePaymobWebhook
 } from "../controllers/orderController.js";
const router = express.Router();


// save shipping address

router.post('/shipping', isAuth, saveShippingAddress);
router.post('/paymentmethod', isAuth, SavePaymentMethod);
router.post('/placeorder', isAuth, placeOrder);
router.get('/pending', isAuth, getPendingOrder);
router.get('/order/:id', isAuth, getOrderById);
router.get('/', isAuth, getOrders);


// update order payment status
router.put('/:id/pay', isAuth, updateOrderPayment);

// mark order as a delivered (admin only)
router.put('/:id/deliver', isAuth, isAdmin, deliverOrder);

// Initiate paymob payment
router.post('/:id/paymob/initiate', isAuth, initiatePaymobPayment);

// verify payment status
router.post('/:id/verify', isAuth, verifyPayment);

// paypal payment proccess
router.post('/:id/paypal', isAuth, processPaypalPayment);

// handle paymob webhooks (public but verified via HMAC)
router.post('/paymob/webhook',  handlePaymobWebhook);


export default router;

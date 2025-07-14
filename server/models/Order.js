import mongoose from "mongoose";


const orderItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    brand: { type: String, required: true },
    category: { type: String, required: true }
});

const shippingAddressSchema = new mongoose.Schema({
    fullName:{type:String, required:true },
    address:{type:String, required:true},
    city:{type:String, required:true},
    postalCode:{type:Number, required:true},
    country:{type:String, required:true},
    location:{
        lat:{type:Number},
        lang:{type:Number},
        address:String,
        name:String,
        vicinity:String,
        googleAddressId:String
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber:{
        type:String,
        unique:true,
        default:function(){
            return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderItems:[orderItemSchema],
    shippingAddress:{
        type:shippingAddressSchema,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true,
        enum:['PayPal', 'Paymob', 'Cash_on_Delivery', 'bankTransfer'],
    },
    paymentResult:{
        id:String,
        status:String,
        update_time:String,
        email_address:String,
        provider: String,
        transaction_id:String,
    },
    paymentInfo: {
        paymobOrderId: Number,
        paymentToken: String,
        initiatedAt: Date,
        authToken: String,
      },
    itemsPrice:{type:Number, required:true},
    shippingPrice:{type:Number, required:true, default:0},
    taxPrice:{type:Number, required:true, default:0},
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'confirmed','delivered', 'cancelled'],
      default: 'pending'
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    shippedAt: { type: Date },
    estimatedDelivery: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
    cancellationReason: { type: String },
    refundAmount: { type: Number, default: 0 },
    isRefunded: { type: Boolean, default: false },
    refundedAt: { type: Date }

}, {timestamps:true});


const Order = mongoose.model('Order', orderSchema);

export default Order;
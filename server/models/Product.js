import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    name:{type:String, required:true},
    comment:{type:String, required:true},
    rating:{type:Number, required:true}
}, {timestamps:true})


const productSchema = new mongoose.Schema({
    name:{type:String, required:true},
    slug:{type:String, required:true, unique:true},
    image:{type:String, required:true},
    description:{type:String, required:true},
    images:[String],
    price:{type:Number, required:true},
    originalPrice:{type:Number, required:true},
    brand:{type:String, required:true},
    category:{type:String, required:true},
    countInStock:{type:Number, required:true},
    isPrime: Boolean,
    featured:Boolean,
    hasCoupon: Boolean,
    isFreeShipping: Boolean,
    numReviews:{type:Number, required:true},
    rating: { type: Number, required: true },
    reviews:[reviewSchema]

}, {timestamps:true});


const Product = mongoose.model("Product", productSchema);
export default Product;
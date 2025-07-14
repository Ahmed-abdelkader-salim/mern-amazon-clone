import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    isAdmin:{type:Boolean, default:false, required:true},
    isVerified: {
        type: Boolean,
        default: false
    },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    resetToken:{type: String},
    resetTokenExpires:{type:Date},
    verificationCode: {
        type: String
    },
    verificationToken: {
        type: String
    },
    verificationCodeExpiresAt: {
        type: Date
    },
    verificationTokenExpiresAt: {
        type: Date
    },
    verificationAttempts: {
        type: Number,
        default: 0
    },
    lastVerificationSent: {
        type: Date,
        default: Date.now
    }

}, {timestamps:true});


const User = mongoose.model("User", userSchema);

export default User;
import express from 'express';
import { 
    login, register, verifyEmail, resendVerificationCode, forgotPassword,  verifyCode, resendCode,
     resetPasswordWithToken, validateResetToken, logout, getCurrentUser,
     UpdatedProfile

    } from '../controllers/authController.js';
const router = express.Router();
import rateLimit from 'express-rate-limit';
const resendCodeLimiter = rateLimit({
    windowMs:15 * 60 * 1000,
    max:3,
    message: "Too many resend code requests, please try again later."
});

import {isAuth} from "../middleware/auth.js";
import {isAdmin} from "../middleware/isAdmin.js";


router.post("/login", login);
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification",  resendCodeLimiter, resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/resend-code", resendCodeLimiter, resendCode);
router.post("/reset-password", resetPasswordWithToken);
router.post("/validate-reset-token", validateResetToken);
router.get("/me", getCurrentUser);
router.post("/logout", logout);

router.put("/profile", isAuth, UpdatedProfile);


export default router;

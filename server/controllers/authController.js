import crypto from "crypto";
import bcrypt  from "bcryptjs"
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import Joi from 'joi';
import cookie from "cookie"
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateToken } from "../utils/generateToken.js";
import { generateJWTToken } from "../utils/generateJWT.js";
import dotenv from 'dotenv';
dotenv.config(); // This must be at the very top
import nodemailer from "nodemailer";






// validation schemas

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});


const verifyCodeSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required()
});



const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

export const sendVerificationEmail = async (email, verificationCode, name) => {
    const mailOptions = {
        from: "Amazon Clone",
        to: email,
        subject: 'Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
                <p>Hello ${name},</p>
                <p>Thank you for registering! Please use the verification code below to verify your email address:</p>
                
                <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
                </div>
                
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't create this account, you can safely ignore this email.</p>
                
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
};

export const register = async(req, res) => {
    try {
        // validate input
        const {error} = registerSchema.validate(req.body);

        if(error){
            return res.status(400).json({message:error.details[0].message});
        };
        const {name, email, password} = req.body;

        // check if user already exist
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"user already exists with this email"});
        }

        // hash password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // 
        const verificationToken = generateToken();
        const verificationCode = generateVerificationCode();
        // create user 

        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationCode: verificationCode,
            verificationToken: verificationToken,
            verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            isVerified: false,
            verificationAttempts: 0,
            lastVerificationSent: Date.now()
        });

        await user.save();

        // send verification Email
        await sendVerificationEmail(email, verificationCode, name);

        res.status(201).json({
            success: true,
            message: "Account created successfully. Please check your email for verification code.",
            data: {
                email: user.email,
                name: user.name,
                verificationRequired: true
            }
        });
    } catch (error) {
        res.status(500).json({message:error.message || "server error"})
    }
};

export const login = async(req, res) => {
    try {
        // validate input 
        const {error} = loginSchema.validate(req.body);
        if(error){
            return res.status(400).json({message:error.details[0].message})
        }

        const {email, password} = req.body;

        // find user 

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or Password"})
        };

        // check password 
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const isVerified = user.isVerified;
        if (!isVerified) {
          return res
            .status(400)
            .json({ success: false, message: "Email not verified" });
        }
    
        generateJWTToken(res, user._id);

        res.status(200)
        .json({
          message: 'Login successful',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isAuthenticated: true
          }
        });
    } catch (error) {

        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        
        if (!email || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required"
            });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }
        
        // Check verification attempts (prevent brute force)
        if (user.verificationAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many verification attempts. Please request a new code."
            });
        }
        
        // Check if code expired
        if (user.verificationCodeExpiresAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired. Please request a new one."
            });
        }
        
        // Check if code matches
        if (user.verificationCode !== verificationCode) {
            // Increment failed attempts
            user.verificationAttempts += 1;
            await user.save();
            
            return res.status(400).json({
                success: false,
                message: `Invalid verification code. ${5 - user.verificationAttempts} attempts remaining.`
            });
        }
        
        // Verify user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiresAt = undefined;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        user.verificationAttempts = 0;
        
        await user.save();
        
        // Generate JWT token
        generateJWTToken(res, user._id);
        
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Resend verification code
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }
        
        // Rate limiting - prevent spam (1 minute between requests)
        const timeSinceLastSent = Date.now() - user.lastVerificationSent;
        if (timeSinceLastSent < 60 * 1000) {
            const waitTime = Math.ceil((60 * 1000 - timeSinceLastSent) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitTime} seconds before requesting a new code`
            });
        }
        
        // Generate new verification code
        const verificationCode = generateVerificationCode();
        
        // Update user
        user.verificationCode = verificationCode;
        user.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        user.verificationAttempts = 0; // Reset attempts
        user.lastVerificationSent = Date.now();
        
        await user.save();
        
        // Send new verification email
        await sendVerificationEmail(email, verificationCode, user.name);
        
        res.status(200).json({
            success: true,
            message: "New verification code sent to your email"
        });
        
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



 
export const forgotPassword = async(req, res) => {
  try {
    console.log('Forgot password request received:', req.body);
    
    // Validate input
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }
    
    const { email } = req.body;
    console.log('Looking for user with email:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        console.log('User not found for email:', email);
        return res.status(404).json({ message: 'No account found with this email address' });
    }

    console.log('User found:', user.email);

    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    console.log('Generated reset code:', resetCode);

    // Save reset code to user
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();
    
    console.log('Reset code saved to user');

// Email HTML template
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Password Reset Request</h2>
        
        <p style="font-size: 16px;">Hello,</p>
        
        <p style="font-size: 16px;">We received a request to reset your password. If you made this request, please use the verification code below:</p>
        
        <div style="background: #ffffff; border: 2px solid #3498db; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <h1 style="color: #3498db; font-size: 36px; margin: 10px 0; letter-spacing: 3px; font-weight: bold;">${resetCode}</h1>
        </div>
        
        <p style="font-size: 16px;"><strong>Important:</strong> This code will expire in 15 minutes for security reasons.</p>
        
        <p style="font-size: 16px;">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
            This is an automated message, please do not reply to this email.
        </p>
        
        <p style="font-size: 14px; color: #666; text-align: center;">
            Best regards,<br>
            <strong>Your App Team</strong>
        </p>
    </div>
</body>
</html>
`;

    // Check Gmail environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error('Gmail environment variables not set');
        return res.status(500).json({ message: 'Email service not configured' });
    }

    console.log('Attempting to send email via Gmail...');

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS // You'll need an App Password for this
        }
    });

    // Send email using Gmail
    try {
      const info = await transporter.sendMail({
        from: `"Amazon Clone Support" <Amazon Clone>`, // Better sender name
    to: email,
    subject: "🔐 Your Password Reset Code", // Add emoji to make it stand out
    html: emailHtml,
    // Add these headers to improve deliverability
    headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
    }
      });

      console.log('Email sent successfully to:', email);
      console.log('Message ID:', info.messageId);

    } catch (emailError) {
        console.error('Failed to send email:', emailError);
        return res.status(500).json({ 
            message: 'Failed to send reset email. Please try again later.',
            success: false 
        });
    }

    // Mask email for response (for security)
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
    
    console.log('Success - sending response');
    
    res.status(200).json({
        message: 'Password reset code sent to your email',
        email: maskedEmail,
        success: true
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    res.status(500).json({ 
        message: 'Server error. Please try again later.',
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  }
};

// Add this utility function to generate reset tokens
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Modified verifyCode function
 export const verifyCode = async(req, res) => {
    try {
        // Validate input
        const { error } = verifyCodeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        
        const {email, code} = req.body;
        
        // Find user
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        // Check if code exists and is not expired
        if(!user.resetCode || !user.resetCodeExpires){
            return res.status(400).json({message:'Reset code has expired. Please request a new one.'});
        };

        if(user.resetCodeExpires < new Date()) {
            return res.status(400).json({message:"Reset code has expired. Please request a new one"});
        };

        if(user.resetCode !== code){
            return res.status(400).json({ message: 'Invalid verification code' });
        };

        // Generate reset token (valid for 10 minutes)
        const resetToken = generateResetToken();
        const resetTokenExpires = new Date(Date.now() + 7 * 60 * 1000); // 10 minutes
        
        // Clear the verification code and set reset token
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        res.json({
            message: 'Code verified successfully',
            verified: true,
            resetToken: resetToken, // Send this to frontend
            // Or send a URL like Amazon does
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
        });
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const resendCode = async(req, res) => {
  try {
    // validate input
    const {error} = forgotPasswordSchema.validate(req.body);
    if(error){
      return res.status(400).json({message:error.details[0].message})
    }

    const {email} = req.body;

    // find user 
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message:"no account found with this email address"});
    }
    // generate a new reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;

    await user.save();

    // Email HTML template
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Password Reset Request</h2>
            
            <p style="font-size: 16px;">Hello,</p>
            
            <p style="font-size: 16px;">We received a request to reset your password. If you made this request, please use the verification code below:</p>
            
            <div style="background: #ffffff; border: 2px solid #3498db; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <h1 style="color: #3498db; font-size: 36px; margin: 10px 0; letter-spacing: 3px; font-weight: bold;">${resetCode}</h1>
            </div>
            
            <p style="font-size: 16px;"><strong>Important:</strong> This code will expire in 15 minutes for security reasons.</p>
            
            <p style="font-size: 16px;">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; text-align: center;">
                This is an automated message, please do not reply to this email.
            </p>
            
            <p style="font-size: 14px; color: #666; text-align: center;">
                Best regards,<br>
                <strong>Your App Team</strong>
            </p>
        </div>
    </body>
    </html>
    `;
    // Check Gmail environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('Gmail environment variables not set');
      return res.status(500).json({ message: 'Email service not configured' });
  }

  console.log('Attempting to send email via Gmail...');

  // Create Gmail transporter
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS // You'll need an App Password for this
      }
  });

  // Send email using Gmail
  try {
    const info = await transporter.sendMail({
      from: `"Amazon Clone Support" <Amazon Clone>`, // Better sender name
  to: email,
  subject: "🔐 Your Password Reset Code", // Add emoji to make it stand out
  html: emailHtml,
  // Add these headers to improve deliverability
  headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
  }
    });

    console.log('Email sent successfully to:', email);
    console.log('Message ID:', info.messageId);

  } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return res.status(500).json({ 
          message: 'Failed to send reset email. Please try again later.',
          success: false 
      });
  }

   // Mask email for response
   const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
    
   res.status(200).json({
     message: 'New verification code sent to your email',
     email: maskedEmail,
     success: true
   });

  } catch (error) {
       console.error('Resend code error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again later.',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}



// Modified resetPassword function (now uses token instead of code)
const resetPasswordWithTokenSchema = Joi.object({
  resetToken: Joi.string().required(),
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(6).required()
});

export const resetPasswordWithToken = async (req, res) => {
  try {
      console.log('=== RESET PASSWORD REQUEST ===');
      console.log('Request body:', req.body);
      console.log('Headers:', req.headers);
      
      const { token, newPassword, email } = req.body;
      
      console.log('Extracted data:');
      console.log('- Token:', token);
      console.log('- Email:', email);
      console.log('- New password provided:', !!newPassword);
      console.log('================================');
      
      // Validate required fields
      if (!token || !newPassword) {
          console.log('❌ Missing required fields');
          return res.status(400).json({
              success: false,
              message: "Token and new password are required"
          });
      }
      
      console.log('🔍 Searching for user with token...');
      
      // Find user with this reset token
      const user = await User.findOne({
          resetToken: token,
          resetTokenExpires: { $gt: Date.now() }
      });
      
      console.log('Database query result:');
      console.log('- User found:', !!user);
      
      if (user) {
          console.log('- User email:', user.email);
          console.log('- Token expires:', new Date(user.resetTokenExpires));
          console.log('- Current time:', new Date());
          console.log('- Token valid:', user.resetTokenExpires > Date.now());
      } else {
          console.log('❌ No user found or token expired');
          
          // Additional debugging: Check if user exists with this token (ignoring expiry)
          const userWithToken = await User.findOne({ resetToken: token });
          if (userWithToken) {
              console.log('⚠️ Token exists but expired. Expires:', new Date(userWithToken.resetTokenExpires));
          } else {
              console.log('⚠️ No user found with this token at all');
          }
      }
      
      if (!user) {
          return res.status(400).json({
              success: false,
              message: "Invalid or expired reset token"
          });
      }
      
      console.log('✅ Token valid, updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update user password and clear reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();
      
      console.log('✅ Password updated successfully');
      console.log('================================');
      
      res.status(200).json({
          success: true,
          message: "Password reset successfully"
      });
      
  } catch (error) {
      console.error('❌ Password reset error:', error);
      res.status(500).json({ 
          success: false,
          message: error.message || "Server error" 
      });
  }
};

export const validateResetToken = async (req, res) => {
  try {
      console.log('=== TOKEN VALIDATION REQUEST ===');
      console.log('Request body:', req.body);
      
      const { token } = req.body;
      
      console.log('Token to validate:', token);
      
      if (!token) {
          console.log('❌ No token provided');
          return res.status(400).json({ 
              success: false,
              message: "Reset token is required" 
          });
      }
      
      console.log('🔍 Searching for user with token...');
      
      // Find user with this reset token
      const user = await User.findOne({
          resetToken: token,
          resetTokenExpires: { $gt: Date.now() }
      });
      
      console.log('Validation result:');
      console.log('- User found:', !!user);
      
      if (user) {
          console.log('- User email:', user.email);
          console.log('- Token expires:', new Date(user.resetTokenExpires));
          console.log('- Current time:', new Date());
          console.log('- Time until expiry:', user.resetTokenExpires - Date.now(), 'ms');
      }
      
      if (!user) {
          console.log('❌ Token validation failed');
          
          // Check if token exists but is expired
          const expiredUser = await User.findOne({ resetToken: token });
          if (expiredUser) {
              console.log('⚠️ Token found but expired at:', new Date(expiredUser.resetTokenExpires));
          } else {
              console.log('⚠️ Token not found in database');
          }
          
          return res.status(400).json({ 
              success: false,
              message: "Invalid or expired reset token" 
          });
      }
      
      console.log('✅ Token validation successful');
      console.log('================================');
      
      res.status(200).json({
          success: true,
          message: "Token is valid",
          email: user.email
      });
      
  } catch (error) {
      console.error('❌ Token validation error:', error);
      res.status(500).json({ 
          success: false,
          message: error.message || "Server error" 
      });
  }
};



export const getCurrentUser = async (req, res) => {
    try {
      const token = req.cookies.token;
      
      if (!token) {
        return res.status(401).json({ 
          message: 'Not authenticated',
          isAuthenticated: false 
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and exclude password
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        // Clear invalid cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined
          });
        return res.status(404).json({ 
          message: 'User not found',
          isAuthenticated: false 
        });
      }
      
      // Return user data with isAuthenticated flag
      res.json({
        ...user.toObject(),
        isAuthenticated: true  // Add this flag
      });
      
    } catch (error) {
      console.error('Auth verification error:', error);
      
      // Clear invalid cookie with same options used when setting
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
        path: '/'
      });
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          isAuthenticated: false 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          isAuthenticated: false 
        });
      }
      
      res.status(401).json({ 
        message: 'Authentication failed',
        isAuthenticated: false 
      });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token", { 
            httpOnly: true, 
            sameSite: "strict", 
            secure: process.env.NODE_ENV === 'production' // Only secure in production
        });
        
        // Send success response
        res.status(200).json({ 
            success: true, 
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Logout failed" 
        });
    }
};



// updated profile
export const UpdatedProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Update fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        // Handle password update if provided
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        
        const updatedUser = await user.save();

        res.status(200).json({
            message: "User Profile Updated Successfully", 
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateJWTToken(res, user._id)
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message || "Network Error" });
    }
};










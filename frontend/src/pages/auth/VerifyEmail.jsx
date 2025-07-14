import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

import { 
  useVerifyEmailMutation, 
  useResendVerificationCodeMutation 
} from '../../app/api'; // Adjust path

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resendCooldown, setResendCooldown] = useState(0);

  // RTK Query mutations
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendCode, { isLoading: isResending }] = useResendVerificationCodeMutation();

  // Get email and name from navigation state
  const email = location.state?.email || '';
  const userName = location.state?.name || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    mode: 'onBlur',
  });

  const verificationCode = watch('verificationCode');

  // Redirect if no email available
  useEffect(() => {
    if (!email) {
      toast.error('No email found for verification. Please register again.');
      navigate('/register');
    }
  }, [email, navigate]);

  // Handle resend cooldown timer
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const onSubmit = async (data) => {
    if (!email) return;

    try {
      const result = await verifyEmail({
        email: email,
        verificationCode: data.verificationCode.trim()
      }).unwrap();

      if (result.success) {
        toast.success('Email verified successfully! Welcome to Amazon Clone!', {
          position: 'top-right',
          autoClose: 4000,
        });

        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Email verified successfully! Please sign in.',
            email: email 
          } 
        });
      }
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Verification failed. Please try again.';
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      
      console.error('Verification error:', error);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;

    try {
      const result = await resendCode({ email }).unwrap();

      if (result.success) {
        toast.success('New verification code sent to your email!', {
          position: 'top-right',
          autoClose: 4000,
        });
        
        // Start 60-second cooldown
        setResendCooldown(60);
        
        // Clear the form
        reset();
      }
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to resend verification code.';
      
      // Handle rate limiting
      if (error?.status === 429) {
        const waitMatch = errorMessage.match(/(\d+)/);
        const waitTime = waitMatch ? parseInt(waitMatch[1]) : 60;
        setResendCooldown(waitTime);
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      
      console.error('Resend error:', error);
    }
  };

  if (!email) {
    return (
      <div className='w-full h-[70vh] flex justify-center items-center'>
        <div className="text-center">
          <p className="text-gray-600 mb-4">No email found for verification.</p>
          <Link to="/register" className="text-blue-600 hover:underline">
            Go back to registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-[70vh] flex justify-center items-center flex-col py-8'>
      <Link to='/' className="mb-6">
        <img
          src="images/amazon_logo_icon_169612.webp"
          alt="amazon logo"
          className='w-[140px] object-contain'
        />
      </Link>
      
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="w-[380px] border border-gray-300 rounded-md p-6 shadow-sm"
      >
        <h2 className='text-2xl font-semibold mb-4'>Verify email address</h2>
        
        <div className='mb-4'>
          <p className='text-sm text-gray-700 mb-2'>
            Hi {userName}, to verify your email, we've sent a One Time Password (OTP) to:
          </p>
          <p className='text-base font-mono font-semibold text-blue-600 bg-blue-50 p-2 rounded border'>
            {email}
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="verificationCode" className='block text-sm font-medium text-gray-700 mb-2'>
            Enter security code
          </label>
          <input
            id="verificationCode"
            type="text"
            maxLength="6"
            {...register('verificationCode', {
              required: 'Verification code is required',
              pattern: {
                value: /^\d{6}$/,
                message: 'Please enter a valid 6-digit code'
              },
              validate: {
                notEmpty: value => value.trim() !== '' || 'Verification code cannot be empty'
              }
            })}
            className={`w-full px-3 py-2 rounded border ${
              errors.verificationCode 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 transition-colors duration-200 text-center text-lg font-mono tracking-wider`}
            placeholder="000000"
            aria-describedby={errors.verificationCode ? "code-error" : undefined}
          />
          {errors.verificationCode && (
            <p id="code-error" className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.verificationCode.message}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isVerifying || !verificationCode || verificationCode.length !== 6}
          className='w-full rounded-full bg-amazonClone-amazon_yellow hover:bg-amazonClone-amazon_yellow_hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-2 px-4 mb-4 transition-all duration-200 flex items-center justify-center'
        >
          {isVerifying ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : (
            'Create Your Amazon Account'
          )}
        </button>
        
        <p className='text-xs text-gray-600 mb-4 leading-relaxed'>
          By creating an account, you agree to Amazon's{' '}
          <a href="/conditions" className='text-blue-600 hover:underline transition-colors duration-200'>
            Conditions of Use
          </a>{' '}
          and{' '}
          <a href="/privacy" className='text-blue-600 hover:underline transition-colors duration-200'>
            Privacy Notice.
          </a>
        </p>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className='text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline text-sm font-medium transition-colors duration-200 flex items-center'
            >
              {isResending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend Code (${resendCooldown}s)`
              ) : (
                'Resend Code'
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Back to registration link */}
      <div className="mt-6 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Need to use a different email?</span>
          </div>
        </div>
        
        <Link
          to="/register"
          className='inline-block w-[380px] rounded border border-gray-300 py-2 px-6 text-center text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200'
        >
          Back to Registration
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
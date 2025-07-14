import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

import { useVerifyCodeMutation, useResendCodeMutation } from '../../app/api';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location?.state?.email || '';
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [verifyCode, { isLoading }] = useVerifyCodeMutation();
  const [resendCode, { isLoading: isResending }] = useResendCodeMutation();

  const onSubmit = async (data) => {
    try {
      // Include email with verification code
      const payload = {
        code:data.code,
        email: email
      };
      
      const result = await verifyCode(payload).unwrap();
      toast.success(result.message || 'Code verified successfully!');
      reset(); // Clear form
      
       // Navigate to reset password page with token in URL (Amazon style)
       const resetToken = result.resetToken || result.token;
       navigate(`/reset-password/${resetToken}`, { 
         state: { 
           email: email,
           verified: true
         } 
       });
     
    } catch (error) {
      const errorMessage = error?.data?.message || 'Invalid code. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleResendCode = async () => {
    try {
      const result = await resendCode({ email }).unwrap();
      toast.success(result.message || 'Code resent successfully!');
    } catch (error) {
      const errorMessage = error?.data?.message || 'Failed to resend code. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Redirect if no email provided
  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  return (
    <div className='h-[70vh] w-full flex justify-center items-center flex-col'>
      <Link to='/'>
        <img 
          src="images/amazon_logo_icon_169612.webp" 
          alt="amazon logo" 
          className='w-[140px] object-contain' 
        />
      </Link>
      
      <div className="w-[350px] border border-gray-300 rounded-md p-5 py-4">
        <h2 className='text-3xl font-medium mb-2'>Enter verification code</h2>
        <p className='text-sm font-semibold mb-4'>
          We've sent a verification code to{' '}
          <span className="font-bold">{maskedEmail}</span>.<br />
          Please enter it below to continue.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="code" className='text-sm font-semibold'>
              Verification code
            </label>
            <input
              type="text"
              id="code"
              {...register('code', {
                required: 'Verification code is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Please enter a valid 6-digit code'
                },
                minLength: {
                  value: 6,
                  message: 'Code must be 6 digits'
                },
                maxLength: {
                  value: 6,
                  message: 'Code must be 6 digits'
                }
              })}
              className={`w-full h-[30px] p-2 rounded border ${
                errors.code ? 'border-red-500' : 'border-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              placeholder="Enter 6-digit code"
              maxLength="6"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.code && (
              <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`bg-amazonClone-amazon_yellow w-full h-[30px] rounded-full text-sm font-semibold ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button 
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className={`text-blue-600 hover:underline ${
                isResending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isResending ? 'Resending...' : 'Resend'}
            </button>
          </p>
          <Link to="/forgot-password" className="block text-blue-600 text-sm hover:underline">
            Back to Password Assistance
          </Link>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            For security reasons, this code will expire in 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
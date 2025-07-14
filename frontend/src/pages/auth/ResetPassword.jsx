import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

import { useResetPasswordWithTokenMutation, useValidateResetTokenMutation } from '../../app/api';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useParams();
    
    const [isValidToken, setIsValidToken] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [email, setEmail] = useState('');
    const [hasValidated, setHasValidated] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm();

    const [resetPassword, { isLoading }] = useResetPasswordWithTokenMutation();
    const [validateResetToken] = useValidateResetTokenMutation();

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token || hasValidated) {
                if (!token) {
                    toast.error('Invalid reset link');
                    navigate('/forgot-password');
                }
                return;
            }

            setHasValidated(true);

            try {
                const result = await validateResetToken({ token }).unwrap();
                
                // Check if the response indicates success
                if (result.success) {
                    setIsValidToken(true);
                    setEmail(result.email || location?.state?.email || '');
                    toast.success('Reset link verified successfully!'); // Success toast
                } else {
                    throw new Error(result.message || 'Token validation failed');
                }
            } catch (error) {
                console.error('Token validation error:', error);
                const errorMessage = error?.data?.message || error?.message || 'Invalid or expired reset link';
                toast.error(errorMessage);
                navigate('/forgot-password');
            } finally {
                setIsCheckingToken(false);
            }
        };

        validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Only depend on token, which shouldn't change

    const onSubmit = async (data) => {
      try {
          const payload = {
              token: token,
              newPassword: data.newPassword,
              email: email
          };
  
          // DEBUG: Log what we're sending
          console.log('=== RESET PASSWORD DEBUG ===');
          console.log('Token from URL:', token);
          console.log('Email:', email);
          console.log('Payload being sent:', payload);
          console.log('==============================');
  
          const result = await resetPassword(payload).unwrap();
          
          // DEBUG: Log the response
          console.log('Reset password response:', result);
          
          if (result.success) {
              toast.success(result.message || 'Password reset successful!');
              navigate('/login', {
                  state: {
                      message: 'Your password has been reset successfully. You can now sign in with your new password.'
                  }
              });
          } else {
              throw new Error(result.message || 'Password reset failed');
          }
      } catch (error) {
          console.error('=== RESET PASSWORD ERROR ===');
          console.error('Full error object:', error);
          console.error('Error data:', error?.data);
          console.error('Error message:', error?.message);
          console.error('==============================');
          
          const errorMessage = error?.data?.message || error?.message || 'Password reset failed. Please try again.';
          toast.error(errorMessage);
      }
  };
  

    // Show loading while validating token
    if (isCheckingToken) {
        return (
            <div className='h-[60vh] w-full flex justify-center items-center flex-col'>
                <Link to='/'>
                    <img 
                        src="/images/amazon_logo_icon_169612.webp" 
                        alt="amazon_logo" 
                        className='w-[140px] object-contain' 
                    />
                </Link>
                <div className="w-[350px] border border-gray-300 rounded-md p-5">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazonClone-amazon_yellow mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render if token is invalid (component will redirect)
    if (!isValidToken) {
        return null;
    }

    return (
        <div className='h-[80vh] w-full flex justify-center items-center flex-col'>
            <Link to='/'>
                <img 
                    src="/images/amazon_logo_icon_169612.webp" 
                    alt="amazon_logo" 
                    className='w-[140px] object-contain' 
                />
            </Link>
            
            <div className="w-[350px] border border-gray-300 rounded-md p-5">
                <h2 className='mb-2 text-3xl font-semibold'>Create New Password</h2>
                <p className='mb-4 text-sm font-semibold'>
                    We'll ask for this password whenever you sign in.
                </p>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className='block font-medium text-base mb-1'>
                            New Password
                        </label>
                        <input
                            type='password'
                            id="newPassword"
                            {...register('newPassword', { 
                                required: 'New password is required', 
                                minLength: { 
                                    value: 6, 
                                    message: 'Password must be at least 6 characters' 
                                }
                            })}
                            className={`w-full py-2 rounded border px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                errors.newPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter new password"
                        />
                        {errors.newPassword && (
                            <p className='text-red-500 text-sm mt-1'>{errors.newPassword.message}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className='block font-medium text-base mb-1'>
                            Re-enter Password
                        </label>
                        <input
                            type='password'
                            id="confirmPassword"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => 
                                    value === watch('newPassword') || 'Passwords do not match'
                            })}
                            className={`w-full py-2 rounded border px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && (
                            <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    
                    <button 
                        type='submit' 
                        disabled={isLoading}
                        className={`w-full mb-3 bg-amazonClone-amazon_yellow py-2 rounded-full text-sm font-semibold transition-colors ${
                            isLoading 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-amazonClone-amazon_yellow_hover'
                        }`}
                    >
                        {isLoading ? 'Saving...' : 'Save changes and Sign-In'}
                    </button>
                </form>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Your new password will be used for all future sign-ins.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
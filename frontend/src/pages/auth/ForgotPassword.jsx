import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

import { useForgotPasswordMutation } from '../../app/api'; // Adjust import path

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const result = await forgotPassword(data).unwrap();
      toast.success(result.message || 'Reset code sent successfully!');
      reset(); // Clear form

      navigate('/verify-code', {
        state:{
          email: data.email,
          fromForgotPassword: true,
        }
      })
    } catch (error) {
      const errorMessage = error?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className='h-[60vh] w-full flex justify-center items-center flex-col'>
      <Link to='/'>
        <img 
          src="images/amazon_logo_icon_169612.webp" 
          alt="amazon logo" 
          className='w-[140px] object-contain' 
        />
      </Link>
      
      <div className="w-[350px] border border-gray-300 rounded-md p-5 py-4">
        <h2 className='text-3xl font-medium mb-2'>Password assistance</h2>
        <p className='text-sm font-semibold mb-2'>
          Enter the email address or mobile phone <br /> 
          number associated with your Amazon account.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="email" className='text-sm font-semibold'>
              Email or mobile phone number
            </label>
            <input
              type="text"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                }
              })}
              className={`w-full h-[30px] p-2 rounded border ${
                errors.email ? 'border-red-500' : 'border-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`bg-amazonClone-amazon_yellow w-full h-[30px] rounded-full text-sm font-semibold ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
            }`}
          >
            {isLoading ? 'Sending...' : 'Continue'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 text-sm hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
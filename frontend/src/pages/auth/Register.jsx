import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

import { useRegisterMutation } from '../../app/api'; // Adjust path according to your project

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  
  const {
    register: registerForm,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    mode: 'onBlur',
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      
      const res = await register(registerData).unwrap();
      
      if (res.success) {
        toast.success('Account created successfully! Please check your email for verification code.', {
          position: 'top-right',
          autoClose: 4000,
        });
        
        // Navigate to verification page with email
        navigate('/verify-email', { 
          state: { 
            email: registerData.email,
            name: registerData.name 
          } 
        });
        
        reset();
      }
      
    } catch (err) {
      const errorMessage = err?.data?.message || err?.message || 'Registration failed. Please try again.';
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      
      console.error('Registration failed:', errorMessage);
    }
  };

  return (
    <div className='min-h-[90vh] w-full flex justify-center items-center flex-col py-8'>
      <Link to="/" className="mb-6">
        <img
          src="images/amazon_logo_icon_169612.webp"
          alt="amazon logo"
          className='w-[140px] object-contain'
        />
      </Link>
      
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-[380px] border border-gray-300 p-6 rounded-md shadow-sm'
      >
        <h1 className='text-3xl font-medium mb-4'>Create account</h1>
        
        {/* Full Name Field */}
        <div className='mb-4'>
          <label htmlFor="name" className='mb-2 block text-sm font-medium text-gray-700'>
            Your name
          </label>
          <input
            id="name"
            type='text'
            {...registerForm('name', {
              required: 'name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters long'
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Name can only contain letters and spaces'
              },
              validate: {
                notEmpty: value => value.trim() !== '' || 'Name cannot be empty'
              }
            })}
            className={`w-full px-3 py-2 rounded border ${
              errors.name 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 transition-colors duration-200`}
            aria-describedby={errors.name ? "fullName-error" : undefined}
            placeholder="First and last name"
          />
          {errors.name && (
            <p id="fullName-error" className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className='mb-4'>
          <label htmlFor="email" className='mb-2 block text-sm font-medium text-gray-700'>
            Email
          </label>
          <input
            id="email"
            type='email'
            {...registerForm('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              },
              validate: {
                notEmpty: value => value.trim() !== '' || 'Email cannot be empty'
              }
            })}
            className={`w-full px-3 py-2 rounded border ${
              errors.email 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 transition-colors duration-200`}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor='password' className='mb-2 block text-sm font-medium text-gray-700'>
            Password
          </label>
          <input
            id="password"
            type='password'
            {...registerForm('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
              },
              validate: {
                notEmpty: value => value.trim() !== '' || 'Password cannot be empty'
              }
            })}
            className={`w-full px-3 py-2 rounded border ${
              errors.password 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 transition-colors duration-200`}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="At least 6 characters"
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Passwords must be at least 6 characters.
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label htmlFor='confirmPassword' className='mb-2 block text-sm font-medium text-gray-700'>
            Re-enter password
          </label>
          <input
            id="confirmPassword"
            type='password'
            {...registerForm('confirmPassword', {
              required: 'Please confirm your password',
              validate: {
                matchPassword: value => value === password || 'Passwords do not match'
              }
            })}
            className={`w-full px-3 py-2 rounded border ${
              errors.confirmPassword 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 transition-colors duration-200`}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className='w-full rounded-full bg-amazonClone-amazon_yellow hover:bg-amazonClone-amazon_yellow_hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-2 px-4 transition-all duration-200 flex items-center justify-center'
          >
            {(isLoading || isSubmitting) ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                verify Email...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </div>
        
        <div className="mb-4">
          <p className='text-xs text-gray-600 mb-3 leading-relaxed'>
            By creating an account, you agree to Amazon's{' '}
            <a href="/conditions" className='text-blue-600 hover:underline transition-colors duration-200'>
              Conditions of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" className='text-blue-600 hover:underline transition-colors duration-200'>
              Privacy Notice.
            </a>
          </p>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>
        
        <Link
          to="/login"
          className='inline-block w-[380px] rounded border border-gray-300 py-2 px-6 text-center text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200'
        >
          Sign in to your account
        </Link>
      </div>
    </div>
  );
};

export default Register;
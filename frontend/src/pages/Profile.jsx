import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetCurrentUserQuery, useUpdatedProfileMutation } from '../app/api';
import toast from 'react-hot-toast';




const Profile = () => {
  const { data: user, isSuccess, isError, isLoading, refetch } = useGetCurrentUserQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    retry: true
  });

  const [updateProfile, { 
    isLoading: isUpdating, 
    error: updateError, 
    isSuccess: updateSuccess 
  }] = useUpdatedProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Watch password for confirmation validation
  const password = watch('password');

  // Set form values when user data is loaded
  useEffect(() => {
    if (user && isSuccess) {
      setValue('name', user.name);
      setValue('email', user.email);
    }
  }, [user, isSuccess, setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Create update payload (only include fields that have values)
      const updatePayload = {
        name: data.name,
        email: data.email,
      };

      // Only include password if it's provided
      if (data.password) {
        updatePayload.password = data.password;
      }

      const result = await updateProfile(updatePayload).unwrap();
      
      // Clear password fields after successful update
      setValue('password', '');
      setValue('confirmPassword', '');
      
      // Refetch user data to get updated info
      refetch();
      
      toast.success(result.message || 'Profile updated successfully!');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message|| 'Failed to update profile. Please try again.');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[50vh] w-full flex justify-center items-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-[50vh] w-full flex justify-center items-center">
        <div>Error loading profile. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] w-full flex justify-center items-center flex-col">
      <div className="w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-[3rem] font-medium">User Profile</h1>
          
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 text-sm font-medium text-gray-700 block">
              Name
            </label>
            <input
            value={user.name}
              type="text"
              id="name"
              readOnly
              className="w-full px-3 py-[5px] border border-gray-300 focus:outline-0 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-700 block">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              readOnly
              className="w-full px-3 py-[5px] border border-gray-300 focus:outline-0 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700 block">
              Password 
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full px-3 py-[5px] border border-gray-300 focus:outline-0 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="mb-2 text-sm font-medium text-gray-700 block">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                validate: (value) => {
                  if (password && !value) {
                    return 'Please confirm your password';
                  }
                  if (password && value !== password) {
                    return 'Passwords do not match';
                  }
                  return true;
                }
              })}
              className="w-full px-3 py-[5px] border border-gray-300 focus:outline-0 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mb-4">
            <button
              type="submit"
              disabled={isUpdating}
              className={`${
                isUpdating
                  ? 'bg-yellow-200 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500'
              } text-[15px] py-2 px-5 rounded-full font-medium transition-colors`}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>

          {/* Error Message */}
          {updateError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {updateError.data?.message || 'Failed to update profile'}
            </div>
          )}

          
        </form>
      </div>
    </div>
  );
};

export default Profile;
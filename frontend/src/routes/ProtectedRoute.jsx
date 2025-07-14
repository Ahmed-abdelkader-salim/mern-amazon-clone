import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGetCurrentUserQuery } from '../app/api';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  // Amazon-style full-page loading spinner
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <p className="mt-4 text-gray-700 text-lg font-medium">Loading your secure checkout...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we verify your account</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (isError || !user) {
    // Special handling for payment and place-order pages
    if (location.pathname === '/payment' || location.pathname === '/place-order') {
      return (
        <Navigate 
          to="/login" 
          state={{ 
            from: '/shipping', // Always redirect back to shipping
            message: location.pathname === '/payment' 
              ? 'Please sign in to complete your payment'
              : 'Please sign in to complete your order'
          }} 
          replace 
        />
      );
    }

    // Default behavior for other protected routes
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Please sign in to continue'
        }} 
        replace 
      />
    );
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
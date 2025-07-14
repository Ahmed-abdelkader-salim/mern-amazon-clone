import React from 'react';
import { Link } from 'react-router-dom';
import MenuItem from './MenuItem';
import { useLogoutMutation } from '../app/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AccountMenu = ({ user, isAuthenticated }) => {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('logout successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to home even if logout fails
      navigate('/');
    }
  };



  return (
    <div className="w-[370px] p-2 bg-white border border-gray-300 shadow-lg rounded-sm absolute right-[50px] mt-[2px] z-50 text-sm">
      {/* Sign In Section - Show when user is NOT authenticated */}
      {!isAuthenticated ? (
        <div className="flex flex-col items-center p-4 border-b border-gray-200">
          <Link
            to="/login"
            className="bg-yellow-400 text-black hover:bg-yellow-500 hover:underline font-bold text-xs w-[200px] py-2 rounded text-center transition-colors duration-200"
          >
            Sign in
          </Link>
          <div className="text-xs text-gray-700 mt-2">
            New customer?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-orange-500 hover:underline transition-colors duration-200"
            >
              Start here.
            </Link>
          </div>
        </div>
      ) : (
        /* Authenticated User Section */
        <div>
   

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 divide-x p-2 divide-gray-200">
            {/* Your Lists Section */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Your Lists</h3>
              <ul className="space-y-1">
                <MenuItem to="#" text="Create a List" />
                <MenuItem to="#" text="Find a List or Registry" />
              </ul>
            </div>

            {/* Your Account Section */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Your Account</h3>
              <ul className="space-y-1">
                <MenuItem to="/profile" text="Account" />
                <MenuItem to="/order-history" text="Orders" />
                <MenuItem to="#" text="Recommendations" />
                <MenuItem to="#" text="Browsing History" />
                <MenuItem to="#" text="Watchlist" />
                <MenuItem to="#" text="Video Purchases & Rentals" />
                <MenuItem to="#" text="Kindle Unlimited" />
                <MenuItem to="#" text="Content & Devices" />
                <MenuItem to="#" text="Subscribe & Save Items" />
                <MenuItem to="#" text="Memberships & Subscriptions" />
                <MenuItem to="#" text="Music Library" />
              </ul>
            </div>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full text-left text-sm text-red-600 hover:text-red-800 hover:bg-gray-100 p-2 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
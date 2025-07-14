import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon, MapPinIcon, ChevronDownIcon, Bars3Icon} from "@heroicons/react/24/outline";
import {Link} from 'react-router-dom';
import AccountMenu from './AccountMenu';
import LanguageMenu from './LanguageMenu';
import { useGetCartCountQuery, useGetCurrentUserQuery } from '../app/api';
import SearchBox from './Search';

const Header = () => {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Get current user data using RTK Query with automatic refetching
  const { 
    data: user, 
    isSuccess, 
    isError, 
    isLoading,
    refetch 
  } = useGetCurrentUserQuery(undefined, {
    // Refetch on window focus to ensure user state is always current
    refetchOnFocus: true,
    // Refetch when coming back online
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    // Keep trying to fetch user data
    retry: true,
  });
  
  const isAuthenticated = isSuccess && user?.isAuthenticated ;
  
  // Helper function to get display name
  const getDisplayName = () => {
    if (!user) return null;
    
    // Try to get first name from full name, or use email prefix
    if (user.name) {
      const firstName = user.name.split(' ')[0];
      return firstName.length > 10 ? firstName.substring(0, 10) + '...' : firstName;
    }
    
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.length > 10 ? emailPrefix.substring(0, 10) + '...' : emailPrefix;
    }
    
    return 'User';
  };

  const { data: itemCountData, refetch:refetchCartCount } = useGetCartCountQuery();
  console.log("Cart count data:", itemCountData);
  // Optional: Force refetch on component mount to ensure fresh data
  useEffect(() => {
    refetch();
    refetchCartCount();
  }, [refetch, refetchCartCount]);

  return (
    <header className="min-w-[1000px]">
      {/* Top Navigation Bar */}
      <div className="flex text-white bg-amazonClone h-[60px]">
        {/* Left Section - Logo & Delivery */}
        <div className='flex items-center m-4'>
          {/* Amazon Logo */}
         <Link to="/">
            <img 
              className='h-[35px] w-[100px] object-contain mr-4' 
              src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/main/public/images/amazon.png" 
              alt="Amazon Logo" 
            />
         </Link>
            {/* Delivery Info */}
            <div className="pl-4 pr-4 relative">
            <MapPinIcon className='h-5 text-2xl text-white font-bold w-6 absolute top-4 -left-2'/>

              <div className=''>
                <div className='text-xs xl:text-sm text-gray-300'>Deliver to</div>
                <div className='text-sm font-bold xl:text-base flex items-center'>
                  Egypt
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                </div>
              </div>
            </div>
        </div>

        {/* Middle Section - Search Bar */}
        <div className="flex grow relative items-center">
          <SearchBox/>
        </div>

        {/* Right Section - Language, Account & Cart */}
        <div className="flex items-center m-4">
          {/* Language Selector */}
          <div 
            className="relative pl-4 pr-4"
            onMouseEnter={() => setShowLanguageDropdown(true)}
            onMouseLeave={() => setShowLanguageDropdown(false)}
          >
            <div className="flex items-center">
              <svg 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 640 480"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#ce1126" d="M0 0h640v480H0z"/>
              <path fill="#fff" d="M0 160h640v160H0z"/>
              <path fill="#000" d="M0 0h640v80H0zm0 400h640v80H0z"/>
              <path fill="#fff" d="M320 240a40 40 0 1 0-80 0 48 48 0 1 1 80 0z"/>
            </svg>
              <span className="text-sm font-bold">EN</span>
              <ChevronDownIcon className="h-3 w-3 ml-1" />
            </div>
            
            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <LanguageMenu/>
            )}
          </div>
          
          {/* Account */}
          <div className='pr-4 pl-4 cursor-pointer hover:border border-white rounded-sm'
            onMouseEnter={() => setShowAccountDropdown(true)}
            onMouseLeave={() => setShowAccountDropdown(false)}
          >
            <div className='text-xs'>
              {isLoading ? (
                'Loading...'
              ) : isAuthenticated ? (
                `Hello, ${getDisplayName()}`
              ) : (
                'Hello, sign in'
              )}
            </div>
            <div className='text-sm font-bold flex items-center'>
              Account & Lists
              <ChevronDownIcon className="h-3 w-3 ml-1" />
            </div>

            {/* Account Dropdown */}
            {showAccountDropdown && (
              <AccountMenu user={user} isAuthenticated={isAuthenticated} />
            )}
          </div>
          
          {/* Returns & Orders */}
          <Link to={isAuthenticated ? "/order-history" : "/login"} className='pr-4 pl-4 cursor-pointer hover:border border-white rounded-sm'>
            <div className='text-xs'>Returns</div>
            <div className='text-sm font-bold'>& Orders</div>
          </Link>
          
          {/* Cart */}
          <Link to="/cart" className="flex items-center cursor-pointer relative pr-3 pl-3 hover:border border-white rounded-sm">
            <div className="relative">
              <ShoppingCartIcon className='h-10 w-10' />
              {itemCountData?.itemCount > 0 ? (
                <span className="absolute top-0 right-3 text-xl font-bold text-orange-400">
                  {itemCountData.itemCount > 99 ? '99+' : itemCountData.itemCount}
                </span>
              ):(
                <span className="absolute top-0 right-3 text-xl font-bold text-orange-400">
                  0
                </span>
              )}
            </div>
            <div className='mt-6 text-xs font-bold hidden md:block'>
              Cart
            </div>
          </Link>
        </div>
      </div>
      
      {/* Secondary Navigation (Categories) */}
      <div className="flex items-center bg-amazonClone-light_blue text-white space-x-3 text-xs xl:text-sm p-2 pl-3">
        <button 
            className='flex items-center font-bold hover:border border-white rounded-sm px-2 py-1'
          >
            <Bars3Icon className='h-[25px] text-2xl font-bold'/>
            All
          </button>
          <Link to="/" className="hover:border border-white rounded-sm px-2 py-1">Today's Deals</Link>
          <Link to="/" className="hover:border border-white rounded-sm px-2 py-1">Customer Service</Link>
          <Link to="/" className="hover:border border-white rounded-sm px-2 py-1">Registry</Link>
          <Link to="/" className="hover:border border-white rounded-sm px-2 py-1">Gift Cards</Link>
          <Link to="/" className="hover:border border-white rounded-sm px-2 py-1">Sell</Link>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';

const Footer = () => {
  return (
    <div className="bg-amazonClone-amazon_footer text-white ">
      {/* Main footer content - centered */}
        <div className='flex'>
            <div className="grid grid-cols-3 xl:grid-cols-4 mx-auto py-8 gap-10">
            {/* Column 1 - Get to Know Us */}
            <div className=''>
                <h3 className="font-bold mb-4 text-base">Get to Know Us</h3>
                <ul className="space-y-3 text-sm">
                <li>Careers</li>
                <li>Blog</li>
                <li>About Amazon</li>
                <li>Investor Relations</li>
                <li>Amazon Devices</li>
                <li>Amazon Science</li>
                </ul>
            </div>

            {/* Column 2 - Make Money with Us */}
            <div className=''>
                <h3 className="font-bold mb-4 text-base">Make Money with Us</h3>
                <ul className="space-y-3 text-sm">
                <li>Sell products on Amazon</li>
                <li>Sell on Amazon Business</li>
                <li>Sell apps on Amazon</li>
                <li>Become an Affiliate</li>
                <li>Advertise Your Products</li>
                <li>Self-Publish with Us</li>
                <li>Host an Amazon Hub</li>
                <li className="text-blue-300">› See More Make Money with Us</li>
                </ul>
            </div>

            {/* Column 3 - Amazon Payment Products */}
            <div className=''>
                <h3 className="font-bold mb-4 text-base">Amazon Payment Products</h3>
                <ul className="space-y-3 text-sm">
                <li>Amazon Business Card</li>
                <li>Shop with Points</li>
                <li>Reload Your Balance</li>
                <li>Amazon Currency Converter</li>
                </ul>
            </div>

            {/* Column 4 - Let Us Help You */}
            <div className=''>
                <h3 className="font-bold mb-4 text-base">Let Us Help You</h3>
                <ul className="space-y-3 text-sm">
                <li>Amazon and COVID-19</li>
                <li>Your Account</li>
                <li>Your Orders</li>
                <li>Shipping Rates & Policies</li>
                <li>Returns & Replacements</li>
                <li>Manage Your Content and Devices</li>
                <li>Help</li>
                </ul>
            </div>
            </div>

        </div>

        {/* Footer divider */}
        <div className="border-t border-gray-600 my-6 p-0"></div>

        {/* Logo and language selector - centered */}
        <div className="flex flex-col items-center justify-center pt-5">
          <div className="flex items-center mb-4">
            <img 
              src="https://raw.githubusercontent.com/JonnyDavies/amazon-clone-frontend/main/public/images/amazon.png" 
              alt="Amazon Logo" 
              className="h-[26px] w-[100px] object-contain mr-[25px]"
            />
            <div className="flex space-x-2 text-xs ml-8">
              <span className="border text-gray-300 border-gray-400 px-5 py-[6px] rounded-sm">English</span>
              <span className="border text-gray-300 border-gray-400 px-5 py-[6px] rounded-sm">USD - U.S. Dollar</span>
              <span className="border text-gray-300 border-gray-400 px-5 py-[6px] rounded-sm">United States</span>
            </div>
          </div>
        </div>

        {/* Copyright - centered */}
        <div className="text-xs text-center py-7">
          <div className="space-x-2 mb-2">
            <span>Conditions of Use</span>
            <span>|</span>
            <span>Privacy Notice</span>
            <span>|</span>
            <span>Interest-Based Ads</span>
          </div>
          <div>© 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates</div>
        </div>
      </div>
  );
};

export default Footer;
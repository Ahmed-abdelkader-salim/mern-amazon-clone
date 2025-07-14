import React from 'react'

const LanguageMenu = () => {
  return (
    <div className="absolute top-full right-0 mt-1 w-48 bg-white text-black rounded shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-bold">Change language</p>
                </div>
                <ul>
                  <li className="px-4 py-2 hover:bg-blue-50">
                    <span className="text-sm">English - EN</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-blue-50">
                    <span className="text-sm">Español - ES</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-blue-50">
                    <span className="text-sm">Français - FR</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-blue-50">
                    <span className="text-sm">Deutsch - DE</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-blue-50">
                    <span className="text-sm">Italiano - IT</span>
                  </li>
                </ul>
              </div>
  )
}

export default LanguageMenu
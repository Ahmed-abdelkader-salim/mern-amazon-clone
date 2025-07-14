import React from 'react'
import smcardData from '../smcardData';

const CardGrid = () => {
  return (
    <div className='grid grid-cols-3 xl:grid-cols-4 pb-3'>
      {smcardData.map((section) => (
      <div key={section.id} className="h-[400px] bg-white m-3 p-4 shadow-sm">

        {/* Title */}

        <h2 className="text-lg xl:text-xl font-semibold mb-4">
        {section.title}
        </h2>

        {/* Grid of 4 images */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Item 1 */}
          {section.items.map((item) => (
            <div key={item.id}>
              <img
                loading="lazy"
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-[100px] object-cover"
              />
              <p className="text-xs xl:text-sm mt-2 text-gray-700">
                {item.title}
              </p>
            </div>

          ))}
         
        </div>

        {/* See More Link */}
        <div className="mt-4">
          <a href={section.seeMoreLink} className="text-xs xl:text-sm text-blue-500 hover:underline">
            See more
          </a>
        </div>
      </div>
      ))}

    </div>
  )
}

export default CardGrid;

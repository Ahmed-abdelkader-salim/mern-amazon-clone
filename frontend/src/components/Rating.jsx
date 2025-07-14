import React from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline'

const Rating = ({ rating = 0, reviewCount }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center">
      <div className="flex items-center" aria-label={`Rating: ${rating} out of 5 stars`}>
        {/* Full stars */}
        {Array(fullStars).fill().map((_, i) => (
          <StarIcon
            key={`full-${i}`}
            className="w-5 h-5 text-yellow-400"
            aria-hidden="true"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <OutlineStarIcon className="w-5 h-5 text-yellow-400" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <StarIcon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array(emptyStars).fill().map((_, i) => (
          <OutlineStarIcon
            key={`empty-${i}`}
            className="w-5 h-5 text-gray-300"
            aria-hidden="true"
          />
        ))}
      </div>

      {reviewCount && (
        <span className="ml-2 text-sm text-blue-600 hover:underline cursor-pointer">
          {reviewCount.toLocaleString()} reviews
        </span>
      )}
    </div>
  )
}

export default Rating
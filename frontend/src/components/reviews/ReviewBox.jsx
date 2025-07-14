import React from 'react'
import Rating from '../Rating'

const ReviewBox = ({review}) => {
  return (
    <div className='bg-white p-6 rounded-lg'>
        <div className="mb-2">
            <h5 className='text-lg font-bold '>{review.name}</h5>
            <Rating rating={review.rating} /> 
            {review.createdAt.substring(0,10)}
        </div>
            <p className='text-gray-600'>{review.comment}</p>
    </div>
  )
}

export default ReviewBox
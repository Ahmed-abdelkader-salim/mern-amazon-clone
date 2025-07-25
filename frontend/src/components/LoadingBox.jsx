import React from 'react'

const LoadingBox = () => {
  return (
    <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent  align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'>
        <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !whitespace-nowrap !p-0 ![clip:rect(0,0,0,0)]'>Loading...</span>
    </div>
  )
}

export default LoadingBox
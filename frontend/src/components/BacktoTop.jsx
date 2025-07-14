import React from 'react'

const BacktoTop = () => {
    const scrolltoTop = () => {
        window.scrollTo({
            top:0,
            behavior:'smooth'
        })
    }
  return (
    <div className=''>
        <button onClick={scrolltoTop} className='bg-amazonClone-amazon_blue text-white hover:bg-gray-600 w-full h-[50px]'>Back to Top</button>
    </div>
  )
}

export default BacktoTop
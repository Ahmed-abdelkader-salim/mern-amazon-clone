import React from 'react';
import { useGetCartCountQuery } from '../app/api';

const CartCounter = () => {
  const { data: itemCountData } = useGetCartCountQuery();
  console.log(itemCountData)
  return (
 
     <div>
     
     {itemCountData > 0 && (
       <span className="absolute top-0 right-3 text-xl font-bold text-orange-400">
        0
         {itemCountData > 99 ? '99+' : itemCountData.count}
       </span>
     )}
     </div>
  );
};


export default CartCounter;
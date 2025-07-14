import React from 'react';
import ProductCard from '../components/ProductCard';
import { useGetProductsQuery } from '../app/api';
import LoadingBox from '../components/LoadingBox';

const ProductListPage = () => {
  const { data, isLoading, error } = useGetProductsQuery();

  if (isLoading) return <LoadingBox />;
  
  if (error) {
    return (
      <div className="mt-[5px]">
        <div className="text-center py-10">
          <div className="text-red-500">Error loading products</div>
          <div className="text-sm text-gray-500 mt-2">
            {error.message || 'Something went wrong'}
          </div>
        </div>
      </div>
    );
  }

  // Filter out any null/undefined products and validate required fields
  const validProducts = data?.filter(product => 
    product && 
    product._id && 
    product.name && 
    product.slug
  ) || [];

  return (
    <div className='mt-[5px]'>
      <div className="text-2xl font-semibold pl-3">Featured Products</div>
      <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 m-3">
        {validProducts.length === 0 ? (
          <div className="col-span-full text-center py-10">
            No products found
          </div>
        ) : (
          validProducts.map((product) => (
            <ProductCard key={product.slug || product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
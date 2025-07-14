import ReviewBox from './ReviewBox';
import { Link, useParams } from 'react-router-dom';
import AddReview from './AddReview';
import { useGetCurrentUserQuery } from '../../app/api';
import { useEffect, useState } from 'react';

const Reviews = ({ product: initialProduct }) => {
  const [product, setProduct] = useState(initialProduct);
  const params = useParams();
  const { slug } = params;

  // Update local product state when prop changes
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

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
    // Keep trying to fetch user data
    retry: true,
    // Skip cache to get fresh data
    refetchOnMountOrArgChange: true,
  });

  // Force refetch when component mounts (useful after login redirect)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const isAuthenticated = isSuccess && user?.isAuthenticated;

  // Handle review addition
  const handleReviewAdded = (updatedProduct) => {
    setProduct(updatedProduct);
  };

  return (
    <div className="mt-10" data-reviews-section>
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      {product.reviews.length === 0 && (
        <div className='p-5 mt-3 rounded-lg bg-cyan-200'>no reviews yet</div>
      )}
      
      {/* Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {product.reviews.map((review) => (
          <ReviewBox key={review._id} review={review}/>
        ))}
      </div>
      
      {/* add reviews */}
      {isAuthenticated ? (
        <AddReview 
          product={product} 
          onReviewAdded={handleReviewAdded}
        />
      ) : (
        <div className='p-5 mt-3 rounded-lg bg-cyan-200'>
          please {' '}
          <Link 
            to={`/login?redirect=/product/${product.slug}`}
            className='text-blue-500 underline'
          >
            sign in
          </Link>
          {' '} to add a review
        </div>
      )}
    </div>
  );
};

export default Reviews;
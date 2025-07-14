import { useForm } from 'react-hook-form';
import toast  from 'react-hot-toast';
import { useAddProductReviewMutation } from '../../app/api';
import { useParams } from 'react-router-dom';

const AddReview = ({ product, onReviewAdded }) => {
  const { id } = useParams();
  
  // Use product._id if id from params is undefined
  const productId = id || product?._id;
  
  console.log('Initial productId calculation:', { id, productId: product?._id, final: productId });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      rating: '',
      comment: ''
    }
  });
  
  const [addProductReview, { isLoading }] = useAddProductReviewMutation();

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    console.log('Product ID from params:', id);
    console.log('Product from props:', product);
    
    try {
      const reviewData = {
        rating: Number(data.rating),
        comment: data.comment.trim()
      };

      console.log('Sending review data:', reviewData);
      console.log('Using product ID:', id);

      const result = await addProductReview({
        id: id || product._id, // Fallback to product._id if id is undefined
        reviewData
      }).unwrap();

      console.log('Review submission successful:', result);
      toast.success(result.message || "Review added successfully!");
      
      // Update the product state with new review data
      if (onReviewAdded && result.review) {
        const updatedProduct = {
          ...product,
          reviews: [result.review, ...product.reviews], // Add new review to beginning
          numReviews: result.numReviews,
          rating: result.rating
        };
        onReviewAdded(updatedProduct);
      }
      
      // Reset form after successful submission
      reset();
      
      // Scroll to reviews section if available
      const reviewsSection = document.querySelector('[data-reviews-section]');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
      
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error data:', error?.data);
      console.error('Error status:', error?.status);
      console.error('Error message:', error?.message);
      
      // Handle different error scenarios
      const errorMessage = error?.data?.message || error?.message || "Failed to add review";
      
      if (errorMessage.includes("already reviewed") || errorMessage.includes("already submitted")) {
        toast.error("You have already reviewed this product");
      } else if (errorMessage.includes("login") || errorMessage.includes("authenticate")) {
        toast.error("Please login to add a review");
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Review submission error:', error);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Write a customer review</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <select
            id="rating"
            {...register('rating', {
              required: 'Please select a rating',
              validate: value => value !== '' || 'Please select a rating'
            })}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
              errors.rating ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select...</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment
          </label>
          <textarea
            id="comment"
            rows="4"
            {...register('comment', {
              required: 'Please enter a comment',
              minLength: {
                value: 10,
                message: 'Comment must be at least 10 characters long'
              },
              validate: value => value.trim().length > 0 || 'Comment cannot be empty'
            })}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Share your experience..."
            disabled={isLoading}
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
          )}
        </div>

        <div className="mb-2">
          <button 
            className={`bg-yellow-400 hover:bg-yellow-500 text-black px-4 font-medium py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Adding Review...' : 'Add Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReview;
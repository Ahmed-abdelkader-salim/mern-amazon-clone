import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from "react-hot-toast";
import Rating from '../components/Rating';
import Reviews from '../components/reviews/Reviews';
import {
  useGetProductBySlugQuery,
  useAddToCartMutation,
  useGetCartCountQuery,
  useUpdateCartItemMutation,
  useGetCartQuery,
} from '../app/api';
import LoadingBox from '../components/LoadingBox';

const ProductDetailPage = () => {
  const params = useParams();
  const { slug } = params;
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [localProduct, setLocalProduct] = useState(null); // Moved this up before it's used

  const {
    data: product,
    refetch: refetchProduct,
    isLoading,
  } = useGetProductBySlugQuery(slug,  { skip: false });
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const { refetch: refetchCartCount } = useGetCartCountQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const { data: cartData } = useGetCartQuery();
  
  // Use localProduct for display, fallback to product
  const displayProduct = localProduct || product;
  const cart = cartData?.cart;
  const cartItems = cart?.items || [];

  // Fix: Add guard clause to check if product exists before accessing its properties
  const existingCartItem = displayProduct && cartItems.find(
    (item) =>
      (typeof item.productId === 'object'
        ? item.productId._id === displayProduct._id
        : item.productId === displayProduct._id) &&
      (item.selectedVariant || '') === (selectedVariant || '')
  );
  const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;

  // Reset selectedVariant when product changes
  useEffect(() => {
    if (displayProduct) {
      setSelectedVariant('');
    }
  }, [displayProduct]);

  // Update local product when API data changes
  useEffect(() => {
    if (product) {
      setLocalProduct(product);
    }
  }, [product]);

  const handleReviewAdded = async (newReview) => {
    try {
      // Immediately update the local state to reflect the new review
      setLocalProduct(prev => ({
        ...prev,
        numReviews: (prev.numReviews || 0) + 1,
        rating: newReview ? 
          ((prev.rating || 0) * (prev.numReviews || 0) + newReview.rating) / 
          ((prev.numReviews || 0) + 1) : 
          prev.rating
      }));
  
      // Then refetch the product data from the server
      const result = await refetchProduct();
      
      // If refetch worked, use the new data to ensure we're in sync with the server
      if (result.data) {
        setLocalProduct(result.data);
      }
      
      toast.success('Review added successfully!');
    } catch (error) {
      console.error('Error refetching product:', error);
      toast.error('Failed to update review count');
    }
  };

  const handleAddToCart = async () => {
    if (!displayProduct) {
      toast.error('Product information not available');
      return;
    }

    // Validate required fields
    if (!displayProduct._id) {
      toast.error('Invalid product ID');
      return;
    }

    if (quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    // Check if variants exist and are required but not selected
    const hasVariants =
      displayProduct.variants &&
      Array.isArray(displayProduct.variants) &&
      displayProduct.variants.length > 0;
    if (hasVariants && !selectedVariant) {
      toast.error('Please select an option before adding to cart');
      return;
    }

    // Check stock availability
    if (!displayProduct.countInStock || displayProduct.countInStock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const newQuantity = existingQuantity + Number(quantity);

    try {
      if (existingCartItem) {
        await updateCartItem({
          productId: displayProduct._id,
          quantity: newQuantity,
          selectedVariant: selectedVariant || '',
        }).unwrap();
        toast.success('Cart updated');
      } else {
        const cartItem = {
          productId: displayProduct._id,
          slug: displayProduct.slug || '',
          name: displayProduct.name || 'Unknown Product',
          image: displayProduct.image || '',
          price: Number(displayProduct.price) || 0,
          originalPrice:
            Number(displayProduct.originalPrice) || Number(displayProduct.price) || 0,
          brand: displayProduct.brand || '',
          category: displayProduct.category || '',
          quantity: Number(quantity),
          selectedVariant: selectedVariant || '', // Will be empty string if no variants
          isPrime: Boolean(displayProduct.isPrime),
          isFreeShipping: Boolean(displayProduct.isFreeShipping),
        };
        await addToCart(cartItem).unwrap();
        toast.success(`${displayProduct.name} added to cart successfully!`);
      }
      await refetchCartCount();
    } catch (error) {
      console.error('Add/update cart error:', error);
      // Handle different types of errors
      if (error?.data?.error) {
        switch (error.data.error) {
          case 'MISSING_PRODUCT_ID':
            toast.error('Invalid product information');
            break;
          case 'MISSING_USER_AUTH':
            toast.error('Please log in to add items to cart');
            break;
          case 'INVALID_QUANTITY':
            toast.error('Please select a valid quantity');
            break;
          case 'VALIDATION_ERROR':
            toast.error('Invalid product data');
            break;
          case 'INVALID_PRODUCT_ID':
            toast.error('Invalid product ID');
            break;
          default:
            toast.error(
              error.data.message || 'Failed to add/update item in cart'
            );
        }
      } else if (error?.status) {
        switch (error.status) {
          case 401:
            toast.error('Please log in to add items to cart');
            break;
          case 403:
            toast.error('Access denied');
            break;
          case 404:
            toast.error('Product not found');
            break;
          case 500:
            toast.error('Server error. Please try again later');
            break;
          default:
            toast.error('Failed to add/update item in cart');
        }
      } else {
        toast.error(
          'Network error. Please check your connection and try again'
        );
      }
    }
  };

  const handleBuyNow = async () => {
    try {
      await handleAddToCart();
      // Navigate to checkout only if add to cart was successful
      // navigate('/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
    }
  };

  if (isLoading) return <LoadingBox />;

  if (!displayProduct) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Safe check for variants
  const hasVariants =
    displayProduct.variants &&
    Array.isArray(displayProduct.variants) &&
    displayProduct.variants.length > 0;
  const hasImages =
    displayProduct.images &&
    Array.isArray(displayProduct.images) &&
    displayProduct.images.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-w-[1000px] max-w-[1500px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-10">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-sm">
            <div className="relative h-96 mb-4">
              <img
                src={displayProduct.image || '/placeholder-image.jpg'}
                alt={displayProduct.name || 'Product'}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            {hasImages && (
              <div className="grid grid-cols-3 gap-2">
                {displayProduct.images.map((img, index) => (
                  <div
                    key={index}
                    className="border p-1 rounded cursor-pointer hover:border-yellow-400"
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-20 object-contain"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle Column - Product Info */}
          <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-2">
              {displayProduct.name || 'Product Name'}
            </h1>

            <div className="mb-4">
              <Rating
                rating={displayProduct.rating || 0}
                reviewCount={displayProduct.numReviews || 0}
              />
            </div>

            {/* Variant Selection - Only show if variants exist */}
            {hasVariants && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Options:
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-400"
                  required
                >
                  <option value="">Select an option</option>
                  {displayProduct.variants.map((variant, index) => (
                    <option key={index} value={variant}>
                      {variant}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Product Description */}
            {displayProduct.description && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-gray-700 text-sm">{displayProduct.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Box */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm h-fit">
            <div className="mb-4">
              <div className="text-2xl font-bold text-red-700">
                ${(displayProduct.price || 0).toFixed(2)}
              </div>
              {displayProduct.originalPrice &&
                displayProduct.originalPrice > displayProduct.price && (
                  <div className="text-gray-500 text-sm mt-1">
                    RRP:{' '}
                    <span className="line-through">
                      ${displayProduct.originalPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 text-green-600">
                      (Save $
                      {(displayProduct.originalPrice - displayProduct.price).toFixed(2)})
                    </span>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-blue-500">FREE Returns</div>
              <div
                className={`font-medium ${
                  displayProduct.countInStock > 0 ? 'text-green-700' : 'text-red-600'
                }`}
              >
                {displayProduct.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
              {displayProduct.deliveryDate && (
                <div className="text-sm text-gray-600">
                  Delivery {displayProduct.deliveryDate}
                </div>
              )}
            </div>

            <div className="my-4">
              <label className="block text-sm font-medium mb-1">
                Quantity:
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-400"
                aria-label="Select quantity"
                disabled={displayProduct.countInStock === 0}
              >
                {[...Array(displayProduct.countInStock).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {displayProduct.countInStock} in stock
              </div>
              {quantity >= displayProduct.countInStock && (
                <div className="text-xs text-red-500 mt-1">
                  Maximum available stock selected
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  !displayProduct.countInStock ||
                  isAddingToCart ||
                  (hasVariants && !selectedVariant)
                }
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed py-2 rounded-lg font-medium transition-colors"
                aria-label="Add to cart"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={
                  !displayProduct.countInStock ||
                  isAddingToCart ||
                  (hasVariants && !selectedVariant)
                }
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
                aria-label="Buy now"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>Sold by {displayProduct.seller || 'Amazon'}</p>
              <p className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Secure Transaction
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <Reviews product={displayProduct} onReviewAdded={handleReviewAdded} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
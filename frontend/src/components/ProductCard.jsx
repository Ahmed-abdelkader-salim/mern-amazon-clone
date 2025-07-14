import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import toast from 'react-hot-toast';
import {
  useAddToCartMutation,
  useGetCartCountQuery,
  useGetCartQuery,
  useUpdateCartItemMutation,
} from '../app/api';

const ProductCard = ({ product }) => {
  // Move all hooks to the top
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity] = useState(1);
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const { refetch: refetchCartCount } = useGetCartCountQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const { data: cartData } = useGetCartQuery();

  // Reset selectedVariant when product changes
  useEffect(() => {
    if (product) {
      setSelectedVariant('');
    }
  }, [product]);

  // Early return after hooks
  if (!product || !product._id || !product.name) {
    return null;
  }

  const cart = cartData?.cart;
  const cartItems = cart?.items || [];
  const existingCartItem = cartItems.find(
    (item) => {
      // Use optional chaining to safely access nested properties
      const itemProductId = typeof item?.productId === 'object' 
        ? item.productId?._id 
        : item?.productId;
      
      return itemProductId === product?._id &&
             (item?.selectedVariant || '') === (selectedVariant || '');
    }
  );
  
  const existingQuantity = existingCartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Product information not available');
      return;
    }

    // Validate required fields
    if (!product._id) {
      toast.error('Invalid product ID');
      return;
    }

    // Check if variants exist and are required but not selected
    const hasVariants =
      product.variants &&
      Array.isArray(product.variants) &&
      product.variants.length > 0;
    if (hasVariants && !selectedVariant) {
      toast.error('Please select an option before adding to cart');
      return;
    }

    // Check stock availability
    if (!product.countInStock || product.countInStock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const newQuantity = existingQuantity + Number(quantity);

    try {
      if (existingCartItem) {
        await updateCartItem({
          productId: product._id,
          quantity: newQuantity,
          selectedVariant: selectedVariant || '',
        }).unwrap();
        toast.success('Cart updated');
      } else {
        const cartItem = {
          productId: product._id,
          slug: product.slug || '',
          name: product.name || 'Unknown Product',
          image: product.image || '',
          price: Number(product.price) || 0,
          originalPrice:
            Number(product.originalPrice) || Number(product.price) || 0,
          brand: product.brand || '',
          category: product.category || '',
          quantity: Number(quantity),
          selectedVariant: selectedVariant || '', // Will be empty string if no variants
          isPrime: Boolean(product.isPrime),
          isFreeShipping: Boolean(product.isFreeShipping),
        };
        await addToCart(cartItem).unwrap();
        toast.success(`${product.name} added to cart successfully!`);
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

  // Check if variants exist
  const hasVariants =
    product.variants &&
    Array.isArray(product.variants) &&
    product.variants.length > 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white flex flex-col h-full">
      {/* Image with Prime badge */}
      <div className="relative bg-white p-4">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-48 object-contain mx-auto"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </Link>
        {product.isPrime && (
          <div className="absolute top-2 left-2">
            <img
              src="https://m.media-amazon.com/images/G/01/prime/marketing/slashPrime/amazon-prime-delivery-checkmark._CB659998231_.png"
              alt="Prime"
              className="h-8 w-8"
            />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 pt-2 flex flex-col flex-grow">
        {/* Title */}
        <Link
          to={`/product/${product.slug}`}
          className="hover:text-amazon-orange"
        >
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 h-10">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-1 flex items-center">
          <Rating
            rating={product.rating || 0}
            numReviews={product.numReviews || 0}
          />
        </div>

        {/* Price */}
        <div className="mb-1">
          <div className="flex items-baseline">
            {product.originalPrice && (
              <span className="text-gray-500 line-through text-xs mr-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-red-700">
              ${(product.price || 0).toFixed(2)}
            </span>
          </div>
          {product.originalPrice && (
            <div className="text-xs text-gray-500">
              You save: ${(product.originalPrice - product.price).toFixed(2)} (
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100
              )}
              %)
            </div>
          )}
        </div>

        {/* Variants Selection */}
        {hasVariants && (
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Options:
            </label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            >
              <option value="">Select an option</option>
              {product.variants.map((variant, index) => (
                <option key={index} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stock Status */}
        {(product.countInStock || 0) > 0 ? (
          <div className="text-xs text-green-600 mb-2">
            In Stock ({product.countInStock} available)
          </div>
        ) : (
          <div className="text-xs text-red-600 mb-2">Out of Stock</div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={
            isAddingToCart ||
            !(product.countInStock > 0) ||
            (hasVariants && !selectedVariant)
          }
          className="mt-auto bg-amazonClone-amazon_yellow hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium py-1.5 rounded-md w-full transition-colors shadow-sm border border-gray-300"
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

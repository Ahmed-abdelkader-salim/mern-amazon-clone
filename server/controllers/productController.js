import Product from '../models/Product.js';
import mongoose from 'mongoose';

// ================================================= //
//         Public Controllers     //
// ================================================= //
// get all products
export const getProducts = async (req, res) => {
  const products = await Product.find();

  if (!products || products.length === 0) {
    return res.status(404).json({ message: 'No products found' });
  }

  res.status(200).json(products);
};

const PAGE_SIZE = 16; // Match frontend default

// Search products with filters, sorting, and pagination
export const searchProduct = async (req, res) => {
  try {
    console.log('Search request received:', req.query);
    
    const { query } = req;
    
    // Extract parameters to match frontend expectations
    const limit = parseInt(query.limit) || PAGE_SIZE;
    const page = parseInt(query.page) || 1;
    const category = query.category || '';
    const brand = query.brand || '';
    const minPrice = parseFloat(query.minPrice) || 0;
    const maxPrice = parseFloat(query.maxPrice) || 10000;
    const minRating = parseFloat(query.minRating) || 0;
    const sortBy = query.sortBy || 'relevance';
    const searchQuery = query.query || '';
    const isPrime = query.isPrime === 'true';
    const isFreeShipping = query.isFreeShipping === 'true';

    console.log('Parsed parameters:', {
      limit, page, category, brand, minPrice, maxPrice, 
      minRating, sortBy, searchQuery, isPrime, isFreeShipping
    });

    // Build query filters
    const queryFilter = 
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};

    // Category filter - handle multiple categories
    const categoryFilter = category && category !== 'all' && category !== ''
      ? { category: { $in: category.split(',') } }
      : {};

    // Brand filter - handle multiple brands
    const brandFilter = brand && brand !== 'all' && brand !== ''
      ? { brand: { $in: brand.split(',') } }
      : {};

    // Price filter
    const priceFilter = {
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    };

    // Rating filter
    const ratingFilter = minRating > 0
      ? {
          rating: {
            $gte: minRating,
          },
        }
      : {};

    // Prime filter
    const primeFilter = isPrime ? { isPrime: true } : {};

    // Free shipping filter
    const freeShippingFilter = isFreeShipping ? { freeShipping: true } : {};

    // Combined filter
    const combinedFilter = {
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter,
      ...priceFilter,
      ...ratingFilter,
      ...primeFilter,
      ...freeShippingFilter,
    };

    console.log('Combined filter:', combinedFilter);

    // Sort order mapping
    const sortOrder = getSortOrder(sortBy);
    console.log('Sort order:', sortOrder);

    // Check if Product model exists
    if (!Product) {
      throw new Error('Product model not found. Make sure to import it.');
    }

    // Execute query with error handling
    const products = await Product.find(combinedFilter)
      .sort(sortOrder)
      .skip(limit * (page - 1))
      .limit(limit)
      .lean(); // Use lean() for better performance

    console.log(`Found ${products.length} products`);

    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(), // Add id field for frontend compatibility
    }));
    console.log(transformedProducts)
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(combinedFilter);
    console.log(`Total products: ${totalProducts}`);

    const totalPages = Math.ceil(totalProducts / limit);

    // Return response in the format expected by frontend
    const response = {
      success: true,
      data: {
        products: transformedProducts, // Use transformed products
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    };

    console.log('Sending response:', {
      productsCount: transformedProducts.length,
      pagination: response.data.pagination
    });

    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    
    // More detailed error response
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Helper function to get sort order
const getSortOrder = (sortBy) => {
  switch (sortBy) {
    case 'price-low':
      return { price: 1 };
    case 'price-high':
      return { price: -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'featured':
      return { featured: -1 };
    case 'relevance':
    default:
      return { _id: -1 }; // Default sort
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const keyword = req.query.query || '';
    console.log('Suggestions request for:', keyword);

    if (!keyword.trim()) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions = await Product.find({
      name: { $regex: keyword, $options: 'i' },
    })
      .limit(10)
      .select('name _id')
      .sort({ name: 1 })
      .lean();

    console.log(`Found ${suggestions.length} suggestions`);

    // Transform suggestions to include id field
    const transformedSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      id: suggestion._id.toString(),
    }));

    res.json({ 
      success: true,
      suggestions: transformedSuggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message,
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    console.log('Categories request received');
    
    const categories = await Product.distinct('category');
    console.log('Found categories:', categories);
    
    res.json({
      success: true,
      categories: categories.filter(cat => cat) // Remove null/undefined values
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

// Get brands, optionally filtered by category
export const getBrands = async (req, res) => {
  try {
    const category = req.query.category;
    console.log('Brands request for category:', category);
    
    let filter = {};
    if (category && category !== 'all' && category !== '') {
      filter.category = { $in: category.split(',') };
    }
    
    const brands = await Product.distinct('brand', filter);
    console.log('Found brands:', brands);
    
    res.json({
      success: true,
      brands: brands.filter(brand => brand) // Remove null/undefined values
    });
  } catch (error) {
    console.error('Brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const formattedProduct = {
      id: product._id,
      title: product.name,
      slug: product.slug,
      image: product.image,
      images: product.images,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviews: product.numReviews,
      brand: product.brand,
      prime: product.isPrime || false,
      freeShipping: product.isFreeShipping || false,
      category: product.category,
      countInStock: product.countInStock,
      reviewsList: product.reviews,
    };

    res.json({
      success: true,
      data: formattedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// get product py slug
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// add review if user login
export const addReview = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    if (product.reviews.find((x) => x.name === req.user.name)) {
      return res
        .status(400)
        .send({ message: 'You already submitted a review' });
    }

    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      message: 'Review Created',
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      numReviews: product.numReviews,
      rating: product.rating,
    });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
};



// ================================================= //
//         Admin Controllers     //
// ================================================= //
// get All products with pagination

export const getAllProducts = async (req, res) => {
  try {
    // pagination parametrs
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sort = req.query.sort || '-createdAt';
    // get products with pagination
    const products = await Product.find().sort(sort).skip(skip).limit(limit);

    // Get total count for pagination metadata
    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: products.length,
      page,
      totalPages,
      totalProducts: total,
      data: products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'error fetching products' });
  }
};

// create products for admin only
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      image,
      images,
      price,
      originalPrice,
      brand,
      category,
      countInStock,
      isPrime,
      hasCoupon,
      isFreeShipping,
      numReviews,
      reviews,
    } = req.body;
    // create new product
    const savedProduct = await Product.create({
      name,
      slug,
      image,
      images,
      price,
      originalPrice,
      brand,
      category,
      countInStock,
      isPrime,
      hasCoupon,
      isFreeShipping,
      numReviews: numReviews || 0,
      reviews: reviews || [],
    });
    res
      .status(201)
      .json({ message: 'Product created successfully', product: savedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// update product for admin only
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Product Id' });
  }
  const {
    name,
    slug,
    image,
    images,
    price,
    originalPrice,
    brand,
    category,
    countInStock,
    isPrime,
    hasCoupon,
    isFreeShipping,
    numReviews,
    reviews,
  } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.name = name;
    product.slug = slug;
    product.image = image;
    product.images = images;
    product.price = price;
    product.originalPrice = originalPrice;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.isPrime = isPrime;
    product.hasCoupon = hasCoupon;
    product.isFreeShipping = isFreeShipping;
    product.numReviews = numReviews;
    product.reviews = reviews;
    const updatedProduct = await product.save();
    res
      .status(200)
      .json({
        message: 'product updated successfully',
        product: updatedProduct,
      });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// delete product for admin only
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Product ID' });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Product.deleteOne();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import {
  useSearchProductsQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} from '../app/api';
import PageTitle from '../components/PageTitle';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract search parameters from URL
  const searchQuery = useMemo(
    () => ({
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || 10000,
      minRating: Number(searchParams.get('minRating')) || 0,
      sortBy: searchParams.get('sortBy') || 'relevance',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 16,
      isPrime: searchParams.get('isPrime') || '',
      isFreeShipping: searchParams.get('isFreeShipping') || '',
    }),
    [searchParams]
  );

  // RTK Query hooks
  const { data:searchProduct, isLoading, error,  } =
    useSearchProductsQuery(searchQuery);
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery(searchQuery.category);

  const products = searchProduct?.data?.products || searchProduct?.products || [];
  const pagination = searchProduct?.data?.pagination || searchProduct?.pagination || {};
  const totalProducts = pagination.totalProducts || 0;
  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];
  console.log('API Response:', searchProduct);
  console.log('Error:', error);
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedRating, setSelectedRating] = useState(0);

  // Initialize filter states from URL
  useEffect(() => {
    setSelectedCategories(
      searchQuery.category ? searchQuery.category.split(',') : []
    );
    setSelectedBrands(searchQuery.brand ? searchQuery.brand.split(',') : []);
    setPriceRange({ min: searchQuery.minPrice, max: searchQuery.maxPrice });
    setSelectedRating(searchQuery.minRating);
  }, [searchQuery]);

  // Update URL parameters
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0 && value !== '0') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (!newFilters.page) {
      params.delete('page');
    }

    setSearchParams(params);
  };

  // Filter handlers
  const handleCategoryChange = (category) => {
    let newCategories;
    if (selectedCategories.includes(category)) {
      newCategories = selectedCategories.filter((c) => c !== category);
    } else {
      newCategories = [...selectedCategories, category];
    }
    setSelectedCategories(newCategories);
    updateFilters({ category: newCategories.join(',') });
  };

  const handleBrandChange = (brand) => {
    let newBrands;
    if (selectedBrands.includes(brand)) {
      newBrands = selectedBrands.filter((b) => b !== brand);
    } else {
      newBrands = [...selectedBrands, brand];
    }
    setSelectedBrands(newBrands);
    updateFilters({ brand: newBrands.join(',') });
  };

  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
    updateFilters({ minPrice: min, maxPrice: max });
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    updateFilters({ minRating: rating });
  };

  const handleSortChange = (sortBy) => {
    updateFilters({ sortBy });
  };

  const handlePageChange = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 10000 });
    setSelectedRating(0);
    updateFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 10000,
      minRating: 0,
      page: 1,
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="relative mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <button className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-50">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        {product.isPrime && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Prime
          </div>
        )}
        {product.discount && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
            -{product.discount}%
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-5">
        {product.name}
      </h3>

      <div className="flex items-center mb-2">
        {renderStars(product.rating)}
        <span className="ml-2 text-sm text-blue-600 hover:underline cursor-pointer">
          ({product.numReviews})
        </span>
      </div>

      <div className="flex items-center mb-3">
        <span className="text-lg font-bold text-gray-900">
          ${product.price}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="ml-2 text-sm text-gray-500 line-through">
            ${product.originalPrice}
          </span>
        )}
      </div>

      {product.freeShipping && (
        <p className="text-sm text-green-700 mb-3">FREE Shipping</p>
      )}

      <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors">
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </button>
    </div>
  );

  const FilterSection = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );

  const FilterSidebar = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile ? 'fixed inset-0 z-50 bg-white' : 'w-64'
      } space-y-4`}
    >
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={isMobile ? 'p-4 overflow-y-auto' : ''}>
        {/* Clear All Filters */}
        <div className="mb-4">
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>

        {/* Categories */}
        <FilterSection title="Categories">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 mr-2"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price">
          <div className="space-y-2">
            {[
              { label: 'Under $25', min: 0, max: 25 },
              { label: '$25 to $50', min: 25, max: 50 },
              { label: '$50 to $100', min: 50, max: 100 },
              { label: '$100 to $200', min: 100, max: 200 },
              { label: '$200 & Above', min: 200, max: 10000 },
            ].map((range) => (
              <label key={range.label} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  className="mr-2"
                  checked={
                    priceRange.min === range.min && priceRange.max === range.max
                  }
                  onChange={() => handlePriceChange(range.min, range.max)}
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Brands */}
        {brands.length > 0 && (
          <FilterSection title="Brands">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 mr-2"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Customer Rating */}
        <FilterSection title="Customer Rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  className="mr-2"
                  checked={selectedRating === rating}
                  onChange={() => handleRatingChange(rating)}
                />
                <div className="flex items-center">
                  {renderStars(rating)}
                  <span className="ml-2 text-sm text-gray-700">& Up</span>
                </div>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="rating"
                className="mr-2"
                checked={selectedRating === 0}
                onChange={() => handleRatingChange(0)}
              />
              <span className="text-sm text-gray-700">All Ratings</span>
            </label>
          </div>
        </FilterSection>

        {/* Prime & Shipping */}
        <FilterSection title="Prime & Shipping">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 mr-2"
                checked={searchQuery.isPrime === 'true'}
                onChange={(e) =>
                  updateFilters({ isPrime: e.target.checked ? 'true' : '' })
                }
              />
              <span className="text-sm text-gray-700">Prime Eligible</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 mr-2"
                checked={searchQuery.isFreeShipping === 'true'}
                onChange={(e) =>
                  updateFilters({
                    isFreeShipping: e.target.checked ? 'true' : '',
                  })
                }
              />
              <span className="text-sm text-gray-700">Free Shipping</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <PageTitle title="Search Results"/>
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Search Results Header */}
        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery.query
              ? `Search results for "${searchQuery.query}"`
              : 'All Products'}
          </h1>
          <p className="text-gray-600">{totalProducts} results found</p>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div
            className={`hidden lg:block ${
              showFilters ? 'w-64' : 'w-0'
            } transition-all duration-300`}
          >
            {showFilters && <FilterSidebar />}
          </div>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="lg:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowMobileFilters(false)}
              />
              <FilterSidebar isMobile={true} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Desktop Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="hidden lg:flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex rounded-md border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${
                        viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 border-l border-gray-300 ${
                        viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <select
                    value={searchQuery.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                <p className="text-gray-400">
                  Try adjusting your search filters
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`${
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 0 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const page =
                          Math.max(1, pagination.currentPage - 2) + i;
                        if (page > pagination.totalPages) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 border rounded-md ${
                              page === pagination.currentPage
                                ? 'bg-yellow-400 text-white border-yellow-400'
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SearchResults;

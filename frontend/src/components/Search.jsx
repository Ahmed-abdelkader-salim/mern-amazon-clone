import React, { useState } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useGetCategoriesQuery, useGetSuggestionsQuery } from '../app/api';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Fetch categories from backend
  const { data: categoriesData } = useGetCategoriesQuery();

  // Fetch suggestions from backend as user types
  const { data: suggestionData } = useGetSuggestionsQuery(searchQuery, {
    skip: !searchQuery.trim() || searchQuery.length < 2,
  });
  const suggestions = suggestionData?.suggestions || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = {
        query: searchQuery
      };
      
      if (selectedCategory !== 'All') {
        searchParams.category = selectedCategory;
      }
      
      navigate({
        pathname: "/search",
        search: createSearchParams(searchParams).toString()
      });
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    
    const searchParams = {
      query: suggestion.name
    };
    
    if (selectedCategory !== 'All') {
      searchParams.category = selectedCategory;
    }
    
    navigate({
      pathname: "/search",
      search: createSearchParams(searchParams).toString()
    });
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="w-[100%] relative">
      <form onSubmit={handleSearch}>
        <div className="flex items-center h-10 bg-amazonClone-yellow rounded group focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-opacity-100">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='p-2 bg-gray-300 text-black border text-xs xl:text-sm rounded-l focus:outline-none focus:ring-2 focus:ring-yellow-500'
          >
            <option value="All">All</option>
            {categoriesData?.categories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder='Search amazon'
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className='flex grow outline-none items-center h-[100%] text-black pl-2'
            autoComplete="off"
          />
          <button
            type="submit"
            className='w-[45px] focus:outline-none border-r-0 hover:bg-orange-300 transition-colors duration-200'
          >
            <MagnifyingGlassIcon className='h-[27px] m-auto stroke-slate-900' />
          </button>
        </div>
      </form>
      
      {showSuggestions && searchQuery.trim() && suggestions.length > 0 && (
        <div className='bg-white text-black w-full z-40 absolute top-12 left-0 rounded shadow-lg max-h-60 overflow-y-auto border border-gray-200'>
          {suggestions
            .filter(suggestion => {
              const currentSearchQuery = searchQuery.toLowerCase();
              const title = suggestion.name?.toLowerCase() || '';
              return (
                currentSearchQuery &&
                title.includes(currentSearchQuery) &&
                title !== currentSearchQuery
              );
            })
            .slice(0, 10)
            .map((suggestion) => (
              <div
                key={suggestion._id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{suggestion.name}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Search;
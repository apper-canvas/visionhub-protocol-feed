import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import productService from "@/services/api/productService";

const SearchBar = ({ className = "" }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const searchResults = await productService.search(query);
          setResults(searchResults);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
    setQuery("");
  };

  const formatPrice = (price, discountPrice) => {
    if (discountPrice) {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-accent">${discountPrice}</span>
          <span className="text-sm text-gray-400 line-through">${price}</span>
        </div>
      );
    }
    return <span className="font-semibold text-primary">${price}</span>;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for eyewear..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-20 transition-all duration-200"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <ApperIcon name="Loader2" size={20} className="text-gray-400 animate-spin" />
            ) : (
              <ApperIcon name="Search" size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((product) => (
                <button
                  key={product.Id}
                  onClick={() => handleProductClick(product.Id)}
                  className="w-full px-4 py-3 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <img
                    src={product.images[0]}
                    alt={`${product.brand} ${product.model}`}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-primary">
                        {product.brand} {product.model}
                      </h4>
                      {formatPrice(product.price, product.discountPrice)}
                    </div>
                    <p className="text-sm text-secondary">
                      {product.category} • {product.frameShape}
                    </p>
                  </div>
                </button>
              ))}
              
              {query && (
                <button
                  onClick={() => {
                    navigate(`/?search=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="w-full px-4 py-3 border-t border-gray-100 text-accent hover:bg-accent/5 transition-colors duration-200 text-center font-medium"
                >
                  View all results for "{query}"
                </button>
              )}
            </div>
          ) : query.length >= 2 && !loading ? (
            <div className="py-8 text-center text-secondary">
              <ApperIcon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
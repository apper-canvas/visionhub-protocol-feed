import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductGrid from "@/components/organisms/ProductGrid";
import FilterPanel from "@/components/molecules/FilterPanel";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import productService from "@/services/api/productService";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filterOptions, setFilterOptions] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState("newest");

  // Initialize filters from URL params
  useEffect(() => {
    const filters = {
      category: searchParams.get("category") || "all",
      gender: searchParams.get("gender") || "all",
      frameShape: searchParams.get("frameShape")?.split(",").filter(Boolean) || [],
      frameColor: searchParams.get("frameColor")?.split(",").filter(Boolean) || [],
      brand: searchParams.get("brand")?.split(",").filter(Boolean) || [],
      search: searchParams.get("search") || "",
      sortBy: searchParams.get("sortBy") || "newest"
    };

    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    if (priceMin && priceMax) {
      filters.priceRange = { min: parseInt(priceMin), max: parseInt(priceMax) };
    }

    setActiveFilters(filters);
    setSortBy(filters.sortBy);
  }, [searchParams]);

  // Load filter options
  useEffect(() => {
    const options = productService.getFilterOptions();
    setFilterOptions(options);
  }, []);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        } else if (typeof value === "object" && value.min !== undefined) {
          params.set("priceMin", value.min.toString());
          params.set("priceMax", value.max.toString());
        } else if (typeof value === "string") {
          params.set(key, value);
        }
      }
    });

    setSearchParams(params);
  };

  const handleFilterChange = (filterType, value, checked) => {
    let newFilters = { ...activeFilters };

    switch (filterType) {
      case "category":
      case "gender":
        newFilters[filterType] = value;
        break;
      
      case "frameShape":
      case "frameColor":
      case "brand":
        if (checked) {
          newFilters[filterType] = [...(newFilters[filterType] || []), value];
        } else {
          newFilters[filterType] = (newFilters[filterType] || []).filter(item => item !== value);
        }
        break;

      case "priceRange":
        newFilters[filterType] = value;
        break;

      default:
        break;
    }

    updateFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const newFilters = { ...activeFilters, sortBy: newSortBy };
    updateFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.category && activeFilters.category !== "all") count++;
    if (activeFilters.gender && activeFilters.gender !== "all") count++;
    if (activeFilters.frameShape?.length > 0) count += activeFilters.frameShape.length;
    if (activeFilters.frameColor?.length > 0) count += activeFilters.frameColor.length;
    if (activeFilters.brand?.length > 0) count += activeFilters.brand.length;
    if (activeFilters.priceRange) count++;
    return count;
  };

  const getPageTitle = () => {
    if (activeFilters.search) {
      return `Search Results for "${activeFilters.search}"`;
    }
    if (activeFilters.category === "eyeglasses") {
      return "Eyeglasses Collection";
    }
    if (activeFilters.category === "sunglasses") {
      return "Sunglasses Collection";
    }
    return "Premium Eyewear Collection";
  };

  const getPageDescription = () => {
    if (activeFilters.search) {
      return `Discover eyewear matching your search for "${activeFilters.search}"`;
    }
    if (activeFilters.category === "eyeglasses") {
      return "Discover our curated collection of prescription eyeglasses and reading glasses";
    }
    if (activeFilters.category === "sunglasses") {
      return "Explore premium sunglasses for style and UV protection";
    }
    return "Discover our complete collection of premium eyewear from top brands";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {!activeFilters.search && activeFilters.category === "all" && (
        <section className="relative bg-gradient-to-br from-primary to-secondary text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-accent/20 to-transparent rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-transparent rounded-full translate-y-40 -translate-x-40" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                Vision Style
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Discover premium eyewear from world-class brands with our virtual try-on technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="xl"
                icon="Glasses"
                onClick={() => navigate("/?category=eyeglasses")}
                className="bg-gradient-to-r from-accent to-orange-600 hover:from-accent/90 hover:to-orange-500"
              >
                Shop Eyeglasses
              </Button>
              <Button
                variant="secondary"
                size="xl"
                icon="Sun"
                onClick={() => navigate("/?category=sunglasses")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Shop Sunglasses
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary font-display mb-2">
            {getPageTitle()}
          </h2>
          <p className="text-secondary text-lg">
            {getPageDescription()}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          {/* Active Filters Display */}
          <div className="flex items-center gap-4">
            {getActiveFilterCount() > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-secondary">
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? "s" : ""} applied
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-accent hover:text-accent/80 h-8"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-secondary whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filterOptions}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <ProductGrid filters={activeFilters} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const FilterPanel = ({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onClearFilters,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    gender: true,
    frameShape: false,
    frameColor: false,
    brand: false,
    price: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value, checked) => {
    onFilterChange(filterType, value, checked);
  };

  const handlePriceChange = (min, max) => {
    onFilterChange("priceRange", { min: parseInt(min), max: parseInt(max) });
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

  const FilterSection = ({ title, children, sectionKey }) => (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <h4 className="font-semibold text-primary font-display">{title}</h4>
        <ApperIcon 
          name={expandedSections[sectionKey] ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-secondary" 
        />
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxFilter = ({ options, activeValues, filterType }) => (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {options.map((option) => (
        <label key={option} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={activeValues?.includes(option) || false}
            onChange={(e) => handleFilterChange(filterType, option, e.target.checked)}
            className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent focus:ring-2"
          />
          <span className="text-sm text-secondary group-hover:text-primary transition-colors duration-200">
            {option}
          </span>
        </label>
      ))}
    </div>
  );

  const RadioFilter = ({ options, activeValue, filterType }) => (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="radio"
            name={filterType}
            value={option.value}
            checked={activeValue === option.value}
            onChange={(e) => handleFilterChange(filterType, e.target.value)}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent focus:ring-2"
          />
          <span className="text-sm text-secondary group-hover:text-primary transition-colors duration-200">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          icon="Filter"
          className="w-full justify-center"
        >
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="primary" size="sm" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block ${className}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary font-display">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-accent hover:text-accent/80"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Category Filter */}
            <FilterSection title="Category" sectionKey="category">
              <RadioFilter
                options={[
                  { value: "all", label: "All Products" },
                  { value: "eyeglasses", label: "Eyeglasses" },
                  { value: "sunglasses", label: "Sunglasses" }
                ]}
                activeValue={activeFilters.category || "all"}
                filterType="category"
              />
            </FilterSection>

            {/* Gender Filter */}
            <FilterSection title="Gender" sectionKey="gender">
              <RadioFilter
                options={[
                  { value: "all", label: "All" },
                  { value: "men", label: "Men" },
                  { value: "women", label: "Women" },
                  { value: "unisex", label: "Unisex" }
                ]}
                activeValue={activeFilters.gender || "all"}
                filterType="gender"
              />
            </FilterSection>

            {/* Frame Shape Filter */}
            {filters.frameShapes && filters.frameShapes.length > 0 && (
              <FilterSection title="Frame Shape" sectionKey="frameShape">
                <CheckboxFilter
                  options={filters.frameShapes}
                  activeValues={activeFilters.frameShape}
                  filterType="frameShape"
                />
              </FilterSection>
            )}

            {/* Frame Color Filter */}
            {filters.frameColors && filters.frameColors.length > 0 && (
              <FilterSection title="Frame Color" sectionKey="frameColor">
                <CheckboxFilter
                  options={filters.frameColors}
                  activeValues={activeFilters.frameColor}
                  filterType="frameColor"
                />
              </FilterSection>
            )}

            {/* Brand Filter */}
            {filters.brands && filters.brands.length > 0 && (
              <FilterSection title="Brand" sectionKey="brand">
                <CheckboxFilter
                  options={filters.brands}
                  activeValues={activeFilters.brand}
                  filterType="brand"
                />
              </FilterSection>
            )}

            {/* Price Range Filter */}
            {filters.priceRange && (
              <FilterSection title="Price Range" sectionKey="price">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <span>${filters.priceRange.min}</span>
                    <span>${filters.priceRange.max}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min={filters.priceRange.min}
                      max={filters.priceRange.max}
                      value={activeFilters.priceRange?.min || filters.priceRange.min}
                      onChange={(e) => handlePriceChange(
                        e.target.value, 
                        activeFilters.priceRange?.max || filters.priceRange.max
                      )}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      min={filters.priceRange.min}
                      max={filters.priceRange.max}
                      value={activeFilters.priceRange?.max || filters.priceRange.max}
                      onChange={(e) => handlePriceChange(
                        activeFilters.priceRange?.min || filters.priceRange.min,
                        e.target.value
                      )}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </FilterSection>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
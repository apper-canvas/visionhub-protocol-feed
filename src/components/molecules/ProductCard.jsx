import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import cartService from "@/services/api/cartService";

const ProductCard = ({ product, className = "" }) => {
  const navigate = useNavigate();

  const formatPrice = (price, discountPrice) => {
    if (discountPrice) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-accent">${discountPrice}</span>
          <span className="text-sm text-gray-400 line-through">${price}</span>
        </div>
      );
    }
    return <span className="text-lg font-bold text-primary">${price}</span>;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await cartService.addItem(product.Id);
      toast.success(`${product.brand} ${product.model} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Failed to add item to cart", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.Id}`);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <ApperIcon key={`full-${i}`} name="Star" size={14} className="text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && (
          <ApperIcon name="Star" size={14} className="text-yellow-400 fill-current opacity-50" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <ApperIcon key={`empty-${i}`} name="Star" size={14} className="text-gray-300" />
        ))}
        <span className="text-sm text-secondary ml-1">({product.reviewCount})</span>
      </div>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-50 relative">
        <img
          src={product.images[0]}
          alt={`${product.brand} ${product.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {product.discountPrice && (
            <Badge variant="error" size="sm">
              Save ${product.price - product.discountPrice}
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="warning" size="sm">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-accent hover:bg-accent hover:text-white transform hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ApperIcon name="Plus" size={18} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Brand & Model */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-accent">{product.brand}</p>
          <h3 className="font-bold text-primary group-hover:text-accent transition-colors duration-200 font-display">
            {product.model}
          </h3>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm text-secondary">
          <span>{product.frameShape}</span>
          <span>{product.frameColor}</span>
        </div>

        {/* Rating */}
        {renderStars(product.rating)}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2">
          {formatPrice(product.price, product.discountPrice)}
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
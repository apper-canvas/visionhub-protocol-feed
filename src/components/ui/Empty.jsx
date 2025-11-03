import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  type = "products",
  title = "",
  description = "",
  actionText = "",
  actionPath = "/"
}) => {
  const navigate = useNavigate();

  const getEmptyContent = () => {
    switch (type) {
      case "cart":
        return {
          icon: "ShoppingBag",
          title: title || "Your cart is empty",
          description: description || "Looks like you haven't added any eyewear to your cart yet. Discover our amazing collection!",
          actionText: actionText || "Shop Eyewear",
          actionPath: actionPath || "/"
        };
      case "search":
        return {
          icon: "Search",
          title: title || "No results found",
          description: description || "We couldn't find any products matching your search. Try adjusting your filters or search terms.",
          actionText: actionText || "Clear Filters",
          actionPath: actionPath || "/"
        };
      case "wishlist":
        return {
          icon: "Heart",
          title: title || "Your wishlist is empty",
          description: description || "Save your favorite frames to keep track of what you love.",
          actionText: actionText || "Browse Collection",
          actionPath: actionPath || "/"
        };
      case "orders":
        return {
          icon: "Package",
          title: title || "No orders yet",
          description: description || "When you place your first order, it will appear here.",
          actionText: actionText || "Start Shopping",
          actionPath: actionPath || "/"
        };
      default:
        return {
          icon: "Glasses",
          title: title || "No products found",
          description: description || "We couldn't find any products matching your criteria. Try adjusting your filters.",
          actionText: actionText || "View All Products",
          actionPath: actionPath || "/"
        };
    }
  };

  const content = getEmptyContent();

  const handleAction = () => {
    if (content.actionPath.startsWith("http")) {
      window.open(content.actionPath, "_blank");
    } else {
      navigate(content.actionPath);
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-lg mx-auto px-6">
        {/* Empty State Illustration */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center">
            <ApperIcon 
              name={content.icon} 
              size={64} 
              className="text-accent/60" 
            />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent to-orange-600 rounded-full opacity-20 animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-accent rounded-full opacity-30 animate-pulse delay-300" />
        </div>

        {/* Empty State Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-primary font-display">
            {content.title}
          </h3>
          <p className="text-secondary text-base leading-relaxed max-w-md mx-auto">
            {content.description}
          </p>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <button
            onClick={handleAction}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent to-orange-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 group"
          >
            <ApperIcon 
              name="ArrowRight" 
              size={20} 
              className="ml-2 group-hover:translate-x-1 transition-transform duration-200" 
            />
            {content.actionText}
          </button>

          {type === "cart" && (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => navigate("/?category=eyeglasses")}
                className="text-sm text-accent hover:text-accent/80 font-medium hover:underline transition-colors duration-200"
              >
                Shop Eyeglasses
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate("/?category=sunglasses")}
                className="text-sm text-accent hover:text-accent/80 font-medium hover:underline transition-colors duration-200"
              >
                Shop Sunglasses
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate("/virtual-try-on")}
                className="text-sm text-accent hover:text-accent/80 font-medium hover:underline transition-colors duration-200"
              >
                Virtual Try-On
              </button>
            </div>
          )}
        </div>

        {/* Additional Help or Features */}
        {type === "search" && (
          <div className="pt-8 border-t border-gray-200 space-y-4">
            <h4 className="text-sm font-medium text-primary">Popular Categories:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {["Aviator", "Round", "Square", "Cat Eye"].map((shape) => (
                <button
                  key={shape}
                  onClick={() => navigate(`/?frameShape=${shape.toLowerCase()}`)}
                  className="px-4 py-2 bg-white border border-gray-200 text-sm text-primary rounded-full hover:border-accent hover:text-accent transition-colors duration-200"
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Empty;
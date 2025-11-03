import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry = null,
  showRetry = true,
  type = "general"
}) => {
  const getErrorContent = () => {
    switch (type) {
      case "network":
        return {
          icon: "WifiOff",
          title: "Connection Error",
          description: "Please check your internet connection and try again."
        };
      case "product":
        return {
          icon: "Package",
          title: "Product Not Found",
          description: "The product you're looking for doesn't exist or has been removed."
        };
      case "cart":
        return {
          icon: "ShoppingCart",
          title: "Cart Error",
          description: "There was an issue with your cart. Please try again."
        };
      default:
        return {
          icon: "AlertCircle",
          title: "Oops! Something went wrong",
          description: message
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        {/* Error Icon */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <ApperIcon 
            name={content.icon} 
            size={48} 
            className="text-red-600" 
          />
        </div>

        {/* Error Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-primary font-display">
            {content.title}
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <ApperIcon 
                name="RotateCcw" 
                size={18} 
                className="mr-2 group-hover:rotate-180 transition-transform duration-500" 
              />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 text-primary font-medium rounded-lg hover:border-accent hover:text-accent transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <ApperIcon 
              name="Home" 
              size={18} 
              className="mr-2" 
            />
            Go Home
          </button>
        </div>

        {/* Additional Help */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-secondary">
            Need help? Contact our{" "}
            <a 
              href="mailto:support@visionhub.com" 
              className="text-accent hover:underline font-medium"
            >
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;
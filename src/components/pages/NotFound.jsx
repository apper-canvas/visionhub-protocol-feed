import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold text-gray-200 font-display">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-accent/30 rounded-full flex items-center justify-center">
              <ApperIcon name="Glasses" size={48} className="text-accent" />
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary font-display">
            Oops! Frame Not Found
          </h1>
          <p className="text-secondary text-lg leading-relaxed">
            The page you're looking for seems to have slipped out of frame. 
            Don't worry, we'll help you find the perfect view.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/")}
            icon="Home"
            className="shadow-lg"
          >
            Back to Home
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
            icon="ArrowLeft"
          >
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-primary mb-4">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/?category=eyeglasses")}
              className="text-accent hover:text-accent/80 hover:underline transition-colors duration-200"
            >
              Shop Eyeglasses
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/?category=sunglasses")}
              className="text-accent hover:text-accent/80 hover:underline transition-colors duration-200"
            >
              Shop Sunglasses
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/virtual-try-on")}
              className="text-accent hover:text-accent/80 hover:underline transition-colors duration-200"
            >
              Virtual Try-On
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="pt-6">
          <p className="text-xs text-secondary">
            Need help finding something specific?{" "}
            <a 
              href="mailto:support@visionhub.com" 
              className="text-accent hover:underline font-medium"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
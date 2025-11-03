import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  icon = null,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-accent to-orange-600 text-white shadow-lg hover:shadow-xl focus:ring-accent",
    secondary: "bg-white border-2 border-gray-200 text-primary hover:border-accent hover:text-accent shadow-sm hover:shadow-md focus:ring-gray-200",
    outline: "border-2 border-accent text-accent hover:bg-accent hover:text-white shadow-sm hover:shadow-md focus:ring-accent",
    ghost: "text-primary hover:bg-gray-100 focus:ring-gray-200",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
    xl: "px-8 py-5 text-xl"
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <ApperIcon name="Loader2" size={iconSizes[size]} className="animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <ApperIcon name={icon} size={iconSizes[size]} className="mr-2" />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <ApperIcon name={icon} size={iconSizes[size]} className="ml-2" />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
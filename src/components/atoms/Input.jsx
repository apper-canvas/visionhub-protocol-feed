import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Input = forwardRef(({
  type = "text",
  placeholder = "",
  error = "",
  icon = null,
  iconPosition = "left",
  className = "",
  ...props
}, ref) => {
  const baseStyles = "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 font-body";
  
  const variants = {
    default: "border-gray-200 focus:border-accent focus:ring-accent bg-white text-primary placeholder-gray-400",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 text-red-900 placeholder-red-400"
  };

  const variant = error ? "error" : "default";

  return (
    <div className="relative">
      {icon && iconPosition === "left" && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <ApperIcon name={icon} size={20} className={error ? "text-red-400" : "text-gray-400"} />
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={cn(
          baseStyles,
          variants[variant],
          icon && iconPosition === "left" ? "pl-12" : "",
          icon && iconPosition === "right" ? "pr-12" : "",
          className
        )}
        {...props}
      />
      
      {icon && iconPosition === "right" && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ApperIcon name={icon} size={20} className={error ? "text-red-400" : "text-gray-400"} />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
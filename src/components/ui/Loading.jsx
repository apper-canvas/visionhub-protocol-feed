import React from "react";

const Loading = ({ type = "products" }) => {
  if (type === "product-detail") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-shimmer" />
              <div className="flex space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-shimmer" />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-24 animate-shimmer" />
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-shimmer" />
                <div className="h-6 bg-gray-200 rounded w-32 animate-shimmer" />
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-shimmer" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-shimmer" />
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-shimmer" />
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-24 animate-shimmer" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-shimmer" />
                  ))}
                </div>
              </div>

              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "cart") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-shimmer" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-shimmer" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
                    <div className="h-6 bg-gray-200 rounded w-24 animate-shimmer" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default products grid loading
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-200 animate-shimmer" />
              
              {/* Content skeleton */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-shimmer" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-shimmer" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20 animate-shimmer" />
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-shimmer" />
                    ))}
                  </div>
                </div>
                
                <div className="h-10 bg-gray-200 rounded-lg animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
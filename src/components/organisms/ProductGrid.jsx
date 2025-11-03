import React, { useState, useEffect } from "react";
import ProductCard from "@/components/molecules/ProductCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import productService from "@/services/api/productService";

const ProductGrid = ({ filters = {}, className = "" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getAll(filters);
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadProducts();
  };

  if (loading) {
    return <Loading type="products" />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={handleRetry}
        type="network"
      />
    );
  }

  if (products.length === 0) {
    const emptyType = filters.search ? "search" : "products";
    const title = filters.search ? `No results for "${filters.search}"` : "No products found";
    const description = filters.search 
      ? "Try adjusting your search terms or browse our full collection."
      : "We couldn't find any products matching your current filters.";
    
    return (
      <Empty
        type={emptyType}
        title={title}
        description={description}
        actionText="Clear Filters"
        actionPath="/"
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.Id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
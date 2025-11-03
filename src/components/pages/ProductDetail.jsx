import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ProductCard from "@/components/molecules/ProductCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import productService from "@/services/api/productService";
import cartService from "@/services/api/cartService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedLensType, setSelectedLensType] = useState("standard");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const [productData, relatedData] = await Promise.all([
        productService.getById(id),
        productService.getRelated(id)
      ]);
      setProduct(productData);
      setRelatedProducts(relatedData);
      setSelectedImage(0);
    } catch (err) {
      setError(err.message || "Failed to load product");
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await cartService.addItem(product.Id, quantity, selectedLensType);
      toast.success(
        `${product.brand} ${product.model} added to cart!`,
        { autoClose: 2000 }
      );
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      await cartService.addItem(product.Id, quantity, selectedLensType);
      navigate("/cart");
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Buy now error:", error);
    }
  };

  const formatPrice = (price, discountPrice) => {
    if (discountPrice) {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-accent">${discountPrice}</span>
          <span className="text-xl text-gray-400 line-through">${price}</span>
          <Badge variant="error" size="md">
            Save ${price - discountPrice}
          </Badge>
        </div>
      );
    }
    return <span className="text-3xl font-bold text-primary">${price}</span>;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <ApperIcon key={`full-${i}`} name="Star" size={20} className="text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && (
          <ApperIcon name="Star" size={20} className="text-yellow-400 fill-current opacity-50" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <ApperIcon key={`empty-${i}`} name="Star" size={20} className="text-gray-300" />
        ))}
        <span className="text-lg text-secondary ml-2">
          {rating} ({product?.reviewCount} reviews)
        </span>
      </div>
    );
  };

  if (loading) {
    return <Loading type="product-detail" />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadProduct}
        type="product"
      />
    );
  }

  if (!product) {
    return (
      <Error
        message="Product not found"
        type="product"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2 text-sm text-secondary">
          <button onClick={() => navigate("/")} className="hover:text-accent transition-colors duration-200">
            Home
          </button>
          <ApperIcon name="ChevronRight" size={14} />
          <button 
            onClick={() => navigate(`/?category=${product.category.toLowerCase()}`)}
            className="hover:text-accent transition-colors duration-200"
          >
            {product.category}
          </button>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-primary font-medium">
            {product.brand} {product.model}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={`${product.brand} ${product.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? "border-accent shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Virtual Try-On Button */}
            <Button
              variant="outline"
              size="lg"
              icon="Camera"
              onClick={() => navigate("/virtual-try-on")}
              className="w-full"
            >
              Try On Virtually
            </Button>
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            {/* Product Title & Price */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Badge variant="primary" size="md">{product.brand}</Badge>
                {!product.inStock && (
                  <Badge variant="error" size="md">Out of Stock</Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-primary font-display">
                {product.model}
              </h1>
              
              {formatPrice(product.price, product.discountPrice)}
              
              {/* Rating */}
              {renderStars(product.rating)}
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary font-display">Description</h3>
              <p className="text-secondary leading-relaxed">{product.description}</p>
            </div>

            {/* Product Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary font-display">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-primary">Frame Shape:</span>
                  <span className="text-secondary ml-2">{product.frameShape}</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Material:</span>
                  <span className="text-secondary ml-2">{product.frameMaterial}</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Color:</span>
                  <span className="text-secondary ml-2">{product.frameColor}</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Gender:</span>
                  <span className="text-secondary ml-2">{product.gender}</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Lens Width:</span>
                  <span className="text-secondary ml-2">{product.size.lensWidth}mm</span>
                </div>
                <div>
                  <span className="font-medium text-primary">Bridge Width:</span>
                  <span className="text-secondary ml-2">{product.size.bridgeWidth}mm</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary font-display">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature, index) => (
                  <Badge key={index} variant="outline" size="md">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Lens Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary font-display">Lens Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: "standard", label: "Standard", price: 0 },
                  { value: "blue-light", label: "Blue Light", price: 25 },
                  { value: "prescription", label: "Prescription", price: 50 }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedLensType(option.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      selectedLensType === option.value
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-gray-200 hover:border-gray-300 text-primary"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-secondary">
                      {option.price > 0 ? `+$${option.price}` : "Included"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <label className="font-medium text-primary">Quantity:</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <ApperIcon name="Minus" size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium text-primary min-w-16 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <ApperIcon name="Plus" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={!product.inStock}
                  className="flex-1"
                  icon="ShoppingCart"
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-primary font-display mb-8">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.Id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
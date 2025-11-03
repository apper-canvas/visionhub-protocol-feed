import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import productService from "@/services/api/productService";
import cartService from "@/services/api/cartService";

const VirtualTryOn = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [framePosition, setFramePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    loadProducts();
    return () => {
      // Cleanup camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await productService.getAll({ category: "eyeglasses" });
      setProducts(data.slice(0, 8)); // Limit to first 8 products
      if (data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError("");
      }
    } catch (err) {
      setError("Unable to access camera. Please check your permissions and try again.");
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Simulate capture flash effect
    setTimeout(() => {
      setIsCapturing(false);
      toast.success("Photo captured! You can save or share your try-on.");
    }, 200);
  };

  const handleAddToCart = async (product) => {
    try {
      await cartService.addItem(product.Id);
      toast.success(`${product.brand} ${product.model} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Add to cart error:", error);
    }
  };

  const adjustFramePosition = (direction) => {
    const step = 5;
    setFramePosition(prev => {
      switch (direction) {
        case "up":
          return { ...prev, y: prev.y - step };
        case "down":
          return { ...prev, y: prev.y + step };
        case "left":
          return { ...prev, x: prev.x - step };
        case "right":
          return { ...prev, x: prev.x + step };
        case "bigger":
          return { ...prev, scale: Math.min(prev.scale + 0.1, 2) };
        case "smaller":
          return { ...prev, scale: Math.max(prev.scale - 0.1, 0.5) };
        default:
          return prev;
      }
    });
  };

  const resetFramePosition = () => {
    setFramePosition({ x: 0, y: 0, scale: 1 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ApperIcon name="Loader2" size={48} className="animate-spin text-accent mx-auto" />
          <p className="text-primary font-medium">Loading Virtual Try-On...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary font-display mb-4">
            Virtual Try-On
          </h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            See how our eyewear looks on you before you buy. Try on different frames and find your perfect style.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Camera Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Camera Controls */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-primary font-display">
                    Try-On Camera
                  </h2>
                  <div className="flex items-center space-x-3">
                    {!cameraActive ? (
                      <Button
                        variant="primary"
                        onClick={startCamera}
                        icon="Camera"
                        disabled={!selectedProduct}
                      >
                        Start Camera
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={capturePhoto}
                          icon="Camera"
                          className={isCapturing ? "animate-pulse" : ""}
                        >
                          Capture
                        </Button>
                        <Button
                          variant="outline"
                          onClick={stopCamera}
                          icon="CameraOff"
                        >
                          Stop
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Camera View */}
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                {error ? (
                  <div className="text-center text-white space-y-4">
                    <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-400" />
                    <p className="text-lg">{error}</p>
                    <Button variant="primary" onClick={startCamera} icon="RotateCcw">
                      Try Again
                    </Button>
                  </div>
                ) : !cameraActive ? (
                  <div className="text-center text-white space-y-4">
                    <ApperIcon name="Camera" size={64} className="mx-auto text-gray-400" />
                    <p className="text-lg">Click "Start Camera" to begin virtual try-on</p>
                    {!selectedProduct && (
                      <p className="text-sm text-gray-400">Select a frame first</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Video Element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => setError("")}
                    />
                    
                    {/* Frame Overlay */}
                    {selectedProduct && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          transform: `translate(${framePosition.x}px, ${framePosition.y}px)`
                        }}
                      >
                        <img
                          src={selectedProduct.images[0]}
                          alt={`${selectedProduct.brand} ${selectedProduct.model}`}
                          className="max-w-60 max-h-32 object-contain opacity-80"
                          style={{
                            transform: `scale(${framePosition.scale})`,
                            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
                          }}
                        />
                      </div>
                    )}

                    {/* Capture Flash Effect */}
                    {isCapturing && (
                      <div className="absolute inset-0 bg-white animate-pulse" />
                    )}
                  </>
                )}
                
                {/* Hidden Canvas for Capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Frame Adjustment Controls */}
              {cameraActive && selectedProduct && (
                <div className="p-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-primary font-display mb-4">
                    Adjust Frame Position
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Position Controls */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Position</p>
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustFramePosition("up")}
                          icon="ChevronUp"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustFramePosition("down")}
                          icon="ChevronDown"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustFramePosition("left")}
                          icon="ChevronLeft"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustFramePosition("right")}
                          icon="ChevronRight"
                        />
                      </div>
                    </div>

                    {/* Size Controls */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Size</p>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustFramePosition("bigger")}
                          icon="Plus"
                          className="w-full"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustFramePosition("smaller")}
                          icon="Minus"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Reset */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Reset</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFramePosition}
                        icon="RotateCcw"
                        className="w-full"
                      >
                        Reset
                      </Button>
                    </div>

                    {/* Add to Cart */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary">Action</p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddToCart(selectedProduct)}
                        icon="ShoppingCart"
                        className="w-full"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frame Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-primary font-display mb-6">
                Select Frames
              </h3>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.Id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      selectedProduct?.Id === product.Id
                        ? "border-accent bg-accent/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex space-x-3">
                      <img
                        src={product.images[0]}
                        alt={`${product.brand} ${product.model}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="primary" size="sm">
                            {product.brand}
                          </Badge>
                          {product.discountPrice && (
                            <Badge variant="error" size="sm">
                              Sale
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-primary text-sm truncate">
                          {product.model}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-1">
                            {product.discountPrice ? (
                              <>
                                <span className="font-semibold text-accent text-sm">
                                  ${product.discountPrice}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  ${product.price}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold text-primary text-sm">
                                ${product.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <ApperIcon name="Star" size={12} className="text-yellow-400 fill-current" />
                            <span className="text-xs text-secondary ml-1">
                              {product.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/")}
                  icon="ArrowLeft"
                  className="w-full"
                >
                  Browse All Frames
                </Button>
                
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate("/cart")}
                  icon="ShoppingBag"
                  className="w-full"
                >
                  View Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary font-display mb-8">
            Why Use Virtual Try-On?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Eye" size={32} className="text-accent" />
              </div>
              <h3 className="font-semibold text-primary">See the Perfect Fit</h3>
              <p className="text-secondary text-sm">
                Visualize how frames will look on your face shape and size
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Clock" size={32} className="text-accent" />
              </div>
              <h3 className="font-semibold text-primary">Save Time & Money</h3>
              <p className="text-secondary text-sm">
                Try multiple frames instantly without visiting a store
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Share2" size={32} className="text-accent" />
              </div>
              <h3 className="font-semibold text-primary">Share & Compare</h3>
              <p className="text-secondary text-sm">
                Capture photos and get opinions from friends and family
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import cartService from "@/services/api/cartService";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      const items = await cartService.getAll();
      setCartItems(items);
    } catch (err) {
      setError(err.message || "Failed to load cart");
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      setUpdatingItems(prev => new Set([...prev, productId]));
      const updatedItems = await cartService.updateQuantity(productId, newQuantity);
      setCartItems(updatedItems);
      
      if (newQuantity === 0) {
        toast.success("Item removed from cart");
      }
    } catch (error) {
      toast.error("Failed to update cart");
      console.error("Update quantity error:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId, productName) => {
    try {
      setUpdatingItems(prev => new Set([...prev, productId]));
      const updatedItems = await cartService.removeItem(productId);
      setCartItems(updatedItems);
      toast.success(`${productName} removed from cart`);
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Remove item error:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 100 ? 0 : 9.99;
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    return subtotal + shipping + tax;
  };

  const formatPrice = (price, discountPrice) => {
    if (discountPrice) {
      return (
        <div className="text-right">
          <div className="font-semibold text-accent">${discountPrice}</div>
          <div className="text-sm text-gray-400 line-through">${price}</div>
        </div>
      );
    }
    return <div className="font-semibold text-primary">${price}</div>;
  };

  const getLensTypeLabel = (lensType) => {
    switch (lensType) {
      case "blue-light":
        return "Blue Light";
      case "prescription":
        return "Prescription";
      default:
        return "Standard";
    }
  };

  const getLensTypePrice = (lensType) => {
    switch (lensType) {
      case "blue-light":
        return 25;
      case "prescription":
        return 50;
      default:
        return 0;
    }
  };

  if (loading) {
    return <Loading type="cart" />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadCart}
        type="cart"
      />
    );
  }

  if (cartItems.length === 0) {
    return <Empty type="cart" />;
  }

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary font-display mb-2">
            Shopping Cart
          </h1>
          <p className="text-secondary">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.selectedLensType}`}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex space-x-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={`${item.product.brand} ${item.product.model}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-primary">
                          {item.product.brand} {item.product.model}
                        </h3>
                        <p className="text-sm text-secondary">
                          {item.product.frameShape} • {item.product.frameColor}
                        </p>
                        <p className="text-sm text-secondary">
                          Lens: {getLensTypeLabel(item.selectedLensType)}
                          {getLensTypePrice(item.selectedLensType) > 0 && 
                            ` (+$${getLensTypePrice(item.selectedLensType)})`
                          }
                        </p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        {formatPrice(
                          item.product.price + getLensTypePrice(item.selectedLensType),
                          item.product.discountPrice ? 
                            item.product.discountPrice + getLensTypePrice(item.selectedLensType) : 
                            null
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                            className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                          >
                            <ApperIcon name="Minus" size={16} />
                          </button>
                          <span className="px-4 py-2 font-medium text-primary min-w-16 text-center">
                            {updatingItems.has(item.productId) ? (
                              <ApperIcon name="Loader2" size={16} className="animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={updatingItems.has(item.productId)}
                            className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                          >
                            <ApperIcon name="Plus" size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, `${item.product.brand} ${item.product.model}`)}
                          disabled={updatingItems.has(item.productId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          ${(
                            ((item.product.discountPrice || item.product.price) + 
                             getLensTypePrice(item.selectedLensType)) * item.quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-semibold text-primary font-display mb-6">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-secondary">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-success font-medium">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-secondary">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 100 && (
                  <div className="bg-accent/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-accent font-medium">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                  className="w-full"
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
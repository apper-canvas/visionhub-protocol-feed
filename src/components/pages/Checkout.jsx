import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import cartService from "@/services/api/cartService";
import orderService from "@/services/api/orderService";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingOrder, setProcessingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States"
  });

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: ""
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      const items = await cartService.getAll();
      
      if (items.length === 0) {
        navigate("/cart");
        return;
      }
      
      setCartItems(items);
    } catch (err) {
      setError(err.message || "Failed to load cart");
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
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
    return subtotal * 0.08;
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      // Validate shipping address
      if (!shippingAddress.firstName.trim()) errors.firstName = "First name is required";
      if (!shippingAddress.lastName.trim()) errors.lastName = "Last name is required";
      if (!shippingAddress.address.trim()) errors.address = "Address is required";
      if (!shippingAddress.city.trim()) errors.city = "City is required";
      if (!shippingAddress.state.trim()) errors.state = "State is required";
      if (!shippingAddress.zipCode.trim()) errors.zipCode = "ZIP code is required";
    }
    
    if (step === 2) {
      // Validate contact info
      if (!contactInfo.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
        errors.email = "Please enter a valid email address";
      }
      if (!contactInfo.phone.trim()) errors.phone = "Phone number is required";
    }
    
    if (step === 3) {
      // Validate payment info
      if (!paymentInfo.nameOnCard.trim()) errors.nameOnCard = "Name on card is required";
      if (!paymentInfo.cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ""))) {
        errors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (!paymentInfo.expiryDate.trim()) {
        errors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) {
        errors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }
      if (!paymentInfo.cvv.trim()) {
        errors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
        errors.cvv = "Please enter a valid CVV";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(3)) return;
    
    try {
      setProcessingOrder(true);
      
      const orderDetails = {
        shippingAddress,
        contactInfo
      };
      
      const order = await orderService.create(orderDetails);
      
      toast.success("Order placed successfully!");
      navigate("/", { 
        state: { 
          orderSuccess: true, 
          orderNumber: order.Id 
        }
      });
      
    } catch (error) {
      toast.error("Failed to process order. Please try again.");
      console.error("Order processing error:", error);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === "shipping") {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    } else if (section === "contact") {
      setContactInfo(prev => ({ ...prev, [field]: value }));
    } else if (section === "payment") {
      setPaymentInfo(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
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

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const total = subtotal + shipping + tax;

  const steps = [
    { number: 1, title: "Shipping Address", icon: "MapPin" },
    { number: 2, title: "Contact Info", icon: "User" },
    { number: 3, title: "Payment", icon: "CreditCard" },
    { number: 4, title: "Review", icon: "CheckCircle" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary font-display mb-2">
            Checkout
          </h1>
          <p className="text-secondary">
            Complete your order in {steps.length} easy steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= step.number
                    ? "border-accent bg-accent text-white"
                    : currentStep === step.number
                    ? "border-accent text-accent"
                    : "border-gray-300 text-gray-400"
                }`}>
                  {currentStep > step.number ? (
                    <ApperIcon name="Check" size={20} />
                  ) : (
                    <ApperIcon name={step.icon} size={20} />
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`font-medium ${
                    currentStep >= step.number ? "text-accent" : "text-gray-400"
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-accent" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary font-display">
                    Shipping Address
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        First Name
                      </label>
                      <Input
                        value={shippingAddress.firstName}
                        onChange={(e) => handleInputChange("shipping", "firstName", e.target.value)}
                        error={formErrors.firstName}
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Last Name
                      </label>
                      <Input
                        value={shippingAddress.lastName}
                        onChange={(e) => handleInputChange("shipping", "lastName", e.target.value)}
                        error={formErrors.lastName}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Address
                    </label>
                    <Input
                      value={shippingAddress.address}
                      onChange={(e) => handleInputChange("shipping", "address", e.target.value)}
                      error={formErrors.address}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        City
                      </label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange("shipping", "city", e.target.value)}
                        error={formErrors.city}
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        State
                      </label>
                      <Input
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange("shipping", "state", e.target.value)}
                        error={formErrors.state}
                        placeholder="State"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        ZIP Code
                      </label>
                      <Input
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleInputChange("shipping", "zipCode", e.target.value)}
                        error={formErrors.zipCode}
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary font-display">
                    Contact Information
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                      error={formErrors.email}
                      placeholder="Enter your email address"
                      icon="Mail"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handleInputChange("contact", "phone", e.target.value)}
                      error={formErrors.phone}
                      placeholder="Enter your phone number"
                      icon="Phone"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Payment Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary font-display">
                    Payment Information
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Name on Card
                    </label>
                    <Input
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => handleInputChange("payment", "nameOnCard", e.target.value)}
                      error={formErrors.nameOnCard}
                      placeholder="Enter name as it appears on card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Card Number
                    </label>
                    <Input
                      value={paymentInfo.cardNumber}
                      onChange={(e) => handleInputChange("payment", "cardNumber", formatCardNumber(e.target.value))}
                      error={formErrors.cardNumber}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      icon="CreditCard"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Expiry Date
                      </label>
                      <Input
                        value={paymentInfo.expiryDate}
                        onChange={(e) => handleInputChange("payment", "expiryDate", formatExpiryDate(e.target.value))}
                        error={formErrors.expiryDate}
                        placeholder="MM/YY"
                        maxLength="5"
                        icon="Calendar"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        CVV
                      </label>
                      <Input
                        value={paymentInfo.cvv}
                        onChange={(e) => handleInputChange("payment", "cvv", e.target.value.replace(/\D/g, ""))}
                        error={formErrors.cvv}
                        placeholder="123"
                        maxLength="4"
                        icon="Lock"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary font-display">
                    Review Your Order
                  </h2>
                  
                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-primary">Order Items</h3>
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium">{item.product.brand} {item.product.model}</span>
                          <span className="text-secondary text-sm ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-medium">
                          ${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address Review */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-primary">Shipping Address</h3>
                    <div className="text-secondary text-sm">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.address}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    </div>
                  </div>

                  {/* Contact Info Review */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-primary">Contact Information</h3>
                    <div className="text-secondary text-sm">
                      <p>{contactInfo.email}</p>
                      <p>{contactInfo.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                {currentStep > 1 ? (
                  <Button
                    variant="secondary"
                    onClick={prevStep}
                    icon="ChevronLeft"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button
                    variant="primary"
                    onClick={nextStep}
                    icon="ChevronRight"
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmitOrder}
                    loading={processingOrder}
                    icon="CreditCard"
                  >
                    Place Order
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-semibold text-primary font-display mb-6">
                Order Summary
              </h3>

              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex space-x-3">
                      <img
                        src={item.product.images[0]}
                        alt={`${item.product.brand} ${item.product.model}`}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {item.product.brand} {item.product.model}
                        </p>
                        <p className="text-xs text-secondary">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-sm text-secondary">
                      + {cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
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

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold text-primary">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
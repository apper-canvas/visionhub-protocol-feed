import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import cartService from "@/services/api/cartService";
import { useAuth } from "@/hooks/useAuth";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isAuthenticated, user } = useSelector(state => state.user || {});

  const loadCartCount = async () => {
    try {
      const count = await cartService.getItemCount();
      setCartCount(count);
    } catch (error) {
      console.error("Error loading cart count:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, []);

  // Update cart count when location changes (for when items are added)
  useEffect(() => {
    loadCartCount();
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navigationLinks = [
    { label: "Home", path: "/" },
    { label: "Eyeglasses", path: "/?category=eyeglasses" },
    { label: "Sunglasses", path: "/?category=sunglasses" },
    { label: "Virtual Try-On", path: "/virtual-try-on" }
  ];

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/" && !location.search;
    }
    if (path.includes("category=eyeglasses")) {
      return location.search.includes("category=eyeglasses");
    }
    if (path.includes("category=sunglasses")) {
      return location.search.includes("category=sunglasses");
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-accent to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-200">
              <ApperIcon name="Glasses" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary font-display">VisionHub</h1>
              <p className="text-xs text-secondary -mt-1">Premium Eyewear</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:text-accent hover:bg-accent/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Virtual Try-On - Mobile Hidden */}
            <Link
              to="/virtual-try-on"
              className="hidden xl:flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-orange-600 text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <ApperIcon name="Sparkles" size={16} />
              <span className="font-medium">Virtual Try-On</span>
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 text-secondary hover:text-accent rounded-lg hover:bg-accent/5 transition-all duration-200 transform hover:scale-105"
            >
              <ApperIcon name="ShoppingBag" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-accent to-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-secondary">
                  Welcome, {user?.firstName || 'User'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-secondary hover:text-accent rounded-lg hover:bg-accent/5 transition-colors duration-200"
            >
              <ApperIcon name={isMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="px-4 py-4 space-y-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:text-accent hover:bg-accent/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Authentication */}
            <div className="pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-secondary">
                    Welcome, {user?.firstName || 'User'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
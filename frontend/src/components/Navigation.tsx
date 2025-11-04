import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  User,
  LogOut,
  Search,
  Calendar
} from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import RoleNavigation from "./RoleNavigation";
import UserDropdown from "./UserDropdown";
import VendorDropdown from "./VendorDropdown";
import logo from "../assets/logo.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Calculate search box width based on user state and screen size
  const getSearchBoxWidth = () => {
    if (user) {
      // When user is logged in, more items in navbar, so smaller search box
      return 'w-48 sm:w-56 xl:w-60';
    } else {
      // When no user, fewer items, so larger search box
      return 'w-64 sm:w-72 xl:w-80';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation when landing on the home page
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.substring(1); // Remove the # symbol
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure the page is rendered
    }
  }, [location]);

  const handleLogout = async () => {
    await logout();
  };

  const scrollToSection = (sectionId: string) => {
    // If we're not on the landing page, navigate to it first
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setIsOpen(false);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If element not found, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Main Navigation */}
      <nav className={`w-full px-4 lg:px-8 h-20 flex items-center transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-[#f8d7da]/30' 
          : 'bg-[#fdf6f0]/95 backdrop-blur-sm'
      }`}>
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Home Bonzenga Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-[#f8d7da] shadow-md"
            />
            <div>
              <h1 className="text-xl font-serif font-bold text-[#4e342e]">HOME BONZENGA</h1>
              <p className="text-xs text-[#6d4c41] leading-none font-sans">Premium Beauty Services</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center mx-8">
          {user ? (
            <RoleNavigation />
          ) : (
            <>
              <button 
                onClick={() => scrollToSection('home')}
                className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
              >
                {t('nav.home')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
              >
                {t('nav.services')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
              >
                {t('nav.howItWorks')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </>
          )}
        </div>

        {/* Desktop Actions - Right Side */}
        <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5 font-bold drop-shadow-sm stroke-2" />
              <Input
                type="text"
                placeholder={user ? "Search..." : "Search services..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-12 pr-4 h-10 text-sm border-[#f8d7da]/50 focus:border-[#4e342e] rounded-lg font-sans bg-white shadow-sm ${getSearchBoxWidth()}`}
              />
            </div>
          </form>
          
          {/* Language Toggle */}
          <div className="flex items-center">
            <LanguageToggle />
          </div>
          
          {user ? (
            <div className="flex items-center space-x-2 pl-3 border-l border-[#f8d7da]/50">
              {user.role === 'VENDOR' ? (
                <VendorDropdown vendorName={user.firstName} />
              ) : (
                <UserDropdown userName={user.firstName} />
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#4e342e] hover:text-[#6d4c41] hover:bg-[#f8d7da]/20 font-medium font-sans"
                >
                  {t('navigation.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm" 
                  className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 font-sans"
                >
                  {t('nav.signup')}
                </Button>
              </Link>
            </div>
          )}

        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden flex items-center space-x-3">
          {/* Mobile Search Box */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4 font-bold drop-shadow-sm stroke-2" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 h-8 text-xs border-[#f8d7da]/50 focus:border-[#4e342e] rounded-lg font-sans bg-white shadow-sm ${
                  user ? 'w-40' : 'w-48'
                }`}
              />
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-[#f8d7da]/20 hover:bg-[#f8d7da]/30 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5 text-[#4e342e]" /> : <Menu className="w-5 h-5 text-[#4e342e]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#fdf6f0]/95 backdrop-blur-md shadow-xl border-b border-[#f8d7da]/30 lg:hidden">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Search Box */}
            <div className="mb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5 font-bold drop-shadow-sm stroke-2" />
                  <Input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 h-12 w-full text-sm border-[#f8d7da]/50 focus:border-[#4e342e] rounded-lg font-sans bg-white shadow-sm"
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-3">
              <button 
                onClick={() => scrollToSection('home')}
                className="block w-full py-3 text-left text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium border-b border-[#f8d7da]/20 font-sans"
              >
                {t('nav.home')}
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="block w-full py-3 text-left text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium border-b border-[#f8d7da]/20 font-sans"
              >
                {t('nav.services')}
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full py-3 text-left text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium border-b border-[#f8d7da]/20 font-sans"
              >
                {t('nav.howItWorks')}
              </button>
              
              {/* Mobile Language Toggle */}
              <div className="py-3 border-t border-[#f8d7da]/20">
                <LanguageToggle />
              </div>
            </div>

            {/* Mobile User Actions */}
            {user ? (
              <div className="pt-4 border-t border-[#f8d7da]/30 space-y-3">
                <RoleNavigation isMobile={true} />
                
                <div className="pt-3 border-t border-[#f8d7da]/30">
                  <div className="px-2 mb-3">
                    {user.role === 'VENDOR' ? (
                      <VendorDropdown vendorName={user.firstName} />
                    ) : (
                      <UserDropdown userName={user.firstName} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-[#f8d7da]/30 space-y-3">
                <Link to="/login" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full py-3 border-[#f8d7da]/50 text-[#4e342e] hover:bg-[#f8d7da]/20 font-sans"
                  >
                    {t('navigation.login')}
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full py-3 bg-[#4e342e] hover:bg-[#3b2c26] text-white rounded-xl shadow-lg font-sans">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;

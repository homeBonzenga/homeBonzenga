import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Calendar,
  Settings,
  LogOut,
  Bell,
  ShoppingBag,
  Heart
} from 'lucide-react';

interface CustomerNavigationProps {
  isScrolled?: boolean;
}

const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ isScrolled = false }) => {
  const { user, logout } = useSupabaseAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className={`w-full px-4 lg:px-8 h-20 flex items-center justify-between transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-[#f8d7da]/30' 
        : 'bg-[#fdf6f0]/95 backdrop-blur-sm'
    }`}>
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#4e342e] to-[#6d4c41] flex items-center justify-center">
            <span className="text-white font-bold text-lg">HB</span>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#4e342e]">HOME BONZENGA</h1>
            <p className="text-xs text-[#6d4c41] leading-none font-sans">Premium Beauty Services</p>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-8">
        <Link
          to="/at-home-services"
          className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
        >
          {t('nav.atHomeServices')}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link
          to="/salon-visit"
          className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
        >
          {t('nav.salonVisit')}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link
          to="/customer"
          className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
        >
          {t('nav.dashboard')}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
        </Link>
      </div>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5 text-[#4e342e]" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
            3
          </Badge>
        </Button>

        {/* Account Dropdown */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-[#f8d7da]/20">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                <AvatarFallback className="bg-[#4e342e] text-white text-sm">
                  {getInitials(user?.firstName || '', user?.lastName || '')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-[#4e342e]">
                  Hello, {user?.firstName}
                </p>
                <p className="text-xs text-[#6d4c41]">Account & Lists</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border border-gray-200">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/profile" className="flex items-center cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/bookings" className="flex items-center cursor-pointer">
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/profile/edit" className="flex items-center cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Manage Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link to="/customer/wishlist" className="flex items-center cursor-pointer">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/orders" className="flex items-center cursor-pointer">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Order History
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5 text-[#4e342e]" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs bg-red-500">
            3
          </Badge>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                <AvatarFallback className="bg-[#4e342e] text-white text-sm">
                  {getInitials(user?.firstName || '', user?.lastName || '')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <DropdownMenuItem asChild>
              <Link to="/customer" className="flex items-center cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/profile" className="flex items-center cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/bookings" className="flex items-center cursor-pointer">
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/customer/profile/edit" className="flex items-center cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Manage Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default CustomerNavigation;

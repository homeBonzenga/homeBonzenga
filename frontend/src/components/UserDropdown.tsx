import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useTranslation } from 'react-i18next';
import { ChevronDown, User, LogOut, Calendar } from 'lucide-react';

interface UserDropdownProps {
  userName: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleManageAccount = () => {
    // Navigate to the appropriate profile page based on user role
    const profilePath = `/${user?.role?.toLowerCase() || 'customer'}/profile`;
    navigate(profilePath);
    setIsOpen(false);
  };

  const handleAppointments = () => {
    // Navigate to the appropriate appointments/booking page based on user role
    let path = `/${user?.role?.toLowerCase() || 'customer'}/bookings`;
    if (user?.role === 'VENDOR') {
      path = '/vendor/appointments';
    } else if (user?.role === 'MANAGER') {
      path = '/manager/appointments';
    }
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-[#6d4c41] font-medium font-sans hover:text-[#4e342e] transition-colors"
      >
        <span>{userName}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#f8d7da]/30 py-2 z-50">
          {/* Show Appointments/Booking Management and Manage Account only for non-admin roles */}
          {user?.role !== 'ADMIN' && (
            <>
              <button
                onClick={handleAppointments}
                className="flex items-center w-full px-4 py-3 text-sm text-[#4e342e] hover:bg-[#f8d7da]/20 transition-colors font-medium font-sans"
              >
                <Calendar className="w-4 h-4 mr-3" />
                {user?.role === 'MANAGER' ? 'Booking Management' : 'Appointments'}
              </button>
              {user?.role === 'MANAGER' && (
                <button
                  onClick={() => { navigate('/manager/at-home-appointments'); setIsOpen(false); }}
                  className="flex items-center w-full px-4 py-3 text-sm text-[#4e342e] hover:bg-[#f8d7da]/20 transition-colors font-medium font-sans"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  At-Home Appointments
                </button>
              )}
              <button
                onClick={handleManageAccount}
                className="flex items-center w-full px-4 py-3 text-sm text-[#4e342e] hover:bg-[#f8d7da]/20 transition-colors font-medium font-sans"
              >
                <User className="w-4 h-4 mr-3" />
                Manage Account
              </button>
            </>
          )}
          {/* Logout button for all roles */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-[#4e342e] hover:bg-[#f8d7da]/20 transition-colors font-medium font-sans"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;

import React from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useTranslation } from 'react-i18next';
import {
  Home,
  Calendar,
  Users,
  Building,
  Settings,
  LogOut,
  Package,
  UserCheck,
  BarChart3,
  Scissors,
  Sparkles,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';

interface RoleNavigationProps {
  isMobile?: boolean;
}

const RoleNavigation: React.FC<RoleNavigationProps> = ({ isMobile = false }) => {
  const { user, logout } = useSupabaseAuth();
  const { t } = useTranslation();

  if (!user) return null;


  const dashboardLinks = {
    CUSTOMER: [
      { path: '/', label: t('nav.home'), icon: Home },
      { path: '/at-home-services', label: t('nav.atHomeServices'), icon: Home },
      { path: '/salon-visit', label: t('nav.salonVisit'), icon: Building },
      { path: '/customer', label: t('nav.dashboard'), icon: UserIcon },
    ],
    VENDOR: [
      { path: '/', label: t('nav.home'), icon: Home },
      { path: '/vendor', label: t('nav.dashboard'), icon: Building },
      { path: '/vendor/appointments', label: t('nav.appointments'), icon: Calendar },
      { path: '/vendor/services', label: t('nav.services'), icon: Scissors },
    ],
    MANAGER: [
      { path: '/manager', label: t('nav.dashboard'), icon: UserCheck },
      { path: '/manager/vendors', label: t('nav.vendors'), icon: Building },
      { path: '/manager/pending-vendors', label: t('nav.pendingVendors'), icon: AlertCircle },
      { path: '/manager/appointments', label: t('nav.appointments'), icon: Calendar },
      { path: '/manager/reports', label: t('nav.reports'), icon: BarChart3 },
    ],
    ADMIN: [
      { path: '/admin', label: t('nav.dashboard'), icon: Settings },
      { path: '/admin/users', label: t('nav.users'), icon: Users },
      { path: '/admin/vendors', label: t('nav.vendors'), icon: Building },
      { path: '/admin/managers', label: t('nav.managers'), icon: UserCheck },
    ],
  };

  const currentRoleLinks = dashboardLinks[user.role as keyof typeof dashboardLinks] || [];

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Role-specific dashboard links */}
        {currentRoleLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="flex items-center w-full py-3 px-4 text-[#4e342e] hover:bg-[#f8d7da]/20 rounded-lg transition-colors font-medium font-sans"
          >
            <link.icon className="w-4 h-4 mr-2" />
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {/* Role-specific dashboard links */}
      {currentRoleLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="text-[#4e342e] hover:text-[#6d4c41] transition-colors font-medium text-sm relative group font-sans"
        >
          {link.label}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f8d7da] transition-all duration-300 group-hover:w-full"></span>
        </Link>
      ))}
    </nav>
  );
};

export default RoleNavigation;

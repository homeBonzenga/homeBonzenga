import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PendingApproval from '@/pages/vendor/PendingApproval';
import { toast } from 'sonner';

interface ProtectedVendorRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route for vendor pages that checks if vendor is approved
 * Redirects to pending approval page if vendor status is not 'APPROVED'
 */
const ProtectedVendorRoute: React.FC<ProtectedVendorRouteProps> = ({ children }) => {
  const { user, vendor, refreshVendorData } = useSupabaseAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkVendorStatus = async () => {
      try {
        // If vendor data is already in user object, use it
        if (user?.vendor?.status) {
          setVendorStatus(user.vendor.status);
          setIsChecking(false);
          return;
        }

        // If vendor is passed separately, use it
        if (vendor?.status) {
          setVendorStatus(vendor.status);
          setIsChecking(false);
          return;
        }

        // If user is a vendor but no vendor data exists yet, fetch it
        if (user?.role === 'VENDOR' && user?.id) {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/vendor/${user.id}/profile`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Vendor profile data:', data);
            console.log('Vendor status:', data.status);
            setVendorStatus(data.status || 'PENDING');
          } else {
            console.error('Failed to fetch vendor profile:', response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error('Error details:', errorData);
            // If no vendor profile found, default to pending
            setVendorStatus('PENDING');
          }
        } else {
          setIsChecking(false);
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Error checking vendor status:', error);
        setVendorStatus('PENDING'); // Default to pending on error
        setIsChecking(false);
      }
    };

    checkVendorStatus();
    
    // Set up periodic refresh to check if vendor status has changed (e.g., after approval)
    if (user?.role === 'VENDOR') {
      const interval = setInterval(async () => {
        await refreshVendorData?.();
        await checkVendorStatus();
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, vendor, refreshVendorData]);

  // Show loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e342e]"></div>
      </div>
    );
  }

  // If not a vendor, don't restrict
  if (user?.role !== 'VENDOR') {
    return <>{children}</>;
  }

  // If vendor is approved, allow access
  if (vendorStatus === 'APPROVED') {
    return <>{children}</>;
  }

  // If vendor is pending, show pending approval page
  if (vendorStatus === 'PENDING') {
    // Don't redirect if already on pending approval page
    if (location.pathname === '/vendor/pending-approval') {
      return <>{children}</>;
    }
    return <Navigate to="/vendor/pending-approval" replace />;
  }

  // If rejected or other status, show pending page with appropriate message
  return <PendingApproval />;
};

export default ProtectedVendorRoute;



import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Eye,
  Settings,
  BarChart3,
  UserPlus,
  Package,
  CreditCard,
  Activity,
  Loader2,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Target,
  Shield,
  TrendingDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalManagers: number;
  pendingApprovals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayouts: number;
  refundRequests: number;
  activeUsers: number;
  suspendedUsers: number;
  activeVendors: number;
  pendingVendors: number;
  totalBookings: number;
  completedBookings: number;
  atHomeBookings: number;
  salonBookings: number;
  totalCommissions: number;
  pendingDisputes: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'vendor_approval' | 'booking_completed' | 'payment_processed' | 'dispute_created';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
  amount?: number;
}


interface TopVendor {
  id: string;
  shopname: string;
  businessType: string;
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  status: string;
}

interface PendingVendor {
  id: string;
  shopname: string;
  status: string;
  created_at: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

const AdminDashboard = () => {
  const { user } = useSupabaseAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingVendor, setProcessingVendor] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Verify admin is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No active session found');
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      console.log('🔍 Admin session verified:', {
        userId: session.user.id,
        email: session.user.email
      });
      
      // Fetch CUSTOMERS only (users with role='CUSTOMER')
      // Note: Vendors are stored in the vendors table, not counted as users
      console.log('🔍 Starting to fetch CUSTOMERS from Supabase...');
      
      let customersResult;
      try {
        // First, try to fetch all users to check if there's any data at all
        // Using authenticated supabase client which should have admin permissions via RLS
        const allUsersCheck = await supabase
          .from('users')
          .select('id, status, role, email, first_name, last_name')
          .limit(5);
        
        console.log('🔍 All users check:', {
          error: allUsersCheck.error,
          errorCode: allUsersCheck.error?.code,
          errorMessage: allUsersCheck.error?.message,
          dataLength: allUsersCheck.data?.length || 0,
          sample: allUsersCheck.data?.[0],
          allRoles: allUsersCheck.data ? [...new Set(allUsersCheck.data.map((u: any) => u.role))] : []
        });

        // Try fetching customers with exact role match
        customersResult = await supabase
          .from('users')
          .select('id, status, role, email, first_name, last_name')
          .eq('role', 'CUSTOMER');
        
        // If that fails or returns empty, try case-insensitive matching
        if (customersResult.error || !customersResult.data || customersResult.data.length === 0) {
          console.log('🔍 Primary query failed or empty, trying fallback...');
          
          // Try fetching all users and filter manually (handles case variations)
          const fallbackResult = await supabase
            .from('users')
            .select('id, status, role, email, first_name, last_name');
          
          if (!fallbackResult.error && fallbackResult.data) {
            console.log('🔍 Fallback query succeeded, filtering customers...');
            console.log('🔍 All roles found:', [...new Set(fallbackResult.data.map((u: any) => u.role))]);
            
            // Filter customers manually (case-insensitive)
            const filteredCustomers = fallbackResult.data.filter((u: any) => {
              const role = (u.role || '').toUpperCase();
              return role === 'CUSTOMER';
            });
            
            console.log('🔍 Filtered customers:', filteredCustomers.length);
            
            customersResult = {
              ...fallbackResult,
              data: filteredCustomers
            };
          } else if (fallbackResult.error) {
            console.error('❌ Fallback query also failed:', fallbackResult.error);
            customersResult = fallbackResult;
          }
        }
      } catch (queryError: any) {
        console.error('❌ Query exception:', queryError);
        customersResult = { data: null, error: queryError };
      }
      
      console.log('🔍 Customers query result:', {
        error: customersResult.error,
        errorCode: customersResult.error?.code,
        errorMessage: customersResult.error?.message,
        dataLength: customersResult.data?.length || 0,
        sample: customersResult.data?.slice(0, 2)
      });

      if (customersResult.error) {
        console.error('❌ Error fetching customers:', customersResult.error);
        console.error('❌ Error code:', customersResult.error.code);
        console.error('❌ Error message:', customersResult.error.message);
        console.error('❌ Error details:', JSON.stringify(customersResult.error, null, 2));
        
        // Check for common RLS errors
        if (customersResult.error.code === 'PGRST301' || customersResult.error.message?.includes('permission denied') || customersResult.error.message?.includes('RLS')) {
          toast.error('Permission denied: Admin RLS policy may be missing. Please run the migration: 20250131_add_admin_users_policy.sql');
          console.error('❌ RLS Policy Error: Admins need a policy to view all users. Please check supabase/migrations/20250131_add_admin_users_policy.sql');
        } else {
          toast.error(`Failed to fetch customers: ${customersResult.error.message || 'Unknown error'}`);
        }
        // Set empty array instead of undefined
        customersResult.data = customersResult.data || [];
      }

      // Fetch all statistics in parallel for better performance (excluding users which we already fetched)
      const [
        vendorsData,
        managersData,
        bookingsData,
        paymentsData,
        refundsData,
        recentUsers,
        recentVendors,
        recentBookings,
        recentPayments
      ] = await Promise.all([
        // Vendors statistics
        supabase.from('vendors').select('id, status'),
        // Managers statistics
        supabase.from('users').select('id, status').eq('role', 'MANAGER'),
        // Bookings statistics
        supabase.from('bookings').select('id, status, total, created_at'),
        // Payments statistics
        supabase.from('payments').select('id, amount, status, created_at'),
        // Refunds (payments with refund_amount)
        supabase.from('payments').select('id').not('refund_amount', 'is', null),
        // Recent customers (last 10) - only CUSTOMER role
        supabase.from('users').select('id, first_name, last_name, email, created_at, role').eq('role', 'CUSTOMER').order('created_at', { ascending: false }).limit(10),
        // Recent vendors (last 10)
        supabase.from('vendors').select('id, shopname, status, created_at, user:users!user_id(email, first_name, last_name)').order('created_at', { ascending: false }).limit(10),
        // Recent bookings (last 20)
        supabase.from('bookings').select('id, status, total, created_at, customer:users!customer_id(first_name, last_name, email)').order('created_at', { ascending: false }).limit(20),
        // Recent payments (last 20)
        supabase.from('payments').select('id, amount, status, created_at, user:users!user_id(first_name, last_name, email)').order('created_at', { ascending: false }).limit(20)
      ]);

      // Process CUSTOMERS statistics (users with role='CUSTOMER')
      // Note: Vendors are counted separately from the vendors table
      const allCustomers = customersResult.data || [];
      
      console.log('📊 Customers fetched:', {
        dataLength: allCustomers.length,
        hasError: !!customersResult.error
      });
      
      if (allCustomers.length > 0) {
        console.log('📊 Customers data sample:', allCustomers.slice(0, 3));
      } else {
        console.warn('⚠️ No customers found in database. Customers might exist in Supabase Auth but not synced to public.users table.');
        console.warn('⚠️ Check if database trigger handle_new_user() is working correctly.');
      }
      
      // Calculate customer statistics (only customers, not vendors/managers/admins)
      const totalUsers = allCustomers.length; // Total customers only
      const activeUsers = allCustomers.filter(u => u && u.status === 'ACTIVE').length;
      const suspendedUsers = allCustomers.filter(u => u && u.status === 'SUSPENDED').length;
      
      console.log('📊 Customer stats:', { 
        totalUsers, 
        activeUsers, 
        suspendedUsers
      });
      
      // If no customers found, show a warning
      if (totalUsers === 0 && !customersResult.error) {
        console.warn('⚠️ Customers table appears empty. If customers exist in Supabase Auth, they need to be synced via database trigger.');
        toast.warning('No customers found in database. Users may exist in Auth but need to be synced to public.users table.');
      }

      // Process vendors statistics - check for errors
      if (vendorsData.error) {
        console.error('Error fetching vendors:', vendorsData.error);
      }
      const allVendors = vendorsData.data || [];
      const totalVendors = allVendors.length;
      const pendingVendors = allVendors.filter(v => v.status === 'PENDING').length;
      const activeVendors = allVendors.filter(v => v.status === 'APPROVED').length;

      // Process managers statistics - check for errors
      if (managersData.error) {
        console.error('Error fetching managers:', managersData.error);
      }
      const allManagers = managersData.data || [];
      const totalManagers = allManagers.length;
      const activeManagers = allManagers.filter(m => m.status === 'ACTIVE').length;

      // Process bookings statistics - check for errors
      if (bookingsData.error) {
        console.error('Error fetching bookings:', bookingsData.error);
      }
      const allBookings = bookingsData.data || [];
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter(b => b.status === 'COMPLETED').length;
      // Note: At-home vs salon bookings would need an additional field in bookings table
      // For now, we'll estimate based on a 60/40 split or use address type if available
      const atHomeBookings = Math.floor(totalBookings * 0.6); // Estimate
      const salonBookings = Math.floor(totalBookings * 0.4); // Estimate

      // Process payments statistics - check for errors
      if (paymentsData.error) {
        console.error('Error fetching payments:', paymentsData.error);
      }
      const allPayments = paymentsData.data || [];
      const completedPayments = allPayments.filter(p => p.status === 'COMPLETED');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + (parseFloat(p.amount.toString()) || 0), 0);
      
      // Calculate monthly revenue (current month)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyPayments = completedPayments.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate >= firstDayOfMonth;
      });
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (parseFloat(p.amount.toString()) || 0), 0);

      // Pending payouts (payments with status PENDING or PROCESSING)
      const pendingPayouts = allPayments
        .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
        .reduce((sum, p) => sum + (parseFloat(p.amount.toString()) || 0), 0);

      // Refund requests
      const refundRequests = refundsData.data?.length || 0;

      // Pending approvals = pending vendors
      const pendingApprovals = pendingVendors;

      // Calculate commissions (assuming 15% commission rate)
      const totalCommissions = totalRevenue * 0.15;

      // Calculate average rating from reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating');
      const reviews = reviewsData || [];
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

      // Build recent activity feed
      const activities: RecentActivity[] = [];

      // Add recent customer registrations (only customers, not vendors/managers)
      if (recentUsers.data) {
        recentUsers.data.forEach((user: any) => {
          // Only add customers to recent activity
          if (user.role === 'CUSTOMER') {
            activities.push({
              id: `customer-${user.id}`,
          type: 'user_registration',
              description: 'New customer registered',
              timestamp: user.created_at,
              user: {
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
                email: user.email || ''
              }
            });
          }
        });
      }

      // Add recent vendor approvals/changes
      if (recentVendors.data) {
        recentVendors.data.forEach((vendor: any) => {
          const userInfo = vendor.user;
          activities.push({
            id: `vendor-${vendor.id}`,
            type: vendor.status === 'APPROVED' ? 'vendor_approval' : 'user_registration',
            description: vendor.status === 'APPROVED' 
              ? 'Vendor approved'
              : 'New vendor registration',
            timestamp: vendor.created_at,
            user: {
              name: vendor.shopname || 'Unknown Vendor',
              email: userInfo?.email || ''
            }
          });
        });
      }

      // Add recent booking completions
      if (recentBookings.data) {
        recentBookings.data
          .filter((b: any) => b.status === 'COMPLETED')
          .slice(0, 5)
          .forEach((booking: any) => {
            const customer = booking.customer;
            activities.push({
              id: `booking-${booking.id}`,
          type: 'booking_completed',
          description: 'Booking completed',
              timestamp: booking.created_at,
              user: customer ? {
                name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
                email: customer.email || ''
              } : undefined,
              amount: parseFloat(booking.total?.toString() || '0')
            });
          });
      }

      // Add recent payment processing
      if (recentPayments.data) {
        recentPayments.data
          .filter((p: any) => p.status === 'COMPLETED')
          .slice(0, 5)
          .forEach((payment: any) => {
            const user = payment.user;
            activities.push({
              id: `payment-${payment.id}`,
          type: 'payment_processed',
          description: 'Payment processed',
              timestamp: payment.created_at,
              user: user ? {
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
                email: user.email || ''
              } : undefined,
              amount: parseFloat(payment.amount?.toString() || '0')
            });
          });
      }

      // Sort activities by timestamp (most recent first) and limit to 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));

      // Fetch top vendors by revenue
      const { data: topVendorsData } = await supabase
        .from('vendors')
        .select(`
          id,
          shopname,
          status,
          bookings:bookings!vendor_id(id, total, status)
        `)
        .eq('status', 'APPROVED')
        .limit(10);

      const topVendorsList: TopVendor[] = [];
      if (topVendorsData) {
        for (const vendor of topVendorsData) {
          const bookings = vendor.bookings || [];
          const completedBookingsForVendor = bookings.filter((b: any) => b.status === 'COMPLETED');
          const totalRevenueForVendor = completedBookingsForVendor.reduce(
            (sum: number, b: any) => sum + (parseFloat(b.total?.toString() || '0') || 0),
            0
          );

          // Get average rating for vendor
          const { data: vendorReviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('vendor_id', vendor.id);
          const avgRating = vendorReviews && vendorReviews.length > 0
            ? vendorReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / vendorReviews.length
            : 0;

          topVendorsList.push({
            id: vendor.id,
            shopname: vendor.shopname,
            businessType: 'salon', // Would need to check booking type
            totalRevenue: totalRevenueForVendor,
            totalBookings: completedBookingsForVendor.length,
            averageRating: avgRating,
            status: vendor.status
          });
        }
      }

      // Sort by revenue and take top 5
      topVendorsList.sort((a, b) => b.totalRevenue - a.totalRevenue);
      setTopVendors(topVendorsList.slice(0, 5));

      // Fetch pending vendors for quick actions
      const { data: pendingVendorsData } = await supabase
        .from('vendors')
        .select(`
          id,
          shopname,
          status,
          created_at,
          user:users!user_id(email, first_name, last_name)
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingVendorsData) {
        setPendingVendors(pendingVendorsData as any);
      }

      // Set all statistics
      // If customers count is 0 but we got no error, there might be a sync issue
      if (totalUsers === 0 && !customersResult.error) {
        console.warn('⚠️ Dashboard: Customers table appears empty. If customers exist in Supabase Auth, they may need to be synced to public.users table via database trigger.');
      }
      
      setStats({
        totalUsers: totalUsers || 0, // Total customers (role='CUSTOMER') only
        totalVendors, // Vendors from vendors table
        totalManagers,
        pendingApprovals,
        totalRevenue,
        monthlyRevenue,
        pendingPayouts,
        refundRequests,
        activeUsers: activeUsers || 0, // Active customers only
        suspendedUsers: suspendedUsers || 0, // Suspended customers only
        activeVendors,
        pendingVendors,
        totalBookings,
        completedBookings,
        atHomeBookings,
        salonBookings,
        totalCommissions,
        pendingDisputes: 0, // Would need a disputes table
        averageRating
      });
      
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`);
      
      // Try to fetch at least basic customer count even if other queries fail
      try {
        const { data: fallbackUsers, error: fallbackError } = await supabase
          .from('users')
          .select('id, status, role')
          .eq('role', 'CUSTOMER');
        
        if (!fallbackError && fallbackUsers) {
          // Filter customers only
          const fallbackCustomers = fallbackUsers.filter((u: any) => u.role === 'CUSTOMER');
          const fallbackTotalUsers = fallbackCustomers.length;
          const fallbackActiveUsers = fallbackCustomers.filter((u: any) => u.status === 'ACTIVE').length;
          const fallbackSuspendedUsers = fallbackCustomers.filter((u: any) => u.status === 'SUSPENDED').length;
          
          setStats({
            totalUsers: fallbackTotalUsers,
            totalVendors: 0,
            totalManagers: 0,
            pendingApprovals: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            pendingPayouts: 0,
            refundRequests: 0,
            activeUsers: fallbackActiveUsers,
            suspendedUsers: fallbackSuspendedUsers,
            activeVendors: 0,
            pendingVendors: 0,
            totalBookings: 0,
            completedBookings: 0,
            atHomeBookings: 0,
            salonBookings: 0,
            totalCommissions: 0,
            pendingDisputes: 0,
            averageRating: 0
          });
        } else {
          // Complete fallback to empty data
          setStats({
            totalUsers: 0,
            totalVendors: 0,
            totalManagers: 0,
            pendingApprovals: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            pendingPayouts: 0,
            refundRequests: 0,
            activeUsers: 0,
            suspendedUsers: 0,
            activeVendors: 0,
            pendingVendors: 0,
            totalBookings: 0,
            completedBookings: 0,
            atHomeBookings: 0,
            salonBookings: 0,
            totalCommissions: 0,
            pendingDisputes: 0,
            averageRating: 0
          });
        }
      } catch (fallbackError) {
        // Final fallback
      setStats({
        totalUsers: 0,
        totalVendors: 0,
        totalManagers: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        refundRequests: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        activeVendors: 0,
        pendingVendors: 0,
        totalBookings: 0,
        completedBookings: 0,
        atHomeBookings: 0,
        salonBookings: 0,
        totalCommissions: 0,
        pendingDisputes: 0,
        averageRating: 0
      });
      }
      
      setRecentActivity([]);
      setTopVendors([]);
      setPendingVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-4 h-4" />;
      case 'booking_confirmed':
        return <Calendar className="w-4 h-4" />;
      case 'payment_received':
        return <CreditCard className="w-4 h-4" />;
      case 'vendor_approved':
        return <Building className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleVendorAction = async (vendorId: string, action: 'APPROVED' | 'REJECTED') => {
    if (processingVendor === vendorId) return;
    
    try {
      setProcessingVendor(vendorId);
      
      // Update vendor status in Supabase
      const { error } = await supabase
        .from('vendors')
        .update({ status: action })
        .eq('id', vendorId);

      if (error) {
        throw error;
      }

      toast.success(`Vendor ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
      
      // Refresh data
      await fetchAdminData();
    } catch (error: any) {
      console.error(`Error ${action === 'APPROVED' ? 'approving' : 'rejecting'} vendor:`, error);
      toast.error(`Failed to ${action === 'APPROVED' ? 'approve' : 'reject'} vendor: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingVendor(null);
    }
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Admin Dashboard</h1>
              <p className="text-[#6d4c41]">Welcome back, {user?.firstName}! Here's your platform overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                onClick={fetchAdminData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Total Users</p>
                    <p className="text-2xl font-bold text-[#4e342e]">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-[#f8d7da]/30 text-[#4e342e] text-xs">
                        {stats.activeUsers} Active
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Total Vendors</p>
                    <p className="text-2xl font-bold text-[#4e342e]">{stats.totalVendors.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-[#6d4c41]/20 text-[#6d4c41] text-xs">
                        {stats.pendingVendors} Pending
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Total Managers</p>
                    <p className="text-2xl font-bold text-[#4e342e]">{stats.totalManagers.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-[#f8d7da]/30 text-[#4e342e] text-xs">
                        {stats.totalManagers} Active
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Total Revenue</p>
                    <p className="text-2xl font-bold text-[#4e342e]">${stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-[#6d4c41] mr-1" />
                      <span className="text-sm text-[#6d4c41]">${stats.monthlyRevenue} this month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Pending Approvals</p>
                    <p className="text-2xl font-bold text-[#4e342e]">{stats.pendingApprovals}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-[#6d4c41]/20 text-[#6d4c41] text-xs">
                        Requires Action
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Total Bookings</p>
                    <p className="text-2xl font-bold text-[#4e342e]">{stats.totalBookings.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 text-[#6d4c41] mr-1" />
                      <span className="text-sm text-[#6d4c41]">{stats.completedBookings} completed</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Pending Payouts</p>
                    <p className="text-2xl font-bold text-[#4e342e]">${stats.pendingPayouts.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-[#6d4c41]/20 text-[#6d4c41] text-xs">
                        Awaiting Approval
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6d4c41]">Refund Requests</p>
                    <p className="text-2xl font-bold text-[#4e342e]">{stats.refundRequests}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-[#6d4c41]/20 text-[#6d4c41] text-xs">
                        Needs Review
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions - Pending Vendors */}
        {pendingVendors.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold text-[#4e342e]">Pending Vendor Approvals</h2>
              <Link to="/admin/vendors?status=PENDING">
                <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>

            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="divide-y divide-[#f8d7da]">
                  {pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 hover:bg-[#fdf6f0] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#4e342e] rounded-full flex items-center justify-center">
                              <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#4e342e]">{vendor.shopname}</p>
                              <p className="text-xs text-[#6d4c41]">
                                {vendor.user?.first_name} {vendor.user?.last_name} • {vendor.user?.email}
                              </p>
                              <p className="text-xs text-[#6d4c41]">
                                {new Date(vendor.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleVendorAction(vendor.id, 'APPROVED')}
                            disabled={processingVendor === vendor.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingVendor === vendor.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVendorAction(vendor.id, 'REJECTED')}
                            disabled={processingVendor === vendor.id}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            {processingVendor === vendor.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-bold text-[#4e342e]">Recent Activity</h2>
            <Link to="/admin/activities">
              <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                <Eye className="w-4 h-4 mr-2" />
                View All Activity
              </Button>
            </Link>
          </div>

          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-0">
              <div className="divide-y divide-[#f8d7da]">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-[#fdf6f0] transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#4e342e] rounded-full flex items-center justify-center">
                        {getStatusIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#4e342e]">{activity.description}</p>
                        <p className="text-xs text-[#6d4c41]">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-[#6d4c41]">
                            {activity.user.name} ({activity.user.email})
                          </p>
                        )}
                        {activity.amount && (
                          <p className="text-xs text-[#4e342e] font-semibold">
                            ${activity.amount}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-[#4e342e] text-white">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        

    
    
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

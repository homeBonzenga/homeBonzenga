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
  Sparkles,
  X,
  AlertTriangle,
  UserX,
  Phone,
  Mail
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
  type: 'user_registration' | 'vendor_approval' | 'booking_completed' | 'payment_processed' | 'dispute_created' | 'refund_processed' | 'manager_approval' | 'beautician_approval' | 'vendor_suspension' | 'user_suspension' | 'payment_failed' | 'booking_cancelled';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  vendor?: {
    name: string;
    businessName: string;
    email: string;
  };
  amount?: number;
  status?: 'success' | 'pending' | 'failed' | 'cancelled';
  bookingType?: string;
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
        setLoading(false);
        return;
      }
      
      console.log('✅ Admin session verified:', {
        userId: session.user.id,
        email: session.user.email
      });
      
      // Verify the user is actually an admin - use user from context if available, otherwise query
      let currentUser: any = null;
      
      // First, try to use user from context (already loaded)
      if (user && user.role) {
        currentUser = user;
        console.log('✅ Using user from context:', { role: user.role, id: user.id });
      } else {
        // Fallback: Try to query the user table
        // Use a more permissive query that should work with basic RLS (view own profile)
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, status')
            .eq('id', session.user.id)
            .maybeSingle(); // Use maybeSingle instead of single to avoid errors if not found
          
          if (userError) {
            console.warn('⚠️ Could not fetch user from database (this may be normal if RLS policies need migration):', {
              code: userError.code,
              message: userError.message
            });
            // Continue anyway - we'll verify admin status through the actual queries
          } else if (userData) {
            currentUser = userData;
            console.log('✅ User fetched from database:', { role: userData.role, id: userData.id });
          }
        } catch (queryError) {
          console.warn('⚠️ Error querying user table:', queryError);
          // Continue anyway - RLS might be blocking but we'll verify through actual queries
        }
      }
      
      // If we have user data, verify admin role
      if (currentUser && currentUser.role !== 'ADMIN') {
        console.error('❌ User is not an admin:', currentUser.role);
        toast.error('Access denied: Admin privileges required.');
        setLoading(false);
        return;
      }
      
      // If we couldn't verify admin status, log a warning but continue
      // The actual queries will fail if user is not admin (due to RLS)
      if (!currentUser) {
        console.warn('⚠️ Could not verify admin role from database. Continuing - RLS policies will enforce access.');
      } else {
        console.log('✅ Admin role verified:', {
          userId: currentUser.id,
          role: currentUser.role,
          status: currentUser.status
        });
      }
      
      // Fetch all statistics in parallel for better performance
      console.log('📊 Fetching dashboard statistics from Supabase...');
      
      const [
        allUsersData,
        vendorsData,
        bookingsData,
        paymentsData,
        refundsData,
        recentUsers,
        recentVendors,
        recentBookings,
        recentPayments,
        auditLogsData,
        bookingEventsData,
        refundedPaymentsData,
        failedPaymentsData,
        cancelledBookingsData,
        vendorStatusChangesData
      ] = await Promise.all([
        // Fetch ALL users (not filtered by role) - Total Users should count all users
        supabase.from('users').select('id, status, role, email, first_name, last_name, phone, created_at, updated_at'),
        // Vendors statistics - fetch all to calculate status-based counts
        supabase.from('vendors').select('id, status, shopname, user_id, created_at, updated_at'),
        // Bookings statistics - fetch all to calculate status-based counts
        supabase.from('bookings').select('id, status, total, created_at, customer_id, vendor_id'),
        // Payments statistics - fetch all to calculate revenue
        supabase.from('payments').select('id, amount, status, created_at, user_id, booking_id'),
        // Refunds (payments with refund_amount or status='REFUNDED')
        supabase.from('payments').select('id, amount, status').or('refund_amount.not.is.null,status.eq.REFUNDED').limit(100),
        // Recent users (last 10) - all roles
        supabase.from('users').select('id, first_name, last_name, email, created_at, role, status').order('created_at', { ascending: false }).limit(10),
        // Recent vendors (last 10)
        supabase.from('vendors').select('id, shopname, status, created_at, user_id').order('created_at', { ascending: false }).limit(10),
        // Recent bookings (last 20)
        supabase.from('bookings').select('id, status, total, created_at, customer_id, vendor_id').order('created_at', { ascending: false }).limit(20),
        // Recent payments (last 20)
        supabase.from('payments').select('id, amount, status, created_at, user_id, booking_id').order('created_at', { ascending: false }).limit(20),
        // Recent audit logs for activity feed
        supabase.from('audit_logs').select('id, user_id, action, resource, resource_id, old_data, new_data, created_at').order('created_at', { ascending: false }).limit(30),
        // Booking events for activity tracking
        supabase.from('booking_events').select('id, booking_id, type, data, created_at').order('created_at', { ascending: false }).limit(30),
        // Refunded payments
        supabase.from('payments').select('id, amount, status, refund_amount, refund_reason, refunded_at, user_id, booking_id, created_at').or('refund_amount.not.is.null,status.eq.REFUNDED').order('created_at', { ascending: false }).limit(20),
        // Failed payments
        supabase.from('payments').select('id, amount, status, user_id, booking_id, created_at').eq('status', 'FAILED').order('created_at', { ascending: false }).limit(20),
        // Cancelled bookings
        supabase.from('bookings').select('id, status, total, customer_id, vendor_id, booking_type, created_at, updated_at').eq('status', 'CANCELLED').order('updated_at', { ascending: false }).limit(20),
        // Vendor status changes (need to check updated_at vs created_at for status changes)
        supabase.from('vendors').select('id, shopname, status, user_id, created_at, updated_at').order('updated_at', { ascending: false }).limit(20)
      ]);

      // Handle errors and log them with detailed information
      const errors: string[] = [];
      
      if (allUsersData.error) {
        console.error('❌ Error fetching users:', {
          code: allUsersData.error.code,
          message: allUsersData.error.message,
          details: allUsersData.error.details,
          hint: allUsersData.error.hint
        });
        if (allUsersData.error.code === 'PGRST301' || allUsersData.error.message?.includes('permission denied') || allUsersData.error.message?.includes('RLS')) {
          errors.push('RLS Policy Error: Admin may not have permission to view users. Please run the admin RLS migration.');
        } else {
          errors.push(`Failed to fetch users: ${allUsersData.error.message}`);
        }
      }
      if (vendorsData.error) {
        console.error('❌ Error fetching vendors:', vendorsData.error);
        if (vendorsData.error.code === 'PGRST301' || vendorsData.error.message?.includes('permission denied') || vendorsData.error.message?.includes('RLS')) {
          errors.push('RLS Policy Error: Admin may not have permission to view vendors.');
        }
      }
      if (bookingsData.error) {
        console.error('❌ Error fetching bookings:', bookingsData.error);
      }
      if (paymentsData.error) {
        console.error('❌ Error fetching payments:', paymentsData.error);
      }
      
      // Show errors if any
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }
      
      // Log successful data fetches
      console.log('📊 Query Results:', {
        users: { data: allUsersData.data?.length || 0, error: !!allUsersData.error },
        vendors: { data: vendorsData.data?.length || 0, error: !!vendorsData.error },
        bookings: { data: bookingsData.data?.length || 0, error: !!bookingsData.error },
        payments: { data: paymentsData.data?.length || 0, error: !!paymentsData.error }
      });

      // Process Users statistics - ALL USERS (not just CUSTOMER role)
      const allUsers = allUsersData.data || [];
      const totalUsers = allUsers.length; // Total Users = ALL users in the table
      
      // Filter by role for specific counts
      const customerUsers = allUsers.filter((u: any) => u?.role === 'CUSTOMER');
      const managerUsers = allUsers.filter((u: any) => u?.role === 'MANAGER');
      const vendorUsers = allUsers.filter((u: any) => u?.role === 'VENDOR');
      const adminUsers = allUsers.filter((u: any) => u?.role === 'ADMIN');
      
      // Count active users (all roles)
      const activeUsers = allUsers.filter((u: any) => u?.status === 'ACTIVE').length;
      const suspendedUsers = allUsers.filter((u: any) => u?.status === 'SUSPENDED').length;
      
      // Total Managers = users with role='MANAGER'
      const totalManagers = managerUsers.length;
      const activeManagers = managerUsers.filter((m: any) => m?.status === 'ACTIVE').length;
      
      console.log('📊 Users stats:', { 
        totalUsers, 
        customers: customerUsers.length,
        managers: totalManagers,
        vendors: vendorUsers.length,
        admins: adminUsers.length,
        activeUsers, 
        suspendedUsers
      });

      // Process Vendors statistics
      const allVendors = vendorsData.data || [];
      const totalVendors = allVendors.length;
      const pendingVendors = allVendors.filter((v: any) => v?.status === 'PENDING').length;
      const activeVendors = allVendors.filter((v: any) => v?.status === 'APPROVED').length;
      
      console.log('📊 Vendors stats:', {
        totalVendors,
        pendingVendors,
        activeVendors
      });

      // Process Bookings statistics
      const allBookings = bookingsData.data || [];
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter((b: any) => b?.status === 'COMPLETED').length;
      // Note: At-home vs salon bookings would need an additional field in bookings table
      const atHomeBookings = Math.floor(totalBookings * 0.6); // Estimate
      const salonBookings = Math.floor(totalBookings * 0.4); // Estimate
      
      console.log('📊 Bookings stats:', {
        totalBookings,
        completedBookings,
        dataLength: allBookings.length
      });

      // Process Payments statistics - Calculate revenue from completed payments
      const allPayments = paymentsData.data || [];
      const completedPayments = allPayments.filter((p: any) => p?.status === 'COMPLETED' || p?.status === 'SUCCESS');
      
      // Calculate total revenue from completed payments
      let totalRevenue = 0;
      if (completedPayments.length > 0) {
        totalRevenue = completedPayments.reduce((sum: number, p: any) => {
          const amount = parseFloat(p.amount?.toString() || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      } else {
        // Fallback: Calculate revenue from completed bookings if payments table is empty
        const completedBookingPayments = allBookings
          .filter((b: any) => b?.status === 'COMPLETED')
          .reduce((sum: number, b: any) => {
            const total = parseFloat(b.total?.toString() || '0');
            return sum + (isNaN(total) ? 0 : total);
          }, 0);
        totalRevenue = completedBookingPayments;
      }
      
      // Calculate monthly revenue (current month)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyPayments = completedPayments.filter((p: any) => {
        if (!p.created_at) return false;
        const paymentDate = new Date(p.created_at);
        return paymentDate >= firstDayOfMonth;
      });
      const monthlyRevenue = monthlyPayments.reduce((sum: number, p: any) => {
        const amount = parseFloat(p.amount?.toString() || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      console.log('📊 Revenue stats:', {
        totalRevenue,
        monthlyRevenue,
        completedPaymentsCount: completedPayments.length,
        allPaymentsCount: allPayments.length
      });

      // Pending payouts (payments with status PENDING or PROCESSING)
      const pendingPayouts = allPayments
        .filter((p: any) => p?.status === 'PENDING' || p?.status === 'PROCESSING')
        .reduce((sum: number, p: any) => {
          const amount = parseFloat(p.amount?.toString() || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

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

      // Build comprehensive recent activity feed from multiple sources
      const activities: RecentActivity[] = [];

      // Helper function to get user info
      const getUserInfo = (userId: string) => {
        const user = allUsers.find((u: any) => u.id === userId);
        if (!user) return undefined;
        return {
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
          email: user.email || '',
          phone: user.phone || undefined
        };
      };

      // Helper function to get vendor info
      const getVendorInfo = (vendorId: string) => {
        const vendor = vendorsData.data?.find((v: any) => v.id === vendorId);
        if (!vendor) return undefined;
        const vendorUser = vendor.user_id ? getUserInfo(vendor.user_id) : undefined;
        return {
          name: vendorUser?.name || 'Unknown',
          businessName: vendor.shopname || 'Unknown Vendor',
          email: vendorUser?.email || ''
        };
      };

      // 1. User Registrations (from users table)
      if (recentUsers.data && recentUsers.data.length > 0) {
        recentUsers.data.forEach((user: any) => {
          const roleName = user.role === 'CUSTOMER' ? 'User' : user.role === 'VENDOR' ? 'Vendor' : user.role === 'MANAGER' ? 'Manager' : user.role === 'ADMIN' ? 'Admin' : 'User';
          activities.push({
            id: `user-reg-${user.id}-${user.created_at}`,
            type: 'user_registration',
            description: `New ${roleName} Registration`,
            timestamp: user.created_at,
            user: {
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
              email: user.email || ''
            },
            status: 'success'
          });
        });
      }

      // 2. Vendor Approvals (from vendors with status APPROVED)
      if (vendorStatusChangesData.data && vendorStatusChangesData.data.length > 0) {
        vendorStatusChangesData.data.forEach((vendor: any) => {
          if (vendor.status === 'APPROVED') {
            const vendorUser = vendor.user_id ? getUserInfo(vendor.user_id) : undefined;
            activities.push({
              id: `vendor-approval-${vendor.id}-${vendor.updated_at || vendor.created_at}`,
              type: 'vendor_approval',
              description: 'Vendor Approved',
              timestamp: vendor.updated_at || vendor.created_at,
              vendor: {
                name: vendorUser?.name || 'Unknown',
                businessName: vendor.shopname || 'Unknown Vendor',
                email: vendorUser?.email || ''
              },
              status: 'success'
            });
          } else if (vendor.status === 'SUSPENDED') {
            const vendorUser = vendor.user_id ? getUserInfo(vendor.user_id) : undefined;
            activities.push({
              id: `vendor-suspension-${vendor.id}-${vendor.updated_at || vendor.created_at}`,
              type: 'vendor_suspension',
              description: 'Vendor Suspended',
              timestamp: vendor.updated_at || vendor.created_at,
              vendor: {
                name: vendorUser?.name || 'Unknown',
                businessName: vendor.shopname || 'Unknown Vendor',
                email: vendorUser?.email || ''
              },
              status: 'success'
            });
          }
        });
      }

      // 3. Manager/Beautician Approvals (from users with MANAGER role)
      if (recentUsers.data && recentUsers.data.length > 0) {
        recentUsers.data
          .filter((u: any) => u.role === 'MANAGER' && u.status === 'ACTIVE')
          .forEach((manager: any) => {
            activities.push({
              id: `manager-approval-${manager.id}-${manager.created_at}`,
              type: 'manager_approval',
              description: 'Manager Approval',
              timestamp: manager.created_at,
              user: {
                name: `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || 'Unknown',
                email: manager.email || ''
              },
              status: 'success'
            });
          });
      }

      // 4. Booking Completions (from bookings with status COMPLETED)
      if (recentBookings.data && recentBookings.data.length > 0) {
        recentBookings.data
          .filter((b: any) => b.status === 'COMPLETED')
          .forEach((booking: any) => {
            const customer = getUserInfo(booking.customer_id);
            activities.push({
              id: `booking-completed-${booking.id}-${booking.created_at}`,
              type: 'booking_completed',
              description: 'Booking Completed',
              timestamp: booking.created_at,
              user: customer,
              amount: parseFloat(booking.total?.toString() || '0'),
              status: 'success'
            });
          });
      }

      // 5. Booking Cancellations (from cancelled bookings)
      if (cancelledBookingsData.data && cancelledBookingsData.data.length > 0) {
        cancelledBookingsData.data.forEach((booking: any) => {
          const customer = getUserInfo(booking.customer_id);
          activities.push({
            id: `booking-cancelled-${booking.id}-${booking.updated_at || booking.created_at}`,
            type: 'booking_cancelled',
            description: 'Booking Cancelled',
            timestamp: booking.updated_at || booking.created_at,
            user: customer,
            amount: parseFloat(booking.total?.toString() || '0'),
            status: 'cancelled',
            bookingType: booking.booking_type || undefined
          });
        });
      }

      // 6. Payment Processed (from payments with status COMPLETED/SUCCESS)
      if (recentPayments.data && recentPayments.data.length > 0) {
        recentPayments.data
          .filter((p: any) => p.status === 'COMPLETED' || p.status === 'SUCCESS')
          .forEach((payment: any) => {
            const paymentUser = getUserInfo(payment.user_id);
            activities.push({
              id: `payment-processed-${payment.id}-${payment.created_at}`,
              type: 'payment_processed',
              description: 'Payment Processed',
              timestamp: payment.created_at,
              user: paymentUser,
              amount: parseFloat(payment.amount?.toString() || '0'),
              status: 'success'
            });
          });
      }

      // 7. Payment Failed (from failed payments)
      if (failedPaymentsData.data && failedPaymentsData.data.length > 0) {
        failedPaymentsData.data.forEach((payment: any) => {
          const paymentUser = getUserInfo(payment.user_id);
          activities.push({
            id: `payment-failed-${payment.id}-${payment.created_at}`,
            type: 'payment_failed',
            description: 'Payment Failed',
            timestamp: payment.created_at,
            user: paymentUser,
            amount: parseFloat(payment.amount?.toString() || '0'),
            status: 'failed'
          });
        });
      }

      // 8. Refunds Processed (from refunded payments)
      if (refundedPaymentsData.data && refundedPaymentsData.data.length > 0) {
        refundedPaymentsData.data.forEach((payment: any) => {
          const paymentUser = getUserInfo(payment.user_id);
          const refundAmount = parseFloat(payment.refund_amount?.toString() || payment.amount?.toString() || '0');
          activities.push({
            id: `refund-processed-${payment.id}-${payment.refunded_at || payment.created_at}`,
            type: 'refund_processed',
            description: 'Refund Processed',
            timestamp: payment.refunded_at || payment.created_at,
            user: paymentUser,
            amount: refundAmount,
            status: 'success'
          });
        });
      }

      // 9. User Suspensions (from users with status SUSPENDED)
      if (allUsersData.data && allUsersData.data.length > 0) {
        allUsersData.data
          .filter((u: any) => u.status === 'SUSPENDED')
          .slice(0, 10)
          .forEach((user: any) => {
            activities.push({
              id: `user-suspension-${user.id}-${user.updated_at || user.created_at}`,
              type: 'user_suspension',
              description: 'User Suspended',
              timestamp: user.updated_at || user.created_at,
              user: {
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
                email: user.email || ''
              },
              status: 'success'
            });
          });
      }

      // 10. Booking Events (from booking_events table)
      if (bookingEventsData.data && bookingEventsData.data.length > 0) {
        bookingEventsData.data.forEach((event: any) => {
          const booking = recentBookings.data?.find((b: any) => b.id === event.booking_id);
          const customer = booking ? getUserInfo(booking.customer_id) : undefined;
          const eventType = event.type?.toLowerCase() || '';
          
          let activityType: RecentActivity['type'] = 'booking_completed';
          let description = 'Booking Event';
          let status: RecentActivity['status'] = 'success';
          
          if (eventType.includes('completed')) {
            activityType = 'booking_completed';
            description = 'Booking Completed';
            status = 'success';
          } else if (eventType.includes('cancelled') || eventType.includes('cancel')) {
            activityType = 'booking_cancelled';
            description = 'Booking Cancelled';
            status = 'cancelled';
          }
          
          activities.push({
            id: `booking-event-${event.id}-${event.created_at}`,
            type: activityType,
            description: description,
            timestamp: event.created_at,
            user: customer,
            status: status
          });
        });
      }

      // 11. Audit Logs (from audit_logs table)
      if (auditLogsData.data && auditLogsData.data.length > 0) {
        auditLogsData.data.forEach((log: any) => {
          const logUser = log.user_id ? getUserInfo(log.user_id) : undefined;
          const action = log.action?.toLowerCase() || '';
          const resource = log.resource?.toLowerCase() || '';
          
          let activityType: RecentActivity['type'] = 'user_registration';
          let description = log.action || 'System Activity';
          let status: RecentActivity['status'] = 'success';
          
          // Parse audit log actions to determine activity type
          if (action.includes('approve') && resource.includes('vendor')) {
            activityType = 'vendor_approval';
            description = 'Vendor Approved';
          } else if (action.includes('approve') && resource.includes('manager')) {
            activityType = 'manager_approval';
            description = 'Manager Approval';
          } else if (action.includes('suspend') && resource.includes('vendor')) {
            activityType = 'vendor_suspension';
            description = 'Vendor Suspended';
            status = 'success';
          } else if (action.includes('suspend') && resource.includes('user')) {
            activityType = 'user_suspension';
            description = 'User Suspended';
            status = 'success';
          } else if (action.includes('refund')) {
            activityType = 'refund_processed';
            description = 'Refund Processed';
          } else if (action.includes('dispute')) {
            activityType = 'dispute_created';
            description = 'Dispute Created';
            status = 'pending';
          }
          
          activities.push({
            id: `audit-${log.id}-${log.created_at}`,
            type: activityType,
            description: description,
            timestamp: log.created_at,
            user: logUser,
            status: status
          });
        });
      }

      // Remove duplicates based on id and sort by timestamp (most recent first)
      const uniqueActivities = activities.filter((activity, index, self) =>
        index === self.findIndex((a) => a.id === activity.id)
      );
      
      uniqueActivities.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      
      setRecentActivity(uniqueActivities.slice(0, 15));
      
      console.log('📊 Recent Activity:', uniqueActivities.length, 'unique activities loaded');

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
      console.log('📊 Setting dashboard stats:', {
        totalUsers,
        totalVendors,
        totalManagers,
        pendingApprovals,
        totalRevenue,
        monthlyRevenue
      });
      
      setStats({
        totalUsers: totalUsers || 0, // Total ALL users (all roles combined)
        totalVendors: totalVendors || 0, // Vendors from vendors table
        totalManagers: totalManagers || 0, // Users with role='MANAGER'
        pendingApprovals: pendingApprovals || 0,
        totalRevenue: totalRevenue || 0,
        monthlyRevenue: monthlyRevenue || 0,
        pendingPayouts: pendingPayouts || 0,
        refundRequests: refundRequests || 0,
        activeUsers: activeUsers || 0, // Active users (all roles)
        suspendedUsers: suspendedUsers || 0, // Suspended users (all roles)
        activeVendors: activeVendors || 0,
        pendingVendors: pendingVendors || 0,
        totalBookings: totalBookings || 0,
        completedBookings: completedBookings || 0,
        atHomeBookings: atHomeBookings || 0,
        salonBookings: salonBookings || 0,
        totalCommissions: totalCommissions || 0,
        pendingDisputes: 0, // Would need a disputes table
        averageRating: averageRating || 0
      });
      
      console.log('✅ Dashboard stats updated successfully');
      
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`);
      
      // Fallback: Set empty stats if all queries fail
      console.error('❌ All queries failed, setting empty stats');
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
      case 'user_registration':
        return <UserPlus className="w-4 h-4 text-white" />;
      case 'vendor_approval':
        return <Building className="w-4 h-4 text-white" />;
      case 'booking_completed':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'booking_cancelled':
        return <X className="w-4 h-4 text-white" />;
      case 'payment_processed':
        return <CreditCard className="w-4 h-4 text-white" />;
      case 'payment_failed':
        return <AlertTriangle className="w-4 h-4 text-white" />;
      case 'refund_processed':
        return <RefreshCw className="w-4 h-4 text-white" />;
      case 'dispute_created':
        return <AlertCircle className="w-4 h-4 text-white" />;
      case 'manager_approval':
      case 'beautician_approval':
        return <UserCheck className="w-4 h-4 text-white" />;
      case 'vendor_suspension':
        return <Building className="w-4 h-4 text-white" />;
      case 'user_suspension':
        return <UserX className="w-4 h-4 text-white" />;
      default:
        return <Activity className="w-4 h-4 text-white" />;
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-[#6d4c41]">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity found</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-[#fdf6f0] transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'pending' ? 'bg-yellow-500' :
                          activity.status === 'failed' ? 'bg-red-500' :
                          activity.status === 'cancelled' ? 'bg-gray-500' :
                          'bg-[#4e342e]'
                        }`}>
                          {getStatusIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#4e342e] mb-1">{activity.description}</p>
                              <p className="text-xs text-[#6d4c41] mb-2">
                                {new Date(activity.timestamp).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              
                              {/* User Info */}
                              {activity.user && (
                                <div className="space-y-1 mb-2">
                                  <p className="text-xs text-[#4e342e] font-medium">{activity.user.name}</p>
                                  {activity.user.email && (
                                    <p className="text-xs text-[#6d4c41] flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {activity.user.email}
                                    </p>
                                  )}
                                  {activity.user.phone && (
                                    <p className="text-xs text-[#6d4c41] flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {activity.user.phone}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* Vendor Info */}
                              {activity.vendor && (
                                <div className="space-y-1 mb-2">
                                  <p className="text-xs text-[#4e342e] font-medium">{activity.vendor.businessName}</p>
                                  <p className="text-xs text-[#6d4c41]">{activity.vendor.name}</p>
                                  {activity.vendor.email && (
                                    <p className="text-xs text-[#6d4c41] flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {activity.vendor.email}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* Amount */}
                              {activity.amount !== undefined && activity.amount > 0 && (
                                <p className="text-sm text-[#4e342e] font-semibold mb-1">
                                  ${activity.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              )}
                              
                              {/* Booking Type */}
                              {activity.bookingType && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {activity.bookingType === 'AT_HOME' ? 'At-Home Service' : 'Salon Visit'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {activity.status && (
                                <Badge className={getStatusBadgeColor(activity.status)}>
                                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </Badge>
                              )}
                              <Badge className="bg-[#4e342e] text-white text-xs">
                                {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        

    
    
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

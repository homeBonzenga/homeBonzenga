import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  User, 
  MapPin,
  Phone,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Download,
  Eye,
  Home,
  Building,
  Plus,
  ArrowRight,
  Scissors,
  Sparkles,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { supabaseConfig } from '@/config/supabase';

interface DashboardStats {
  activeBookings: number;
  completedBookings: number;
  pendingPayments: number;
  totalBookings: number;
}

interface Booking {
  id: string;
  bookingNumber: string;
  type: string;
  category: string;
  status: string;
  paymentStatus: string;
  scheduledDate: string;
  scheduledTime: string;
  total: number;
  beautician?: {
    id: string;
    firstName: string;
    lastName: string;
    skills: string[];
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  createdAt: string;
}

interface Invoice {
  invoiceId: string;
  bookingId: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  services: Array<{
    name: string;
    price: number;
  }>;
}

const CustomerDashboard = () => {
  const { user } = useSupabaseAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items: cartItems, totalItems, totalPrice, removeItem, clearCart, updateQuantity } = useCart();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
    const interval = setInterval(() => {
      if (user?.id) {
        fetchDashboardData();
      }
    }, 30000);

    // Supabase realtime subscription for booking updates
    const channel = supabase
      .channel('booking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        const customerId = user?.id;
        const newRow: any = (payload as any).new;
        if (newRow && customerId && newRow.customer_id === customerId) {
          fetchDashboardData();
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available');
        setStats({
          activeBookings: 0,
          completedBookings: 0,
          pendingPayments: 0,
          totalBookings: 0
        });
        setBookings([]);
        setInvoices([]);
        return;
      }

      const userId = user.id;

      // First, check if Supabase is configured
      if (!supabaseConfig.isConfigured) {
        console.warn('Supabase not configured, using empty data');
        setStats({
          activeBookings: 0,
          completedBookings: 0,
          pendingPayments: 0,
          totalBookings: 0
        });
        setBookings([]);
        setInvoices([]);
        return;
      }

      // Fetch bookings directly from Supabase with related data
      // Simplified query to avoid nested relationship issues
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          vendor:vendors!vendor_id(
            id,
            shopname,
            address,
            city,
            state
          ),
          booking_items(
            id,
            quantity,
            price,
            service_id
          ),
          payments(
            id,
            status,
            amount
          )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings from Supabase:', bookingsError);
        // Don't throw, just log and show empty state
        setStats({
          activeBookings: 0,
          completedBookings: 0,
          pendingPayments: 0,
          totalBookings: 0
        });
        setBookings([]);
        setInvoices([]);
        toast.error('Failed to load bookings. Please check your connection.');
        return;
      }

      // Fetch services for booking items if needed
      const bookingItemIds = (bookingsData || [])
        .flatMap((b: any) => (b.booking_items || []).map((item: any) => item.service_id))
        .filter((id: string) => id);

      let servicesMap: Record<string, any> = {};
      if (bookingItemIds.length > 0) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('id, name, price, duration')
          .in('id', [...new Set(bookingItemIds)]);
        
        if (servicesData) {
          servicesMap = servicesData.reduce((acc: any, service: any) => {
            acc[service.id] = service;
            return acc;
          }, {});
        }
      }

      // Transform Supabase bookings to match the frontend interface
      const transformedBookings: Booking[] = (bookingsData || []).map((booking: any) => {
        // Determine payment status from payments
        const payments = booking.payments || [];
        const hasPaidPayment = payments.some((p: any) => p.status === 'COMPLETED');
        const paymentStatus = hasPaidPayment ? 'paid' : 'unpaid';

        // Extract services from booking items using the services map
        const services = (booking.booking_items || []).map((item: any) => {
          const service = servicesMap[item.service_id];
          return {
            id: service?.id || item.service_id || item.id,
            name: service?.name || 'Service',
            price: service?.price || item.price || 0,
            duration: service?.duration || 60
          };
        });

        return {
          id: booking.id,
          bookingNumber: booking.id.substring(0, 8).toUpperCase(),
          type: 'At-Home', // Default to At-Home, can be determined from booking_type if available
          category: 'Beauty',
          status: mapBookingStatus(booking.status || 'PENDING'),
          paymentStatus: paymentStatus,
          scheduledDate: booking.scheduled_date || booking.created_at,
          scheduledTime: booking.scheduled_time || '10:00 AM',
          total: parseFloat(booking.total) || 0,
          beautician: undefined, // Can be added if employee_id is available
          services: services,
          createdAt: booking.created_at || new Date().toISOString()
        };
      });

      // Calculate stats from bookings
      setStats({
        activeBookings: transformedBookings.filter(b => 
          b.status === 'confirmed' || 
          b.status === 'pending_approval' || 
          b.status === 'pending' ||
          b.status === 'in_progress'
        ).length,
        completedBookings: transformedBookings.filter(b => b.status === 'completed').length,
        pendingPayments: transformedBookings.filter(b => b.paymentStatus === 'unpaid').length,
        totalBookings: transformedBookings.length
      });

      setBookings(transformedBookings);
      setInvoices([]); // Invoices can be generated from bookings if needed
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty data
      setStats({
        activeBookings: 0,
        completedBookings: 0,
        pendingPayments: 0,
        totalBookings: 0
      });
      setBookings([]);
      setInvoices([]);
      toast.error('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map backend status to frontend status
  const mapBookingStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'pending_approval',
      'AWAITING_MANAGER': 'manager_review',
      'AWAITING_VENDOR_RESPONSE': 'vendor_assigned',
      'CONFIRMED': 'confirmed',
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
      'REJECTED': 'cancelled'
    };
    return statusMap[status?.toUpperCase()] || status?.toLowerCase() || 'pending';
  };

  // Helper function to map payment status
  const mapPaymentStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'PAID': 'paid',
      'UNPAID': 'unpaid',
      'PENDING': 'pending'
    };
    return statusMap[status?.toUpperCase()] || status?.toLowerCase() || 'unpaid';
  };

  const persistBookings = (updated: Booking[]) => {
    if (!user?.id) return;
    const key = `hb_dashboard_${user.id}`;
    const payload = { bookings: updated };
    localStorage.setItem(key, JSON.stringify(payload));
    setBookings(updated);
    setStats({
      activeBookings: updated.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
      completedBookings: updated.filter(b => b.status === 'completed').length,
      pendingPayments: updated.filter(b => b.paymentStatus === 'unpaid').length,
      totalBookings: updated.length,
    });
  };

  const markCompleted = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: 'completed' } : b);
    persistBookings(updated);
    toast.success('Booking marked as completed');
  };

  const togglePaymentStatus = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, paymentStatus: b.paymentStatus === 'paid' ? 'unpaid' : 'paid' } : b);
    persistBookings(updated);
    toast.success('Payment status updated');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'manager_review':
        return 'bg-orange-100 text-orange-800';
      case 'vendor_assigned':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadInvoice = (invoice: Invoice) => {
    const invoiceContent = `
HOME BONZENGA - INVOICE
========================

Invoice ID: ${invoice.invoiceId}
Booking ID: ${invoice.bookingId}
Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

SERVICES:
${invoice.services.map(service => 
  `- ${service.name} - ${service.price.toLocaleString()} CDF`
).join('\n')}

TOTAL: ${invoice.amount.toLocaleString()} CDF
Status: ${invoice.status}

Thank you for choosing Home Bonzenga!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading dashboard...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4e342e] mb-2">
            Welcome back, {user?.firstName || 'Customer'}!
          </h1>
          <p className="text-base sm:text-lg text-[#6d4c41]">
            Manage your beauty service bookings and track your orders
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            className="h-16 sm:h-20 bg-[#4e342e] hover:bg-[#3b2c26] text-white text-base sm:text-lg"
            onClick={() => navigate('/customer/at-home-services')}
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            <span className="hidden xs:inline">Book At-Home Service</span>
            <span className="xs:hidden">At-Home Service</span>
          </Button>
          <Button 
            variant="outline"
            className="h-16 sm:h-20 border-2 border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white text-base sm:text-lg"
            onClick={() => navigate('/customer/salon-visit')}
          >
            <Building className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            <span className="hidden xs:inline">Visit a Salon</span>
            <span className="xs:hidden">Salon Visit</span>
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#6d4c41]">Active Bookings</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4e342e]">{stats.activeBookings}</p>
                  </div>
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#4e342e]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#6d4c41]">Completed</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4e342e]">{stats.completedBookings}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#6d4c41]">Pending Payments</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4e342e]">{stats.pendingPayments}</p>
                  </div>
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#6d4c41]">Total Bookings</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4e342e]">{stats.totalBookings}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#4e342e]" />
                </div>
              </CardContent>
            </Card>

            {/* Cart Summary */}
            <Card className="border-0 shadow-lg col-span-2 lg:col-span-4">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#6d4c41]">Cart</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4e342e]">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm font-medium text-[#6d4c41]">Estimated Total</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4e342e]">{totalPrice.toLocaleString()} CDF</p>
                  </div>
                </div>
                {cartItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cartItems.slice(0, 6).map(item => (
                      <div key={item.id} className="flex items-center justify-between border border-[#fdf6f0] rounded-lg p-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[#4e342e] truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-6 h-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm text-[#4e342e]">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-6 h-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-[#4e342e] font-semibold whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} CDF</div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    className="bg-[#4e342e] hover:bg-[#3b2c26] text-white text-sm sm:text-base"
                    onClick={() => navigate('/customer/at-home-services')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add More Services</span>
                    <span className="sm:hidden">Add Services</span>
                  </Button>
                  {cartItems.length > 0 && (
                    <Button 
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base"
                      onClick={() => clearCart()}
                    >
                      Clear Cart
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white text-sm sm:text-base"
                    onClick={() => navigate('/customer/booking-confirmation')}
                  >
                    <span className="hidden sm:inline">Proceed to Booking</span>
                    <span className="sm:hidden">Book Now</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm py-2 sm:py-3">
              <span className="hidden sm:inline">My Bookings</span>
              <span className="sm:hidden">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs sm:text-sm py-2 sm:py-3">
              <span className="hidden sm:inline">Order Tracking</span>
              <span className="sm:hidden">Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm py-2 sm:py-3">
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e]">
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                    <p className="text-xl font-semibold text-[#4e342e] mb-2">No bookings yet</p>
                    <p className="text-[#6d4c41] mb-4">Start by booking your first beauty service</p>
                    <Button 
                      className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                      onClick={() => navigate('/customer/at-home-services')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Book a Service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-[#fdf6f0] rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[#4e342e] text-lg">
                              {booking.bookingNumber}
                            </h3>
                            <p className="text-[#6d4c41]">{booking.type} - {booking.category}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                              {booking.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-[#6d4c41]">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#6d4c41]">
                            <Clock className="w-4 h-4" />
                            <span>{booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#6d4c41]">
                            <DollarSign className="w-4 h-4" />
                            <span>{booking.total.toLocaleString()} CDF</span>
                          </div>
                        </div>

                        {booking.beautician && (
                          <div className="flex items-center gap-2 text-[#6d4c41] mb-3">
                            <User className="w-4 h-4" />
                            <span>Beautician: {booking.beautician.firstName} {booking.beautician.lastName}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#6d4c41]">
                            Services: {booking.services.map(s => s.name).join(', ')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                              onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            {booking.status !== 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-300 text-green-700 hover:bg-green-50"
                                onClick={() => markCompleted(booking.id)}
                              >
                                Mark Completed
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                              onClick={() => togglePaymentStatus(booking.id)}
                            >
                              {booking.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e]">
                  Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-[#4e342e] mb-2">No active orders</p>
                    <p className="text-[#6d4c41]">All your orders have been completed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings
                      .filter(b => b.status !== 'completed' && b.status !== 'cancelled')
                      .map((booking) => (
                        <div key={booking.id} className="border border-[#fdf6f0] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-[#4e342e]">{booking.bookingNumber}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-[#6d4c41]">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{booking.type} - {booking.category}</span>
                            </div>
                            {booking.beautician && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Assigned to: {booking.beautician.firstName} {booking.beautician.lastName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e]">
                  Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                    <p className="text-xl font-semibold text-[#4e342e] mb-2">No invoices yet</p>
                    <p className="text-[#6d4c41]">Invoices will appear here after you complete bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.invoiceId} className="border border-[#fdf6f0] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[#4e342e]">{invoice.invoiceId}</h3>
                            <p className="text-[#6d4c41] text-sm">Booking: {invoice.bookingId}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPaymentStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <span className="font-semibold text-[#4e342e]">
                              {invoice.amount.toLocaleString()} CDF
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm text-[#6d4c41]">
                          <div>
                            <span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#6d4c41]">
                            Services: {invoice.services.map(s => s.name).join(', ')}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                            onClick={() => downloadInvoice(invoice)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;

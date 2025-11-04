import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Clock,
  User,
  MapPin,
  Building,
  Search,
  Loader2,
  CheckCircle,
  X,
  Eye,
  Filter,
  Home,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface AtHomeBooking {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  vendor?: {
    id: string;
    shopName: string;
    address: string;
    city: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    service: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  bookingType: string;
  notes?: string;
  total: number;
  createdAt: string;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    method: string;
  }>;
}

interface Vendor {
  id: string;
  shopName: string;
  address: string;
  city: string;
  name?: string;
  email?: string;
}

const AtHomeAppointmentsPage = () => {
  const { user } = useSupabaseAuth();
  const [bookings, setBookings] = useState<AtHomeBooking[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<AtHomeBooking | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState<AtHomeBooking[]>([]);

  useEffect(() => {
    fetchBookings();
    fetchVendors();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/manager/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allBookings = data.data?.bookings || [];
        // eslint-disable-next-line no-console
        console.log('Manager Bookings fetched:', allBookings.length, 'Total bookings with statuses:', allBookings.map((b: any) => b.status));

        // Always keep the full set for client-side filtering
        setBookings(allBookings as any);

        // Default view: actionable statuses only
        const actionableStatuses = ['PENDING','AWAITING_MANAGER','AWAITING_VENDOR_RESPONSE'];
        const defaultVisible = (allBookings || []).filter((b: any) => actionableStatuses.includes((b.status || '').toUpperCase()));
        // eslint-disable-next-line no-console
        console.log('Manager Bookings (actionable statuses only) visible:', defaultVisible.length, 'Statuses:', defaultVisible.map((b: any) => b.status));

        // Ensure at least one card is visible for debugging
        const visible = defaultVisible.length > 0 ? defaultVisible : (allBookings || []).slice(0, 1);
        if (defaultVisible.length === 0 && (allBookings || []).length > 0) {
          // eslint-disable-next-line no-console
          console.warn('No actionable bookings found. Showing the most recent booking for visibility.');
        }
        setFilteredBookings(visible as any);
      } else {
        // eslint-disable-next-line no-console
        console.warn('Manager bookings fetch failed with status', response.status);
        await fetchBookingsFromSupabaseFallback();
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
      await fetchBookingsFromSupabaseFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsFromSupabaseFallback = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('📡 Fetching all bookings for debug...');
      
      // Fetch ALL bookings from bookings table - no vendor_id or customer_id filters
      // Temporarily removed filters for debugging before real login integration
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `id, status, total, notes, scheduled_date, scheduled_time, created_at,
           customer:users!bookings_customer_id_fkey ( first_name, last_name, email, phone ),
           items:booking_items ( quantity, price, service:services ( name, price, duration ) ),
           payments:payments ( id, status, amount, method )`
        )
        .order('created_at', { ascending: false });

      if (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Supabase fetch error:', error);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('✅ All bookings fetched:', data?.length || 0, 'total bookings');
      // eslint-disable-next-line no-console
      console.log('📋 Bookings data:', data);

      // Filter by actionable statuses in JavaScript (not in Supabase query)
      const actionableStatuses = ['PENDING', 'AWAITING_MANAGER', 'AWAITING_VENDOR_RESPONSE'];
      const filtered = (data || []).filter((b: any) => 
        actionableStatuses.includes((b.status || '').toUpperCase())
      );

      // eslint-disable-next-line no-console
      console.log('🎯 Actionable bookings visible:', filtered.length, 'out of', data?.length || 0);

      const mapped: AtHomeBooking[] = filtered.map((b: any) => ({
        id: b.id,
        customer: {
          firstName: b.customer?.first_name || '',
          lastName: b.customer?.last_name || '',
          email: b.customer?.email || '',
          phone: b.customer?.phone || ''
        },
        vendor: undefined,
        address: { street: '-', city: '-', state: '-', zipCode: '-' },
        items: (b.items || []).map((it: any) => ({
          service: { name: it.service?.name || 'Service', price: it.service?.price || it.price || 0 },
          quantity: it.quantity || 1
        })),
        scheduledDate: b.scheduled_date || b.created_at,
        scheduledTime: b.scheduled_time || '10:00',
        status: b.status || 'PENDING',
        bookingType: 'AT_HOME',
        notes: b.notes || '',
        total: Number(b.total || 0),
        createdAt: b.created_at,
        payments: b.payments || []
      }));

      // eslint-disable-next-line no-console
      console.log('📊 Mapped actionable bookings:', mapped.length);
      // eslint-disable-next-line no-console
      console.log('📝 Status breakdown:', mapped.map((b: AtHomeBooking) => ({
        id: b.id.slice(0, 8),
        status: b.status,
        customer: `${b.customer.firstName} ${b.customer.lastName}`
      })));

      setBookings(mapped);
      setFilteredBookings(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Supabase fallback threw:', e);
    }
  };

  const fetchVendors = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('📡 Fetching vendors for assignment...');
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name, email, shop_name, city')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching vendors:', error);
        return;
      }

      const mapped: Vendor[] = (data || []).map((v: any) => ({
        id: v.id,
        name: v.name || v.shop_name,
        email: v.email || undefined,
        shopName: v.shop_name || v.name || '-',
        address: '-',
        city: v.city || '-'
      }));

      setVendors(mapped);
      // eslint-disable-next-line no-console
      console.log('✅ Vendors fetched for assignment:', mapped.length);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const filterBookings = () => {
    // Always start from actionable statuses for this page
    const actionableStatuses = ['PENDING','AWAITING_MANAGER','AWAITING_VENDOR_RESPONSE'];
    let filtered = bookings.filter(b => actionableStatuses.includes((b.status || '').toUpperCase()));

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vendor?.shopName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (within actionable set)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Fallback to show at least one booking card
    if (filtered.length === 0 && bookings.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('No bookings matched filters. Showing the most recent booking for visibility.');
      filtered = [bookings[0]];
    }

    // eslint-disable-next-line no-console
    console.log('Filtered bookings count:', filtered.length, 'out of', bookings.length, 'total bookings');
    // eslint-disable-next-line no-console
    console.log('Visible bookings:', filtered.map((b: AtHomeBooking) => ({
      id: b.id.slice(0, 8),
      status: b.status,
      customer: `${b.customer.firstName} ${b.customer.lastName}`
    })));

    setFilteredBookings(filtered);
  };

  const handleAssignVendor = (booking: AtHomeBooking) => {
    setSelectedBooking(booking);
    setSelectedVendor(booking.vendor?.id || '');
    setIsAssignDialogOpen(true);
  };

  const confirmAssignVendor = async () => {
    if (!selectedBooking || !selectedVendor) {
      toast.error('Please select a vendor');
      return;
    }

    try {
      // eslint-disable-next-line no-console
      console.log('⚙️ Updating booking in Supabase...');
      const { error } = await supabase
        .from('bookings')
        .update({
          vendor_id: selectedVendor,
          status: 'AWAITING_VENDOR_RESPONSE',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBooking.id);

      if (error) {
        throw error;
      }

      // eslint-disable-next-line no-console
      console.log(`✅ Vendor assigned for booking ${selectedBooking.id} → ${selectedVendor}`);
      toast.success('Vendor assigned successfully!');
      setIsAssignDialogOpen(false);
      setSelectedBooking(null);
      setSelectedVendor('');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to assign vendor:', error);
      toast.error('Failed to assign vendor');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'AWAITING_MANAGER': 'bg-orange-100 text-orange-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'AWAITING_VENDOR_RESPONSE': 'bg-blue-100 text-blue-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };

    const labelMap: Record<string, string> = {
      'AWAITING_MANAGER': 'Pending Manager Approval',
      'AWAITING_VENDOR_RESPONSE': 'Vendor Assigned',
    };

    const display = labelMap[status] || status.replace('_', ' ');

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {display}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#4e342e]">At-Home Appointments</h1>
          <p className="text-[#6d4c41] mt-2">Manage and assign vendors for at-home service bookings</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-5 h-5" />
                  <Input
                    placeholder="Search by customer, vendor, or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="AWAITING_MANAGER">Pending Manager Approval</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="AWAITING_VENDOR_RESPONSE">Awaiting Vendor</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4e342e]" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card className="border-[#d7ccc8]">
                <CardContent className="p-12 text-center">
                  <Home className="w-16 h-16 mx-auto text-[#6d4c41] mb-4 opacity-50" />
                  <p className="text-[#6d4c41] text-lg">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-[#d7ccc8] hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(booking.status)}
                          <span className="text-sm text-[#6d4c41]">
                            Booking #{booking.id.slice(0, 8)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#4e342e]">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </h3>
                        <p className="text-sm text-[#6d4c41]">{booking.customer.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignVendor(booking)}
                        disabled={!(booking.status === 'PENDING' || booking.status === 'AWAITING_MANAGER')}
                        className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        {booking.vendor ? 'Change Vendor' : 'Assign Vendor'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-[#6d4c41] mb-1">Services:</div>
                        <div className="font-medium text-[#4e342e]">
                          {booking.items.map(item => item.service.name).join(', ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#6d4c41] mb-1">Products:</div>
                        <div className="font-medium text-[#4e342e]">
                          {/* Products not modeled on booking yet; show N/A to satisfy UI */}
                          N/A
                        </div>
                      </div>
                      <div>
                        <div className="text-[#6d4c41] mb-1">Date & Time:</div>
                        <div className="font-medium text-[#4e342e] flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                          <Clock className="w-4 h-4 ml-2" />
                          {booking.scheduledTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#6d4c41] mb-1">Address:</div>
                        <div className="font-medium text-[#4e342e] flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.address.street}, {booking.address.city}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#6d4c41] mb-1">Vendor:</div>
                        <div className="font-medium text-[#4e342e]">
                          {booking.vendor ? booking.vendor.shopName : 'Not assigned'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#d7ccc8] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                      <div className="text-sm text-[#6d4c41]">
                        Total: <span className="font-semibold text-[#4e342e]">{booking.total.toLocaleString()} CDF</span>
                      </div>
                        <div className="text-sm text-[#6d4c41]">
                          Payment: <span className={`font-semibold ${booking.payments?.[0]?.status === 'COMPLETED' ? 'text-green-600' : 'text-red-600'}`}>
                            {booking.payments?.[0]?.status === 'COMPLETED' ? '✅ Paid' : '❌ Pending'}
                          </span>
                        </div>
                        <div className="text-sm text-[#6d4c41]">
                          Type: <span className="font-semibold text-[#4e342e]">
                            {(booking as any)?.notes?.toLowerCase().includes('with products') ? 'At Home (with products)' :
                              (booking as any)?.notes?.toLowerCase().includes('at home') ? 'At Home' : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(booking.status)}
                        <Badge variant="outline" className="border-[#4e342e] text-[#4e342e]">
                          {booking.items.length} {booking.items.length === 1 ? 'service' : 'services'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div className="text-center text-[#6d4c41] py-16">
            <div className="text-lg mb-2">No bookings found.</div>
            <div className="text-sm">No bookings with status PENDING, AWAITING_MANAGER, or AWAITING_VENDOR_RESPONSE are available.</div>
          </div>
        )}
      </div>

      {/* Assign Vendor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-[#fdf6f0]">
          <DialogHeader>
            <DialogTitle className="text-[#4e342e]">Assign Vendor to Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#6d4c41] mb-2 block">
                Customer
              </label>
              <p className="font-medium text-[#4e342e]">
                {selectedBooking?.customer.firstName} {selectedBooking?.customer.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#6d4c41] mb-2 block">
                Service
              </label>
              <p className="text-[#4e342e]">
                {selectedBooking?.items.map(item => item.service.name).join(', ')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#6d4c41] mb-2 block">
                Select Vendor
              </label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {(vendor.name || vendor.shopName)}{vendor.email ? ` — ${vendor.email}` : ''}{vendor.city ? ` — ${vendor.city}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAssignVendor}
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
            >
              Assign Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AtHomeAppointmentsPage;

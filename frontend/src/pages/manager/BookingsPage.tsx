import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Booking {
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
  total: number;
  createdAt: string;
}

interface Vendor {
  id: string;
  shopName: string;
  address: string;
  city: string;
}

const BookingsPage = () => {
  const { user } = useSupabaseAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchVendors();
  }, []);

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
        setBookings(data.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/vendors?status=APPROVED', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleAssignVendor = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsAssignDialogOpen(true);
  };

  const confirmAssignVendor = async () => {
    if (!selectedBooking || !selectedVendor) {
      toast.error('Please select a vendor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/manager/bookings/${selectedBooking.id}/assign-vendor`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vendorId: selectedVendor })
        }
      );

      if (response.ok) {
        toast.success('Vendor assigned successfully');
        setIsAssignDialogOpen(false);
        setSelectedVendor('');
        fetchBookings();
      } else {
        toast.error('Failed to assign vendor');
      }
    } catch (error) {
      console.error('Error assigning vendor:', error);
      toast.error('Failed to assign vendor');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'AWAITING_VENDOR_RESPONSE': 'bg-blue-100 text-blue-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4e342e]">Bookings Management</h1>
          <p className="text-[#6d4c41] mt-2">View and manage all bookings</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4e342e]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-[#d7ccc8]">
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
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignVendor(booking)}
                      disabled={booking.status !== 'PENDING' && booking.status !== 'AWAITING_VENDOR_RESPONSE'}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      {booking.vendor ? 'Change Vendor' : 'Assign Vendor'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[#6d4c41] mb-1">Services:</div>
                      <div className="font-medium text-[#4e342e]">
                        {booking.items.map(item => item.service.name).join(', ')}
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
                </CardContent>
              </Card>
            ))}

            {bookings.length === 0 && (
              <Card className="border-[#d7ccc8]">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-[#6d4c41] mb-4 opacity-50" />
                  <p className="text-[#6d4c41] text-lg">No bookings found</p>
                </CardContent>
              </Card>
            )}
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
                Select Vendor
              </label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.shopName} - {vendor.city}
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
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BookingsPage;


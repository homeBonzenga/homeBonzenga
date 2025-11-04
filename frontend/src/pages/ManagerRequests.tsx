import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  Star,
  Shield,
  AlertCircle
} from 'lucide-react';
import { getManagerPendingBookings, updateBookingStatus, getAvailableBeauticians, assignBeauticianToBooking, Booking, Beautician } from '@/api/mockBooking';
import { toast } from 'sonner';

const ManagerRequests: React.FC = () => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [availableBeauticians, setAvailableBeauticians] = useState<Beautician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBeautician, setSelectedBeautician] = useState<string>('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookings = getManagerPendingBookings();
      const beauticians = getAvailableBeauticians();
      setPendingBookings(bookings);
      setAvailableBeauticians(beauticians);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    if (!selectedBeautician) {
      toast.error('Please select a beautician first');
      return;
    }

    try {
      setProcessing(bookingId);
      
      // Assign beautician and update status
      const updatedBooking = assignBeauticianToBooking(bookingId, selectedBeautician);
      
      if (updatedBooking) {
        // Refresh the list
        const updatedBookings = getManagerPendingBookings();
        setPendingBookings(updatedBookings);
        
        toast.success('Booking approved and beautician assigned successfully!');
        setSelectedBooking(null);
        setSelectedBeautician('');
      } else {
        toast.error('Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      setProcessing(bookingId);
      
      const updatedBooking = updateBookingStatus(bookingId, 'cancelled');
      
      if (updatedBooking) {
        // Refresh the list
        const updatedBookings = getManagerPendingBookings();
        setPendingBookings(updatedBookings);
        
        toast.success('Booking rejected');
      } else {
        toast.error('Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    } finally {
      setProcessing(null);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#4e342e] text-xl">Loading pending requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-4">
            Pending Booking Requests
          </h1>
          <p className="text-xl text-[#6d4c41]">
            Review and approve customer booking requests
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-[#4e342e] mb-2">
                {pendingBookings.length}
              </div>
              <div className="text-[#6d4c41]">Pending Requests</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-[#4e342e] mb-2">
                {availableBeauticians.length}
              </div>
              <div className="text-[#6d4c41]">Available Beauticians</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-[#4e342e] mb-2">
                Manager
              </div>
              <div className="text-[#6d4c41]">Control Panel</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings List */}
        {pendingBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-[#f8d7da]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-[#4e342e]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#4e342e] mb-4">
              No Pending Requests
            </h3>
            <p className="text-[#6d4c41] text-lg">
              All booking requests have been processed
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {pendingBookings.map((booking) => (
              <motion.div key={booking.id} variants={fadeInUp}>
                <Card className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-2">
                              {booking.serviceName}
                            </h3>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#4e342e]">
                              {booking.totalAmount.toLocaleString()} CDF
                            </div>
                            <div className="text-sm text-[#6d4c41]">Total Amount</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center text-[#6d4c41]">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-[#6d4c41]">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center text-[#6d4c41]">
                            <User className="w-4 h-4 mr-2" />
                            <span>{booking.customerDetails.name}</span>
                          </div>
                          <div className="flex items-center text-[#6d4c41]">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{booking.customerDetails.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center text-[#6d4c41] mb-4">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{booking.customerDetails.address}</span>
                        </div>

                        {booking.customerDetails.notes && (
                          <div className="bg-[#f8d7da]/20 rounded-lg p-4">
                            <div className="text-sm font-semibold text-[#4e342e] mb-1">Special Instructions:</div>
                            <div className="text-sm text-[#6d4c41]">{booking.customerDetails.notes}</div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-4 lg:w-80">
                        {/* Beautician Selection */}
                        <div>
                          <label className="text-sm font-semibold text-[#4e342e] mb-2 block">
                            Assign Beautician:
                          </label>
                          <Select 
                            value={selectedBeautician} 
                            onValueChange={setSelectedBeautician}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a beautician" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableBeauticians.map((beautician) => (
                                <SelectItem key={beautician.id} value={beautician.id}>
                                  <div className="flex items-center">
                                    <div className="mr-3">
                                      <div className="w-8 h-8 bg-[#4e342e] rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-semibold">{beautician.name}</div>
                                      <div className="text-xs text-[#6d4c41]">
                                        {beautician.skills.join(', ')} • {beautician.experience} years
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveBooking(booking.id)}
                            disabled={!selectedBeautician || processing === booking.id}
                          >
                            {processing === booking.id ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={processing === booking.id}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Beautician Info */}
        {availableBeauticians.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e]">
                  Available Beauticians
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBeauticians.map((beautician) => (
                    <div key={beautician.id} className="border border-[#f8d7da] rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#4e342e] rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#4e342e]">{beautician.name}</div>
                          <div className="text-sm text-[#6d4c41]">{beautician.experience} years experience</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-[#6d4c41]">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" />
                          <span>{beautician.rating}/5.0 rating</span>
                        </div>
                        <div className="text-sm text-[#6d4c41]">
                          <strong>Skills:</strong> {beautician.skills.join(', ')}
                        </div>
                        <div className="text-sm text-[#6d4c41]">
                          <strong>Phone:</strong> {beautician.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ManagerRequests;

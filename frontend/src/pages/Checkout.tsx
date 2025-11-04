import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, MapPin, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getServiceById, createBooking, Service } from '@/api/mockBooking';
import MockPayment from '@/components/MockPayment';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface PaymentData {
  method: string;
  transactionId: string;
  amount: number;
  timestamp: string;
}

const Checkout: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    phone: '',
    address: '',
    notes: '',
    scheduledDate: new Date(),
    scheduledTime: '10:00'
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        navigate('/customer/at-home-services');
        return;
      }

      try {
        const serviceData = getServiceById(serviceId);
        if (!serviceData) {
          toast.error('Service not found');
          navigate('/customer/at-home-services');
          return;
        }
        setService(serviceData);
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Error loading service details');
        navigate('/customer/at-home-services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, navigate]);

  const handleInputChange = (field: string, value: string | Date) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceedToPayment = () => {
    // Validate required fields
    if (!bookingData.customerName || !bookingData.phone || !bookingData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData: PaymentData) => {
    try {
      if (!service || !user?.id) {
        toast.error('Missing service or user information');
        return;
      }

      const newBooking = await createBooking({
        customerId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        status: 'pending_approval',
        paymentStatus: 'paid',
        scheduledDate: bookingData.scheduledDate.toISOString().split('T')[0],
        scheduledTime: bookingData.scheduledTime,
        totalAmount: service.price,
        customerDetails: {
          name: bookingData.customerName,
          phone: bookingData.phone,
          address: bookingData.address,
          notes: bookingData.notes
        }
      });

      setPaymentCompleted(true);
      toast.success('Booking created successfully! Awaiting manager approval.');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#4e342e] text-xl">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#4e342e] text-xl">Service not found</div>
          <Button 
            className="mt-4 bg-[#4e342e] hover:bg-[#3b2c26] text-white"
            onClick={() => navigate('/customer/at-home-services')}
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-[#6d4c41] mb-6">
            Your booking has been submitted and is awaiting manager approval. 
            You'll receive updates on your dashboard.
          </p>
          <Button 
            className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
            onClick={() => navigate('/customer/dashboard')}
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MockPayment
            amount={service.price}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPayment(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-4">
            Complete Your Booking
          </h1>
          <p className="text-xl text-[#6d4c41]">
            Fill in your details to book your {service.name}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div 
            className="lg:col-span-2"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-6">
                  Booking Details
                </h2>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-[#4e342e] font-semibold">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={bookingData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        className="mt-1"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[#4e342e] font-semibold">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                        placeholder="+243 123 456 789"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-[#4e342e] font-semibold">
                      Address *
                    </Label>
                    <Textarea
                      id="address"
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1"
                      placeholder="Enter your complete address"
                      rows={3}
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#4e342e] font-semibold">Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !bookingData.scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingData.scheduledDate ? (
                              format(bookingData.scheduledDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={bookingData.scheduledDate}
                            onSelect={(date) => date && handleInputChange('scheduledDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-[#4e342e] font-semibold">
                        Preferred Time *
                      </Label>
                      <select
                        id="time"
                        value={bookingData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        className="w-full mt-1 p-3 border border-[#f8d7da] rounded-lg focus:ring-2 focus:ring-[#4e342e] focus:border-transparent"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-[#4e342e] font-semibold">
                      Special Instructions (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={bookingData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="mt-1"
                      placeholder="Any special requests or instructions for the beautician"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Summary */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl sticky top-8">
              <CardContent className="p-8">
                <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-6">
                  Service Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-xl flex items-center justify-center mr-3">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#4e342e]">{service.name}</div>
                      <div className="text-sm text-[#6d4c41]">{service.duration} minutes</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-xl flex items-center justify-center mr-3">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#4e342e]">At Your Home</div>
                      <div className="text-sm text-[#6d4c41]">Professional service at your location</div>
                    </div>
                  </div>

                  {service.includesProducts && (
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#4e342e] rounded-xl flex items-center justify-center mr-3">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#4e342e]">Products Included</div>
                        <div className="text-sm text-[#6d4c41]">Beautician brings all products</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#f8d7da] pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#4e342e]">Total Amount</span>
                    <span className="text-2xl font-bold text-[#4e342e]">
                      {service.price.toLocaleString()} CDF
                    </span>
                  </div>

                  <Button 
                    className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white py-4 text-lg font-semibold rounded-xl"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline"
            className="border-2 border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MapPin,
  User,
  Phone,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Home,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  quantity: number;
  salonId?: string;
  salonName?: string;
}

interface BookingForm {
  date: Date | undefined;
  time: string;
  address: string;
  phone: string;
  notes: string;
  beauticianPreference: string;
}

const BookingConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    date: undefined,
    time: '',
    address: '',
    phone: '',
    notes: '',
    beauticianPreference: 'any'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    loadSelectedServices();
  }, []);

  const loadSelectedServices = () => {
    try {
      // Check if there's state from navigation
      const state = location.state as any;
      if (state?.serviceName) {
        // Single service from WithProductsBooking or WithoutProductsBooking
        const service: SelectedService = {
          id: Date.now().toString(),
          name: state.serviceName,
          category: state.category || 'beauty',
          price: state.price || 50,
          duration: 60,
          description: `${state.serviceName} - At Home Service`,
          quantity: 1,
          image: '',
          withProducts: state.type === 'with-products'
        };
        setSelectedServices([service]);
      } else {
        const stored = sessionStorage.getItem('selectedServices');
        if (stored) {
          setSelectedServices(JSON.parse(stored));
        } else {
          toast.error('No services selected');
          navigate('/customer/at-home-services');
        }
      }
    } catch (error) {
      console.error('Error loading selected services:', error);
      toast.error('Error loading services');
      navigate('/customer/at-home-services');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + (service.price * service.quantity), 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + (service.duration * service.quantity), 0);
  };

  const isAtHomeService = () => {
    return selectedServices.some(service => !service.salonId);
  };

  const handleSubmit = async () => {
    if (!bookingForm.date || !bookingForm.time) {
      toast.error('Please select date and time');
      return;
    }

    if (isAtHomeService() && !bookingForm.address) {
      toast.error('Please provide your address for at-home service');
      return;
    }

    if (!bookingForm.phone) {
      toast.error('Please provide your phone number');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate booking creation
      const bookingData = {
        services: selectedServices,
        date: bookingForm.date,
        time: bookingForm.time,
        address: bookingForm.address,
        phone: bookingForm.phone,
        notes: bookingForm.notes,
        beauticianPreference: bookingForm.beauticianPreference,
        totalPrice: getTotalPrice(),
        totalDuration: getTotalDuration(),
        type: isAtHomeService() ? 'At-Home Service' : 'Salon Visit'
      };

      // Store booking data for payment page
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
      
      toast.success('Booking confirmed! Proceeding to payment...');
      
      // Navigate to payment page
      setTimeout(() => {
        navigate('/customer/payment');
      }, 1000);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading booking details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-[#4e342e] hover:text-[#3b2c26]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
          
          <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-4">
            Confirm Your Booking
          </h1>
          <p className="text-lg text-[#6d4c41]">
            Review your selected services and provide booking details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date and Time Selection */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-[#4e342e] font-medium">
                      Select Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-[#4e342e] text-[#4e342e] hover:bg-[#fdf6f0]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingForm.date ? format(bookingForm.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bookingForm.date}
                          onSelect={(date) => setBookingForm(prev => ({ ...prev, date }))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time" className="text-[#4e342e] font-medium">
                      Select Time
                    </Label>
                    <Select value={bookingForm.time} onValueChange={(value) => setBookingForm(prev => ({ ...prev, time: value }))}>
                      <SelectTrigger className="border-[#4e342e] text-[#4e342e]">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-[#4e342e] font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+243 123 456 789"
                    className="border-[#4e342e] text-[#4e342e]"
                  />
                </div>

                {isAtHomeService() && (
                  <div>
                    <Label htmlFor="address" className="text-[#4e342e] font-medium">
                      Service Address *
                    </Label>
                    <Input
                      id="address"
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your complete address"
                      className="border-[#4e342e] text-[#4e342e]"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="beauticianPreference" className="text-[#4e342e] font-medium">
                    Beautician Preference
                  </Label>
                  <Select value={bookingForm.beauticianPreference} onValueChange={(value) => setBookingForm(prev => ({ ...prev, beauticianPreference: value }))}>
                    <SelectTrigger className="border-[#4e342e] text-[#4e342e]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available Beautician</SelectItem>
                      <SelectItem value="female">Female Beautician</SelectItem>
                      <SelectItem value="male">Male Beautician</SelectItem>
                      <SelectItem value="experienced">Experienced Beautician (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-[#4e342e] font-medium">
                    Special Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or notes for the beautician..."
                    className="border-[#4e342e] text-[#4e342e]"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e]">
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Service Type */}
                  <div className="flex items-center gap-2 text-[#4e342e]">
                    {isAtHomeService() ? (
                      <Home className="w-4 h-4" />
                    ) : (
                      <Building className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {isAtHomeService() ? 'At-Home Service' : 'Salon Visit'}
                    </span>
                  </div>

                  {/* Selected Services */}
                  <div>
                    <h4 className="font-medium text-[#4e342e] mb-2">Selected Services</h4>
                    <div className="space-y-2">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6d4c41]">
                              {service.name} {service.quantity > 1 && `(x${service.quantity})`}
                            </span>
                            <span className="font-medium text-[#4e342e]">
                              {(service.price * service.quantity).toLocaleString()} CDF
                            </span>
                          </div>
                          {service.salonName && (
                            <div className="text-xs text-[#6d4c41] ml-2">
                              at {service.salonName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  {bookingForm.date && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#6d4c41]">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{format(bookingForm.date, "PPP")}</span>
                      </div>
                      {bookingForm.time && (
                        <div className="flex items-center gap-2 text-[#6d4c41]">
                          <Clock className="w-4 h-4" />
                          <span>{bookingForm.time}</span>
                        </div>
                      )}
                      {isAtHomeService() && bookingForm.address && (
                        <div className="flex items-center gap-2 text-[#6d4c41]">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">{bookingForm.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6d4c41]">Total Duration:</span>
                      <span className="font-medium text-[#4e342e]">{getTotalDuration()} min</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-[#4e342e]">Total Price:</span>
                      <span className="text-[#4e342e]">{getTotalPrice().toLocaleString()} CDF</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white mt-4"
                    onClick={handleSubmit}
                    disabled={submitting || !bookingForm.date || !bookingForm.time || !bookingForm.phone}
                  >
                    {submitting ? 'Processing...' : 'Confirm & Pay'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingConfirmationPage;

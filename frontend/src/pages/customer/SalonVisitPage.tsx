import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  Building, 
  MapPin, 
  Phone, 
  Star, 
  Clock, 
  DollarSign, 
  Search,
  ArrowRight,
  Scissors,
  Sparkles,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { getMockData } from '@/utils/mockData';

interface SalonService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  services: SalonService[];
}

interface SelectedService extends SalonService {
  salonId: string;
  salonName: string;
  quantity: number;
}

const SalonVisitPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useSupabaseAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const mockData = getMockData.customers();
      setSalons(mockData.services.salon);
    } catch (error) {
      console.error('Error loading salons:', error);
      toast.error('Failed to load salons');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (service: SalonService, salon: Salon) => {
    const serviceKey = `${salon.id}-${service.id}`;
    const existingService = selectedServices.find(s => `${s.salonId}-${s.id}` === serviceKey);
    
    if (existingService) {
      setSelectedServices(prev => 
        prev.map(s => 
          `${s.salonId}-${s.id}` === serviceKey
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [...prev, { 
        ...service, 
        salonId: salon.id,
        salonName: salon.name,
        quantity: 1 
      }]);
    }

    // Publish to global cart
    addItem({
      id: serviceKey,
      name: `${service.name}`,
      price: service.price,
      duration: service.duration,
      category: 'salon',
      description: `From ${salon.name}`,
    }, 1);
    toast.success(`${service.name} from ${salon.name} added to cart`);
  };

  const removeFromCart = (serviceKey: string) => {
    setSelectedServices(prev => prev.filter(s => `${s.salonId}-${s.id}` !== serviceKey));
    toast.success('Service removed from cart');
  };

  const updateQuantity = (serviceKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceKey);
      return;
    }
    setSelectedServices(prev => 
      prev.map(s => 
        `${s.salonId}-${s.id}` === serviceKey
          ? { ...s, quantity }
          : s
      )
    );
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + (service.price * service.quantity), 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + (service.duration * service.quantity), 0);
  };

  const filteredSalons = () => {
    if (!searchTerm) return salons;
    
    return salons.filter(salon =>
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.services.some(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const proceedToBooking = () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      // Store selected services in session storage for after login
      sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
      sessionStorage.setItem('redirectAfterLogin', '/customer/booking-confirmation');
      toast.info('Please login to continue with your booking');
      navigate('/login');
      return;
    }
    
    // Store selected services in session storage for the booking flow
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    navigate('/customer/booking-confirmation');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading salons...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4e342e] mb-2 sm:mb-4">
            Salon Visits
          </h1>
          <p className="text-base sm:text-lg text-[#6d4c41]">
            Book appointments at verified salons near you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Salons Section */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search salons or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Salons List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredSalons().map((salon) => (
                <Card key={salon.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-serif text-[#4e342e] mb-2 leading-tight">
                          {salon.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-[#6d4c41]">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {salon.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {salon.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(salon.rating)}
                        <span className="ml-2 text-sm text-[#6d4c41]">
                          {salon.rating}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-[#4e342e] mb-3">Available Services</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {salon.services.map((service) => (
                          <div key={service.id} className="border border-[#fdf6f0] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-[#4e342e]">{service.name}</h5>
                              <Badge variant="secondary" className="bg-[#fdf6f0] text-[#4e342e]">
                                {service.duration} min
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1 text-[#6d4c41]">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">{service.price.toLocaleString()} CDF</span>
                              </div>
                            </div>

                            <Button 
                              size="sm"
                              className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                              onClick={() => addToCart(service, salon)}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSalons().length === 0 && (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                <p className="text-xl font-semibold text-[#4e342e] mb-2">No salons found</p>
                <p className="text-[#6d4c41]">Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-[#4e342e]">
                  Selected Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedServices.length === 0 ? (
                  <p className="text-[#6d4c41] text-center py-4">
                    No services selected
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedServices.map((service) => {
                      const serviceKey = `${service.salonId}-${service.id}`;
                      return (
                        <div key={serviceKey} className="border-b border-[#fdf6f0] pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-[#4e342e] text-sm">{service.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(serviceKey)}
                              className="text-red-500 hover:text-red-600"
                            >
                              ×
                            </Button>
                          </div>
                          
                          <p className="text-xs text-[#6d4c41] mb-2">{service.salonName}</p>
                          
                          <div className="flex items-center justify-between text-sm text-[#6d4c41] mb-2">
                            <span>{service.price.toLocaleString()} CDF</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(serviceKey, service.quantity - 1)}
                                className="w-6 h-6 p-0"
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{service.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(serviceKey, service.quantity + 1)}
                                className="w-6 h-6 p-0"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-sm font-medium text-[#4e342e]">
                            Total: {(service.price * service.quantity).toLocaleString()} CDF
                          </div>
                        </div>
                      );
                    })}

                    <Separator />

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
                      onClick={proceedToBooking}
                    >
                      Proceed to Booking
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalonVisitPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  Home, 
  Scissors, 
  Sparkles, 
  Heart, 
  Clock, 
  DollarSign, 
  Search,
  ArrowRight,
  Star,
  MapPin,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { getMockData } from '@/utils/mockData';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface SelectedService extends Service {
  quantity: number;
}

const AtHomeServicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useSupabaseAuth();
  const [services, setServices] = useState<{ [key: string]: Service[] }>({});
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const mockData = getMockData.customers();
      setServices(mockData.services.atHome);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All Services', icon: Home },
    { key: 'hair', label: 'Hair Styling', icon: Scissors },
    { key: 'face', label: 'Facial Treatment', icon: Sparkles },
    { key: 'extras', label: 'Nail Care', icon: Heart }
  ];

  const addToCart = (service: Service) => {
    // Update local selection UI
    const existingService = selectedServices.find(s => s.id === service.id);
    if (existingService) {
      setSelectedServices(prev => 
        prev.map(s => 
          s.id === service.id 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [...prev, { ...service, quantity: 1 }]);
    }
    // Publish to global cart
    addItem({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
    }, 1);
    toast.success(`${service.name} added to cart`);
  };

  const removeFromCart = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    toast.success('Service removed from cart');
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setSelectedServices(prev => 
      prev.map(s => 
        s.id === serviceId 
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

  const filteredServices = () => {
    let allServices: Service[] = [];
    
    if (selectedCategory === 'all') {
      allServices = Object.values(services).flat();
    } else {
      allServices = services[selectedCategory] || [];
    }

    if (searchTerm) {
      allServices = allServices.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allServices;
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading services...</div>
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
            At-Home Beauty Services
          </h1>
          <p className="text-base sm:text-lg text-[#6d4c41]">
            Professional beauty services delivered to your doorstep
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Services Section */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                        selectedCategory === category.key
                          ? "bg-[#4e342e] text-white"
                          : "border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                      }`}
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{category.label}</span>
                      <span className="xs:hidden">{category.label.split(' ')[0]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredServices().map((service) => (
                <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg sm:text-xl font-serif text-[#4e342e] leading-tight">
                        {service.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-[#fdf6f0] text-[#4e342e] text-xs shrink-0">
                        {service.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-[#6d4c41] mb-3 sm:mb-4 text-sm sm:text-base">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#6d4c41]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                          {service.price.toLocaleString()} CDF
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white text-sm sm:text-base"
                      onClick={() => addToCart(service)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices().length === 0 && (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                <p className="text-xl font-semibold text-[#4e342e] mb-2">No services found</p>
                <p className="text-[#6d4c41]">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-4 sm:top-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-serif text-[#4e342e]">
                  Selected Services
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedServices.length === 0 ? (
                  <p className="text-[#6d4c41] text-center py-4 text-sm sm:text-base">
                    No services selected
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="border-b border-[#fdf6f0] pb-3 sm:pb-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h4 className="font-medium text-[#4e342e] text-sm sm:text-base leading-tight">{service.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(service.id)}
                            className="text-red-500 hover:text-red-600 shrink-0 p-1"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs sm:text-sm text-[#6d4c41] mb-2">
                          <span>{service.price.toLocaleString()} CDF</span>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(service.id, service.quantity - 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 p-0 text-xs"
                            >
                              -
                            </Button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{service.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(service.id, service.quantity + 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 p-0 text-xs"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs sm:text-sm font-medium text-[#4e342e]">
                          Total: {(service.price * service.quantity).toLocaleString()} CDF
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[#6d4c41]">Total Duration:</span>
                        <span className="font-medium text-[#4e342e]">{getTotalDuration()} min</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg font-semibold">
                        <span className="text-[#4e342e]">Total Price:</span>
                        <span className="text-[#4e342e]">{getTotalPrice().toLocaleString()} CDF</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white mt-3 sm:mt-4 text-sm sm:text-base"
                      onClick={proceedToBooking}
                    >
                      <span className="hidden sm:inline">Proceed to Booking</span>
                      <span className="sm:hidden">Book Now</span>
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

export default AtHomeServicesPage;

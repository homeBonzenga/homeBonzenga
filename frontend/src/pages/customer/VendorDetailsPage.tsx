import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  MapPin,
  Star,
  Clock,
  Users,
  Phone,
  Mail,
  Calendar,
  Scissors,
  Palette,
  Sparkles,
  Award,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Building,
  Heart,
  Share2,
  CheckCircle
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  distance: number;
  categories: string[];
  images: string[];
  isOpen: boolean;
  nextAvailableSlot: string;
  phone: string;
  email: string;
  workingHours: {
    [key: string]: string;
  };
}

interface Beautician {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  experience: number;
  avatar: string;
  isAvailable: boolean;
  nextAvailableSlot: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  beauticianId?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  category: string;
}

const VendorDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [beauticians, setBeauticians] = useState<Beautician[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching vendor details for ID:', id);
      const response = await fetch(`http://localhost:3001/api/vendors/${id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch vendor details:', errorText);
        throw new Error('Failed to fetch vendor details');
      }
      
      const data = await response.json();
      console.log('Vendor data received:', data);
      
      // Transform vendor data - API returns vendor with nested data
      if (data.vendor) {
        const transformedVendor: Vendor = {
          id: data.vendor.id,
          name: data.vendor.name || data.vendor.shopName,
          description: data.vendor.description || '',
          address: data.vendor.address || '',
          city: data.vendor.city,
          rating: data.vendor.rating || 4.8,
          reviewCount: data.vendor.reviewCount || 0,
          distance: data.vendor.distance || 0,
          categories: data.vendor.categories || [],
          images: data.vendor.images || [],
          isOpen: data.vendor.isOpen !== undefined ? data.vendor.isOpen : true,
          nextAvailableSlot: data.vendor.nextAvailableSlot || 'Available today',
          phone: data.vendor.phone || '',
          email: data.vendor.email || '',
          workingHours: data.vendor.workingHours || {}
        };
        
        setVendor(transformedVendor);
        
        // Transform services - API returns services as separate array
        console.log('Services data from API:', data.services);
        const transformedServices: Service[] = (data.services || []).map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: service.price,
          duration: service.duration || 60,
          category: service.category || 'General',
          image: service.image || '/api/placeholder/300/200',
          isAvailable: service.isActive !== undefined ? service.isActive : true
        }));
        
        console.log('Transformed services:', transformedServices);
        setServices(transformedServices);
      }
      
      // Set mock data for beauticians and products for now
      setBeauticians(data.beauticians || []);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      // Fallback to mock data if API fails
      const mockVendor: Vendor = {
        id: id || '1',
        name: 'Elite Beauty Salon',
        description: 'Premium beauty services with certified professionals. We offer a wide range of beauty treatments in a luxurious and comfortable environment.',
        address: '123 Main Street, Downtown',
        city: 'New York',
        rating: 4.8,
        reviewCount: 127,
        distance: 0.5,
        categories: ['hair', 'face', 'makeup'],
        images: ['/api/placeholder/800/400', '/api/placeholder/800/400'],
        isOpen: true,
        nextAvailableSlot: 'Today 2:00 PM',
        phone: '+1 (555) 123-4567',
        email: 'info@elitebeauty.com',
        workingHours: {
          'Monday': '9:00 AM - 7:00 PM',
          'Tuesday': '9:00 AM - 7:00 PM',
          'Wednesday': '9:00 AM - 7:00 PM',
          'Thursday': '9:00 AM - 7:00 PM',
          'Friday': '9:00 AM - 8:00 PM',
          'Saturday': '8:00 AM - 6:00 PM',
          'Sunday': '10:00 AM - 5:00 PM'
        }
      };

      const mockBeauticians: Beautician[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          specialization: ['Hair Styling', 'Hair Coloring'],
          rating: 4.9,
          experience: 8,
          avatar: '/api/placeholder/100/100',
          isAvailable: true,
          nextAvailableSlot: 'Today 3:00 PM'
        },
        {
          id: '2',
          name: 'Maria Garcia',
          specialization: ['Facial Treatments', 'Makeup'],
          rating: 4.7,
          experience: 6,
          avatar: '/api/placeholder/100/100',
          isAvailable: true,
          nextAvailableSlot: 'Tomorrow 10:00 AM'
        },
        {
          id: '3',
          name: 'Lisa Chen',
          specialization: ['Nail Art', 'Manicure', 'Pedicure'],
          rating: 4.8,
          experience: 5,
          avatar: '/api/placeholder/100/100',
          isAvailable: false,
          nextAvailableSlot: 'Monday 2:00 PM'
        }
      ];

      const mockServices: Service[] = [
        {
          id: '1',
          name: 'Haircut & Styling',
          description: 'Professional haircut with styling and blow-dry',
          duration: 60,
          price: 45,
          category: 'hair'
        },
        {
          id: '2',
          name: 'Hair Coloring',
          description: 'Full hair coloring service with premium products',
          duration: 120,
          price: 120,
          category: 'hair'
        },
        {
          id: '3',
          name: 'Facial Treatment',
          description: 'Deep cleansing facial with moisturizing mask',
          duration: 90,
          price: 80,
          category: 'face'
        },
        {
          id: '4',
          name: 'Manicure',
          description: 'Classic manicure with nail polish',
          duration: 45,
          price: 25,
          category: 'nail'
        }
      ];

      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Hair Shampoo',
          description: 'Professional grade shampoo for all hair types',
          price: 25,
          image: '/api/placeholder/150/150',
          inStock: true,
          category: 'hair'
        },
        {
          id: '2',
          name: 'Anti-Aging Face Cream',
          description: 'Luxury face cream with anti-aging properties',
          price: 45,
          image: '/api/placeholder/150/150',
          inStock: true,
          category: 'face'
        },
        {
          id: '3',
          name: 'Nail Art Kit',
          description: 'Complete nail art kit with tools and colors',
          price: 35,
          image: '/api/placeholder/150/150',
          inStock: false,
          category: 'nail'
        }
      ];

      setVendor(mockVendor);
      setBeauticians(mockBeauticians);
      setServices(mockServices);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const addService = (service: Service) => {
    setSelectedServices(prev => [...prev, service]);
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newProducts = { ...selectedProducts };
      delete newProducts[productId];
      setSelectedProducts(newProducts);
    } else {
      setSelectedProducts(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  const getTotalPrice = () => {
    const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const productsTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    return servicesTotal + productsTotal;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4e342e] mx-auto mb-4"></div>
            <p className="text-[#6d4c41]">Loading vendor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Building className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#4e342e] mb-2">Vendor not found</h2>
            <p className="text-[#6d4c41] mb-6">The salon you're looking for doesn't exist.</p>
            <Link to="/salon-visit">
              <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Salons
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="pt-20 pb-8 bg-gradient-to-br from-[#fdf6f0] to-[#f8d7da]/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/salon-visit">
              <Button variant="outline" size="sm" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-bold text-[#4e342e]">{vendor.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-[#6d4c41] font-medium">{vendor.rating}</span>
                  <span className="text-[#6d4c41]">({vendor.reviewCount} reviews)</span>
                </div>
                <Badge className={`px-3 py-1 ${
                  vendor.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vendor.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div {...fadeInUp}>
                <Card className="border-0 bg-white shadow-lg mb-6">
                  <div className="h-64 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-t-lg flex items-center justify-center">
                    <Building className="w-20 h-20 text-white/80" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-[#6d4c41] leading-relaxed mb-6">{vendor.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-[#4e342e]" />
                        <div>
                          <p className="font-medium text-[#4e342e]">Address</p>
                          <p className="text-[#6d4c41]">{vendor.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-[#4e342e]" />
                        <div>
                          <p className="font-medium text-[#4e342e]">Phone</p>
                          <p className="text-[#6d4c41]">{vendor.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-[#4e342e]" />
                        <div>
                          <p className="font-medium text-[#4e342e]">Email</p>
                          <p className="text-[#6d4c41]">{vendor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-[#4e342e]" />
                        <div>
                          <p className="font-medium text-[#4e342e]">Next Available</p>
                          <p className="text-[#6d4c41]">{vendor.nextAvailableSlot}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#4e342e] mb-3">Working Hours</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(vendor.workingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between text-sm">
                            <span className="text-[#4e342e] font-medium">{day}</span>
                            <span className="text-[#6d4c41]">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabs */}
              <Tabs defaultValue="services" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#f8d7da]/20">
                  <TabsTrigger value="services" className="data-[state=active]:bg-[#4e342e] data-[state=active]:text-white">
                    Services
                  </TabsTrigger>
                  <TabsTrigger value="beauticians" className="data-[state=active]:bg-[#4e342e] data-[state=active]:text-white">
                    Beauticians
                  </TabsTrigger>
                  <TabsTrigger value="products" className="data-[state=active]:bg-[#4e342e] data-[state=active]:text-white">
                    Products
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-6">
                  {services.length === 0 ? (
                    <div className="text-center py-12 bg-[#f8d7da]/20 rounded-xl">
                      <Scissors className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-[#4e342e] mb-2">No services available</p>
                      <p className="text-[#6d4c41]">This vendor hasn't added any services yet.</p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <Card key={service.id} className="border-0 bg-white shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-[#4e342e]">{service.name}</h3>
                            <span className="text-xl font-bold text-[#4e342e]">${service.price}</span>
                          </div>
                          <p className="text-[#6d4c41] mb-4">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-[#6d4c41]">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {service.duration} min
                              </span>
                              <Badge variant="secondary">{service.category}</Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addService(service)}
                              className="bg-[#4e342e] hover:bg-[#6d4c41] text-white"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  )}
                </TabsContent>

                <TabsContent value="beauticians" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {beauticians.map((beautician) => (
                      <Card key={beautician.id} className="border-0 bg-white shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {beautician.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-[#4e342e] mb-2">{beautician.name}</h3>
                          <div className="flex items-center justify-center space-x-1 mb-3">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-[#6d4c41] font-medium">{beautician.rating}</span>
                          </div>
                          <p className="text-sm text-[#6d4c41] mb-3">{beautician.experience} years experience</p>
                          <div className="flex flex-wrap gap-1 justify-center mb-4">
                            {beautician.specialization.map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                          <Badge className={`px-3 py-1 ${
                            beautician.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {beautician.isAvailable ? 'Available' : 'Busy'}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="products" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="border-0 bg-white shadow-lg">
                        <div className="h-32 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-t-lg flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white/80" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-[#4e342e]">{product.name}</h3>
                            <span className="font-bold text-[#4e342e]">${product.price}</span>
                          </div>
                          <p className="text-sm text-[#6d4c41] mb-3">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant={product.inStock ? "default" : "secondary"}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                            {product.inStock && (
                              <div className="flex items-center space-x-2">
                                {selectedProducts[product.id] ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateProductQuantity(product.id, selectedProducts[product.id] - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center">{selectedProducts[product.id]}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateProductQuantity(product.id, selectedProducts[product.id] + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => updateProductQuantity(product.id, 1)}
                                    className="bg-[#4e342e] hover:bg-[#6d4c41] text-white"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <motion.div {...fadeInUp}>
                <Card className="border-0 bg-white shadow-lg sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-[#4e342e] flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedServices.length === 0 && Object.keys(selectedProducts).length === 0 ? (
                      <p className="text-[#6d4c41] text-center py-8">No items selected</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex justify-between items-center p-3 bg-[#f8d7da]/20 rounded-lg">
                            <div>
                              <p className="font-medium text-[#4e342e]">{service.name}</p>
                              <p className="text-sm text-[#6d4c41]">{service.duration} min</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-[#4e342e]">${service.price}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeService(service.id)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {Object.entries(selectedProducts).map(([productId, quantity]) => {
                          const product = products.find(p => p.id === productId);
                          if (!product) return null;
                          return (
                            <div key={productId} className="flex justify-between items-center p-3 bg-[#f8d7da]/20 rounded-lg">
                              <div>
                                <p className="font-medium text-[#4e342e]">{product.name}</p>
                                <p className="text-sm text-[#6d4c41]">Qty: {quantity}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-[#4e342e]">${product.price * quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateProductQuantity(productId, quantity - 1)}
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-lg font-bold text-[#4e342e]">
                            <span>Total</span>
                            <span>${getTotalPrice()}</span>
                          </div>
                        </div>
                        
                        <Link to="/booking/checkout" state={{ 
                          vendor, 
                          services: selectedServices, 
                          products: Object.entries(selectedProducts).map(([id, qty]) => ({
                            ...products.find(p => p.id === id)!,
                            quantity: qty
                          }))
                        }}>
                          <Button className="w-full bg-[#4e342e] hover:bg-[#6d4c41] text-white py-3">
                            <Calendar className="w-4 h-4 mr-2" />
                            Proceed to Booking
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsPage;

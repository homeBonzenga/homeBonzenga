import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Building,
  UserCheck,
  Star,
  Shield,
  Clock,
  CreditCard,
  CheckCircle,
  Sparkles,
  Heart,
  Users,
  Calendar,
  ArrowRight,
  Scissors,
  Palette,
  Award,
  MapPin,
  Phone,
  Mail,
  Package,
  Settings,
  Brush,
  Droplets
} from 'lucide-react';

// Assets
import hero3 from '@/assets/hero3.jpg';
import hair4 from '@/assets/hair4.jpg';
import makeup5 from '@/assets/makeup5.jpg';
import spa1 from '@/assets/spa1.jpg';
import nail from '@/assets/nail.jpg';

interface Vendor {
  id: string;
  shopName: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
  };
  services: any[];
}

const SalonVisitPage = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/vendors?status=APPROVED');
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      
      const data = await response.json();
      
      // Transform the data to match our interface
      const transformedVendors = (data.vendors || data.data || []).map((vendor: any) => ({
        id: vendor.id,
        shopName: vendor.shopName || vendor.name,
        description: vendor.description || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zipCode: vendor.zipCode || '',
        status: vendor.status,
        user: vendor.user || { firstName: '', lastName: '' },
        services: vendor.services || []
      }));
      
      setVendors(transformedVendors);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load salons. Please try again later.');
      // Fallback to empty array or show message
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (vendorId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/vendor/${vendorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6f0]">
        <Navigation />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4e342e] mx-auto mb-4"></div>
            <p className="text-[#6d4c41]">Loading salons...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#fdf6f0] to-[#f8f4f0] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 rounded-full bg-[#f8d7da]/20 text-[#4e342e] text-sm font-medium mb-6"
                variants={fadeInUp}
              >
                <Building className="w-4 h-4 mr-2" />
                Premium Salon Experience
              </motion.div>

              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#4e342e] mb-6 leading-tight"
                variants={fadeInUp}
              >
                Visit Our
                <span className="block text-[#6d4c41]">Partner Salons</span>
              </motion.h1>

              <motion.p 
                className="text-lg text-[#6d4c41] leading-relaxed max-w-lg font-sans mb-8"
                variants={fadeInUp}
              >
                Discover our network of verified partner salons offering premium beauty services in a professional environment.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Link to="/login">
                  <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Building className="w-5 h-5 mr-2" />
                    Find a Salon
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="border-2 border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={hero3}
                  alt="Salon Beauty Services"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20" />
                
                {/* Floating Badge */}
                <motion.div 
                  className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#4e342e]">Verified Salons</p>
                      <p className="text-sm text-[#6d4c41]">Professional & Safe</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Why Choose Our Partner Salons?
            </h2>
            <p className="text-lg text-[#6d4c41] max-w-2xl mx-auto">
              We partner with the finest salons to bring you exceptional beauty services in a professional environment.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Verified & Safe",
                description: "All our partner salons are thoroughly vetted for safety and quality standards."
              },
              {
                icon: Star,
                title: "Premium Quality",
                description: "Experience top-tier beauty services with professional-grade products and equipment."
              },
              {
                icon: Clock,
                title: "Flexible Booking",
                description: "Book appointments that fit your schedule with our easy online booking system."
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-[#fdf6f0]">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-[#6d4c41] leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partner Salons Section */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Our Partner Salons
            </h2>
            <p className="text-lg text-[#6d4c41] max-w-2xl mx-auto">
              Discover our network of premium salons offering exceptional beauty services.
            </p>
          </motion.div>

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {vendors.length === 0 && !loading && (
            <div className="text-center py-16">
              <Building className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
              <p className="text-xl text-[#4e342e] font-semibold mb-2">No salons available</p>
              <p className="text-[#6d4c41]">Check back later for new partner salons.</p>
            </div>
          )}

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {vendors.map((salon, index) => (
              <motion.div key={salon.id} variants={fadeInUp}>
                <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden rounded-3xl">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#4e342e] to-[#6d4c41]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building className="w-16 h-16 text-white/30" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10 group-hover:from-black/50 group-hover:to-black/20 transition-all duration-300" />
                    
                    {salon.status === 'APPROVED' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-serif font-bold text-[#4e342e]">
                        {salon.shopName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-[#6d4c41]">
                          4.8
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-[#6d4c41] mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{salon.address}, {salon.city}, {salon.state}</span>
                    </div>
                    
                    {salon.description && (
                      <p className="text-sm text-[#6d4c41] mb-4 line-clamp-2">{salon.description}</p>
                    )}
                    
                    <div className="mb-6">
                      <p className="text-sm font-medium text-[#4e342e] mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {salon.services && salon.services.length > 0 ? (
                          salon.services.slice(0, 3).map((service: any, idx: number) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-[#f8d7da]/20 text-[#4e342e] text-xs rounded-full"
                            >
                              {service.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#6d4c41]">No services listed</span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white rounded-xl transition-all duration-300"
                      onClick={() => handleBookAppointment(salon.id)}
                    >
                      Book Appointment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#4e342e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
              Ready to Experience Premium Salon Services?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust our partner salons for their beauty needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-white text-[#4e342e] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-[#4e342e] px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SalonVisitPage;

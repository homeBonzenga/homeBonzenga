import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { 
  Home, 
  Clock, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Package,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
interface ServiceCategory {
  category: string;
  services: string[];
}

const WithoutProductsBooking: React.FC = () => {
  const navigate = useNavigate();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/services/unique/grouped');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setServiceCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to mock data if API fails
        setServiceCategories([
          { category: 'Hair Styling', services: ['Cuts & Styling', 'Braiding', 'Coloring', 'Bridal Hair'] },
          { category: 'Skin Care', services: ['Facial Treatment', 'Clean-up', 'Glow Treatments'] },
          { category: 'Makeup', services: ['Party Makeup', 'Bridal Makeup', 'Event Makeup'] },
          { category: 'Nail Care', services: ['Manicure', 'Pedicure', 'Nail Art'] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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
          <div className="text-[#4e342e] text-xl">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#6d4c41] to-[#4e342e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-white/30">
                <Home className="w-5 h-5 text-white mr-3" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">WITHOUT PRODUCTS</span>
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight"
              variants={fadeInUp}
            >
              Services Using Your Products
            </motion.h1>

            <motion.p 
              className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Professional expertise using your own products - cost-effective and personalized
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Available Services
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Professional beauty services using your own products
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {serviceCategories.map((category, catIndex) => (
              <div key={catIndex} className="md:col-span-2">
                <h3 className="text-2xl font-serif font-bold text-[#4e342e] mb-6 pb-3 border-b-2 border-[#d7ccc8]">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.services.map((serviceName, serviceIndex) => (
                    <motion.div key={`${catIndex}-${serviceIndex}`} variants={fadeInUp}>
                      <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-3xl overflow-hidden h-full">
                        <CardContent className="p-8">
                          <div className="mb-4">
                            <Badge className="bg-[#6d4c41] text-white px-3 py-1 rounded-full mb-4">
                              <Home className="w-4 h-4 mr-1 inline" />
                              Your Products
                            </Badge>
                          </div>

                          <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-3">
                            {serviceName}
                          </h3>
                          
                          <p className="text-[#6d4c41] mb-4">
                            Professional {serviceName.toLowerCase()} service using your own products
                          </p>
                          
                          <div className="flex items-center mb-4">
                            <div className="flex items-center text-[#6d4c41]">
                              <Clock className="w-5 h-5 mr-2" />
                              <span className="font-medium">Duration varies</span>
                            </div>
                          </div>

                          {/* Book Button */}
                          <Button 
                            className="w-full bg-[#6d4c41] hover:bg-[#5a3520] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                            onClick={() => navigate(`/customer/booking-confirmation`, { 
                              state: { 
                                serviceName, 
                                type: 'without-products',
                                category: category.category 
                              } 
                            })}
                          >
                            Book This Service
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Why Choose Services Without Products?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Use your favorite products while getting professional expertise
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
                icon: DollarSign,
                title: 'Cost Effective',
                description: 'Save money by using your own products'
              },
              {
                icon: Star,
                title: 'Your Preferred Brands',
                description: 'Use products you know and trust'
              },
              {
                icon: Home,
                title: 'Personalized Service',
                description: 'Tailored to your specific product preferences'
              }
            ].map((benefit, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-[#6d4c41] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                      {benefit.title}
                    </h3>
                    <p className="text-[#6d4c41] leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Preparation Tips */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Preparation Tips
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              How to prepare for your service using your own products
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Package,
                title: 'Gather Products',
                description: 'Have all your products ready and easily accessible'
              },
              {
                icon: Home,
                title: 'Prepare Space',
                description: 'Set up a clean, well-lit area for the service'
              },
              {
                icon: Clock,
                title: 'Plan Timing',
                description: 'Allow extra time for product preparation'
              },
              {
                icon: Star,
                title: 'Communicate',
                description: 'Let your beautician know about any product preferences'
              }
            ].map((tip, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-[#6d4c41] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <tip.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-serif font-bold mb-3 text-[#4e342e]">
                      {tip.title}
                    </h3>
                    <p className="text-[#6d4c41] leading-relaxed text-sm">
                      {tip.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Back Button */}
      <section className="py-8 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button 
            variant="outline"
            className="border-2 border-[#6d4c41] text-[#6d4c41] hover:bg-[#6d4c41] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            onClick={() => navigate('/customer/at-home-services/select-option')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Options
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WithoutProductsBooking;

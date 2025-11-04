import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Lottie from 'lottie-react';
import { 
  Home,
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
import makeup1 from '@/assets/makeup1.jpg';
import hair9 from '@/assets/hair9.jpg';

// Lottie Animations
import womanHairAnimation from '@/assets/WomanHair.json';
import shampooAnimation from '@/assets/Shampoo.json';
import nailPolishAnimation from '@/assets/NailPolish.json';
import skinCareAnimation from '@/assets/SkinCare.json';

interface ServiceCategory {
  category: string;
  services: string[];
}

const AtHomeServicesPage = () => {
  const [productOption, setProductOption] = useState<'with' | 'without' | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniqueServices();
  }, []);

  const fetchUniqueServices = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: ServiceCategory[] }>('/services/unique/grouped');
      if (response.data.success) {
        setServiceCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to default categories if API fails
      setServiceCategories([
        {
          category: 'Hair Styling',
          services: ['Cuts & Styling', 'Braiding', 'Coloring', 'Bridal Hair']
        },
        {
          category: 'Skin Care',
          services: ['Facial Treatment', 'Clean-up', 'Glow Treatments', 'Anti-aging']
        },
        {
          category: 'Makeup',
          services: ['Party Makeup', 'Bridal Makeup', 'Event Makeup', 'Professional Look']
        },
        {
          category: 'Nail Care',
          services: ['Manicure', 'Pedicure', 'Nail Art', 'Nail Extensions']
        }
      ]);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />

      {/* Hero Section - Advertisement Banner */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#fdf6f0] via-[#fcf2e8] to-[#f8d7da]/20 pt-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 bg-[#4e342e] rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#f8d7da] rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#6d4c41] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="text-center">
            <motion.div 
              className="space-y-6"
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              <motion.div variants={fadeInUp}>
                <div className="inline-flex items-center bg-gradient-to-r from-[#f8d7da] to-[#f0c8cc] rounded-full px-8 py-4 mb-8 shadow-lg border border-[#f8d7da]/30">
                  <Sparkles className="w-6 h-6 text-[#4e342e] mr-3" />
                  <span className="text-sm font-bold text-[#4e342e] uppercase tracking-wide">PREMIUM AT-HOME SERVICES</span>
                </div>
              </motion.div>

              <motion.h1 
                className="text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-[#4e342e] leading-tight"
                variants={fadeInUp}
              >
                Salon Luxury,
                <span className="block text-transparent bg-gradient-to-r from-[#4e342e] to-[#6d4c41] bg-clip-text relative">
                  Right at Your Home
                  <span className="absolute -right-3 -top-3 text-3xl">✨</span>
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl lg:text-2xl text-[#6d4c41] leading-relaxed font-sans max-w-3xl mx-auto"
                variants={fadeInUp}
              >
                Verified beauticians, with or without products — all managed by our trusted professional team.
              </motion.p>

              <motion.div 
                className="pt-8"
                variants={fadeInUp}
              >
                <Link to="/customer/at-home-services/select-option">
                  <Button className="bg-gradient-to-r from-[#4e342e] to-[#6d4c41] hover:from-[#3b2c26] hover:to-[#5a3520] text-white px-10 py-5 text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 group transform hover:scale-105">
                    <Home className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Book Your At-Home Service
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

             
            </motion.div>

          </div>
        </div>
      </section>

      {/* How It Works - 4 Step Flow */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-[#f8d7da]/30 rounded-full px-6 py-3 mb-8">
              <Clock className="w-5 h-5 text-[#4e342e] mr-3" />
              <span className="text-sm font-bold text-[#4e342e] uppercase tracking-wide">HOW IT WORKS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4e342e] mb-8 leading-tight">
              Professional 4-Step Process
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-4xl mx-auto font-sans leading-relaxed">
              From booking to service delivery - managed by our professional team for quality assurance
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: '01',
                title: 'User Books Service',
                description: 'Choose your service category and decide whether you need products brought by our stylist.',
                icon: Calendar,
                color: 'from-[#4e342e] to-[#6d4c41]'
              },
              {
                step: '02',
                title: 'Update Sent to Manager',
                description: 'Our professional manager reviews your request and service requirements for quality control.',
                icon: Settings,
                color: 'from-[#4e342e] to-[#6d4c41]'
              },
              {
                step: '03',
                title: 'Manager Assigns Verified Beautician',
                description: 'Based on service type and availability, our manager assigns the best certified beautician for you.',
                icon: UserCheck,
                color: 'from-[#4e342e] to-[#6d4c41]'
              },
              {
                step: '04',
                title: 'Beautician Arrives at Your Home',
                description: 'Professional service delivery at your doorstep - secure, hygienic, and reliable.',
                icon: Home,
                color: 'from-[#4e342e] to-[#6d4c41]'
              }
            ].map((step, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-[#fdf6f0] to-white rounded-3xl h-full overflow-hidden group">
                  <CardContent className="p-8 relative">
                    {/* Step Number */}
                    <div className="absolute top-6 right-6 w-16 h-16 bg-[#f8d7da]/30 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#4e342e] font-serif">{step.step}</span>
                    </div>

                    {/* Timeline Connection */}
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-16 -right-4 w-8 h-0.5 bg-[#f8d7da] z-10"></div>
                    )}

                    <div className="mb-8">
                      <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                      {step.title}
                    </h3>
                    <p className="text-[#6d4c41] leading-relaxed font-sans text-base">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Available At Home */}
      <section className="py-24 bg-gradient-to-br from-[#fdf6f0] to-[#f8e8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4e342e] mb-8">
              Services Available At Home
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-4xl mx-auto font-sans">
              Professional beauty treatments delivered to your doorstep by certified specialists
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-[#4e342e] text-xl">Loading services...</div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {serviceCategories.map((serviceData, index) => {
                // Map category names to images and icons
                const categoryConfig: Record<string, { image: string; icon: any; color: string }> = {
                  'Hair Styling': { image: hair9, icon: Scissors, color: 'from-[#4e342e] to-[#6d4c41]' },
                  'Skin Care': { image: spa1, icon: Sparkles, color: 'from-[#4e342e] to-[#6d4c41]' },
                  'Makeup': { image: makeup1, icon: Palette, color: 'from-[#4e342e] to-[#6d4c41]' },
                  'Nail Care': { image: nail, icon: Star, color: 'from-[#4e342e] to-[#6d4c41]' },
                  'Other': { image: spa1, icon: Brush, color: 'from-[#4e342e] to-[#6d4c41]' }
                };
                
                const config = categoryConfig[serviceData.category] || categoryConfig['Other'];
                
                return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden rounded-3xl h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={config.image}
                        alt={serviceData.category}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
                      <div className="absolute top-4 left-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <config.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-4">
                        {serviceData.category}
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {serviceData.services.slice(0, 8).map((item, serviceIndex) => (
                          <div key={serviceIndex} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-[#6d4c41] font-sans text-sm">{item}</span>
                          </div>
                        ))}
                        {serviceData.services.length > 8 && (
                          <div className="text-[#6d4c41] font-sans text-sm italic">
                            +{serviceData.services.length - 8} more services
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );})}
            </motion.div>
          )}
        </div>
      </section>

      {/* Products Option - Ad Style Highlight */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4e342e] mb-8">
              Don't have the products?
              <span className="block text-transparent bg-gradient-to-r from-[#4e342e] to-[#6d4c41] bg-clip-text">
                We'll bring them for you.
              </span>
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-4xl mx-auto font-sans">
              Choose your preference - our stylists can bring professional products or work with what you have
            </p>
          </motion.div>

          {/* Product Examples */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { name: 'Hair Color Kit', animation: womanHairAnimation, description: 'Professional coloring products' },
              { name: 'Shampoos', animation: shampooAnimation, description: 'Premium hair care products' },
              { name: 'Nail Kits', animation: nailPolishAnimation, description: 'Complete nail care sets' },
              { name: 'Skin Creams', animation: skinCareAnimation, description: 'Skincare and treatment products' }
            ].map((product, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center p-6 bg-gradient-to-br from-[#fdf6f0] to-white border-0 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-4">
                    <Lottie 
                      animationData={product.animation} 
                      loop={true}
                      autoplay={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <h4 className="font-bold text-[#4e342e] mb-2">{product.name}</h4>
                  <p className="text-sm text-[#6d4c41] font-sans">{product.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Toggle Options */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 p-8 rounded-3xl border-2 ${
                productOption === 'with' 
                  ? 'border-[#4e342e] bg-[#f8d7da]/10 shadow-xl' 
                  : 'border-[#f8d7da]/30 bg-white hover:border-[#4e342e]/50 hover:shadow-lg'
              }`}
              onClick={() => setProductOption('with')}
            >
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-3">With Products</h3>
                <p className="text-[#6d4c41] font-sans">Our stylist brings all necessary professional products and tools</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 p-8 rounded-3xl border-2 ${
                productOption === 'without' 
                  ? 'border-[#4e342e] bg-[#f8d7da]/10 shadow-xl' 
                  : 'border-[#f8d7da]/30 bg-white hover:border-[#4e342e]/50 hover:shadow-lg'
              }`}
              onClick={() => setProductOption('without')}
            >
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-3">Without Products</h3>
                <p className="text-[#6d4c41] font-sans">Use your own products while our stylist provides professional tools and expertise</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why Trust Us - Unique Style */}
      <section className="py-24 bg-gradient-to-br from-[#fdf6f0] to-[#f8e8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4e342e] mb-8">
              Why Trust Us?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-4xl mx-auto font-sans">
              Professional management and quality assurance for your peace of mind
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
                icon: UserCheck,
                title: 'Verified & Certified Beauticians',
                description: 'All our beauticians are professionally certified and background-verified for your safety.'
              },
              {
                icon: Settings,
                title: 'Manager Assigned for Quality Control',
                description: 'Every service is managed by our professional team to ensure quality and reliability.'
              },
              {
                icon: Package,
                title: 'Flexible: With or Without Products',
                description: 'Choose to have products brought to you or use your own - we adapt to your preferences.'
              },
              {
                icon: Shield,
                title: 'Safe, Reliable & Professional Service',
                description: 'Strict hygiene protocols, professional tools, and secure service delivery at your home.'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-3xl h-full">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                      <h3 className="text-xl font-serif font-bold text-[#4e342e]">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-[#6d4c41] leading-relaxed font-sans">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA - Advertisement Banner */}
      <section className="py-24 bg-gradient-to-r from-[#4e342e] via-[#6d4c41] to-[#4e342e] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/50 rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 mb-8 shadow-lg border border-white/30">
              <Sparkles className="w-6 h-6 text-white mr-3" />
              <span className="text-sm font-bold text-white uppercase tracking-wide">READY TO EXPERIENCE LUXURY?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">
              Experience premium beauty services
              <span className="block text-[#f8d7da] mt-2">
                without leaving your home.
              </span>
            </h2>
            <p className="text-xl text-white/90 mb-10 font-sans leading-relaxed max-w-3xl mx-auto">
              Professional beauticians, managed service quality, flexible product options - all at your doorstep
            </p>
            
            <Link to="/customer/at-home-services/select-option">
              <Button className="bg-white text-[#4e342e] hover:bg-[#f8d7da] hover:text-[#4e342e] px-12 py-6 text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 group transform hover:scale-105">
                <Home className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform" />
                Book At Home Now
                <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 text-white/90">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#f8d7da] mr-2" />
                <span className="font-sans">Manager quality control</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#f8d7da] mr-2" />
                <span className="font-sans">Verified professionals only</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-[#f8d7da] mr-2" />
                <span className="font-sans">Flexible product options</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AtHomeServicesPage;

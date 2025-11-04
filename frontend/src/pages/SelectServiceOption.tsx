import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { 
  Package, 
  Home, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

const SelectServiceOption: React.FC = () => {
  const navigate = useNavigate();

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

  const serviceOptions = [
    {
      id: 'with-products',
      title: 'With Products',
      description: 'Our beautician brings all necessary professional products and tools',
      icon: Package,
      features: [
        'Professional products included',
        'Premium quality materials',
        'No need to purchase anything',
        'Complete service package'
      ],
      price: 'Higher cost',
      route: '/customer/at-home-with-products',
      color: 'from-[#4e342e] to-[#6d4c41]',
      bgColor: 'bg-gradient-to-br from-[#f8d7da]/10 to-[#f0c8cc]/5'
    },
    {
      id: 'without-products',
      title: 'Without Products',
      description: 'Use your own products while our beautician provides professional expertise',
      icon: Home,
      features: [
        'Use your own products',
        'Professional expertise',
        'Cost-effective option',
        'Bring your preferred brands'
      ],
      price: 'Lower cost',
      route: '/customer/at-home-services/without-products',
      color: 'from-[#6d4c41] to-[#4e342e]',
      bgColor: 'bg-gradient-to-br from-[#f0c8cc]/10 to-[#f8d7da]/5'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-white/30">
                <Sparkles className="w-5 h-5 text-white mr-3" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">CHOOSE YOUR PREFERENCE</span>
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight"
              variants={fadeInUp}
            >
              How would you like your service?
            </motion.h1>

            <motion.p 
              className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Choose whether you'd like our beautician to bring professional products or use your own
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Service Options */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {serviceOptions.map((option => (
              <motion.div key={option.id} variants={fadeInUp}>
                <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-3xl overflow-hidden h-full">
                  <div className={`${option.bgColor} p-8 h-full`}>
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="text-center mb-8">
                        <div className={`w-20 h-20 bg-gradient-to-br ${option.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                          <option.icon className="w-10 h-10 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-serif font-bold text-[#4e342e] mb-4">
                          {option.title}
                        </h3>
                        
                        <p className="text-lg text-[#6d4c41] leading-relaxed mb-6">
                          {option.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-[#6d4c41] font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price Info */}
                      <div className="flex items-center justify-center mb-8">
                        <div className="bg-[#4e342e]/10 rounded-full px-4 py-2">
                          <span className="text-[#4e342e] font-semibold">{option.price}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group`}
                        onClick={() => navigate(option.route)}
                      >
                        Choose {option.title}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            )))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
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
              Why Choose Home Bonzenga?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Professional service with flexible options to suit your needs
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
                title: 'Verified Professionals',
                description: 'All beauticians are background-checked and certified'
              },
              {
                icon: Clock,
                title: 'Flexible Scheduling',
                description: 'Book at your convenience with real-time availability'
              },
              {
                icon: Sparkles,
                title: 'Quality Guaranteed',
                description: 'Manager-approved service with quality assurance'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
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

      {/* Back Button */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button 
            variant="outline"
            className="border-2 border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            onClick={() => navigate('/customer/at-home-services')}
          >
            ← Back to At-Home Services
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SelectServiceOption;

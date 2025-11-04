import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import LanguageToggle from '@/components/LanguageToggle';
import HeroCarousel from '@/components/HeroCarousel';


// Assets
import hero3 from '@/assets/hero3.jpg';
import hair4 from '@/assets/hair4.jpg';
import makeup5 from '@/assets/makeup5.jpg';
import spa1 from '@/assets/spa1.jpg';
import nail from '@/assets/nail.jpg';
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import spa_product from "../assets/spa_product.jpg";


// Icons
import { 
  Calendar, 
  MapPin, 
  Clock,
  Mail,
  Phone,
  Shield,
  Award,
  CheckCircle,
  Users,
  Sparkles,
  UserCheck,
  Star,
  ArrowRight,
  Scissors,
  Palette,
  Heart,
  Search,
  Home,
  HelpCircle,
  Building,
  Bell,
  CreditCard
} from 'lucide-react';

const LandingPage = () => {
  const { t, ready } = useTranslation();
  const [email, setEmail] = useState('');

  // Wait for i18n to be ready
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#4e342e]">Loading...</div>
      </div>
    );
  }

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

  
      {/* Hero Carousel Section */}
      <section id="home" className="relative">
        <HeroCarousel 
          autoplayDelay={3000}
          showNavigation={false}
          showPagination={true}
          className="h-[500px]"
        />
      </section>
      

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              {t('home.services.title')}
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto font-sans">
              {t('home.services.subtitle')}
            </p>
          </motion.div>

          {/* Two Main Service Blocks */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* At-Home Services */}
            <motion.div variants={fadeInUp}>
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-[#fdf6f0] overflow-hidden rounded-3xl h-full">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={makeup5}
                    alt="At-Home Beauty Services"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10 group-hover:from-black/50 group-hover:to-black/20 transition-all duration-300" />
                  
                  {/* Icon Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-2xl flex items-center justify-center shadow-lg">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-serif font-bold text-[#4e342e] mb-4">
                    {t('home.services.atHome.title')}
                  </h3>
                  
                  <p className="text-lg text-[#6d4c41] leading-relaxed mb-6 font-sans">
                    {t('home.services.atHome.description')}
                  </p>
                  
                  <Link to="/at-home-services">
                    <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
                      {t('home.services.atHome.button')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Salon Visits */}
            <motion.div variants={fadeInUp}>
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-[#fdf6f0] overflow-hidden rounded-3xl h-full">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={spa_product}
                    alt="Salon Beauty Services"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10 group-hover:from-black/50 group-hover:to-black/20 transition-all duration-300" />
                  
                  {/* Icon Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-2xl flex items-center justify-center shadow-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-serif font-bold text-[#4e342e] mb-4">
                    {t('home.services.salon.title')}
                  </h3>
                  
                  <p className="text-lg text-[#6d4c41] leading-relaxed mb-6 font-sans">
                    {t('home.services.salon.description')}
                  </p>
                  
                  <Link to="/salon-visit">
                    <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
                      {t('home.services.salon.button')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Service Categories */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: t('home.services.categories.hair.title'),
                description: t('home.services.categories.hair.description'),
                image: hair4,
                icon: Scissors,
              },
              {
                title: t('home.services.categories.face.title'),
                description: t('home.services.categories.face.description'),
                image: spa1,
                icon: Sparkles,
              },
              {
                title: t('home.services.categories.extras.title'),
                description: t('home.services.categories.extras.description'),
                image: nail,
                icon: Heart,
              }
            ].map((service, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-[#fdf6f0] overflow-hidden rounded-2xl">
                  <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Darker overlay for service images */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10 group-hover:from-black/50 group-hover:to-black/20 transition-all duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-[#4e342e] rounded-xl flex items-center justify-center mr-3">
                        <service.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-[#4e342e]">
                    {service.title}
                      </h3>
                    </div>
                    <p className="text-[#6d4c41] leading-relaxed font-sans text-sm">
                    {service.description}
                  </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto font-sans">
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: '01',
                title: t('home.howItWorks.steps.step1.title'),
                description: t('home.howItWorks.steps.step1.description'),
                icon: Home,
              },
              {
                step: '02',
                title: t('home.howItWorks.steps.step2.title'),
                description: t('home.howItWorks.steps.step2.description'),
                icon: Palette,
              },
              {
                step: '03',
                title: t('home.howItWorks.steps.step3.title'),
                description: t('home.howItWorks.steps.step3.description'),
                icon: Calendar,
              },
              {
                step: '04',
                title: t('home.howItWorks.steps.step4.title'),
                description: t('home.howItWorks.steps.step4.description'),
                icon: UserCheck,
              },
              {
                step: '05',
                title: t('home.howItWorks.steps.step5.title'),
                description: t('home.howItWorks.steps.step5.description'),
                icon: Star,
              }
            ].map((step, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm rounded-2xl h-full">
                  <CardContent className="p-6">
                    <div className="relative mb-6">
                      <div className="w-14 h-14 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#f8d7da] text-[#4e342e] rounded-full flex items-center justify-center text-xs font-bold font-sans">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-serif font-bold mb-3 text-[#4e342e]">
                      {step.title}
                    </h3>
                    <p className="text-[#6d4c41] leading-relaxed font-sans text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Bonzenga Section */}
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
              {t('home.whyChoose.title')}
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto font-sans">
              {t('home.whyChoose.subtitle')}
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
                title: t('home.whyChoose.features.verified.title'),
                description: t('home.whyChoose.features.verified.description')
              },
              {
                icon: MapPin,
                title: t('home.whyChoose.features.flexible.title'),
                description: t('home.whyChoose.features.flexible.description')
              },
              {
                icon: CreditCard,
                title: t('home.whyChoose.features.secure.title'),
                description: t('home.whyChoose.features.secure.description')
              },
              {
                icon: Bell,
                title: t('home.whyChoose.features.updates.title'),
                description: t('home.whyChoose.features.updates.description')
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] h-full rounded-2xl">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                  </div>
                    <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                      {feature.title}
                    </h3>
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


      {/* Newsletter Section */}
      <section className="py-16 bg-[#6d4c41] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              {t('home.newsletter.title')}
            </h2>
            <p className="text-lg text-white/80 mb-8 font-sans">
              {t('home.newsletter.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t('home.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl font-sans"
              />
              <Button className="bg-[#4e342e] hover:bg-[#3b2c26] px-8 py-3 rounded-xl font-semibold transition-all duration-300 font-sans">
                {t('home.newsletter.button')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

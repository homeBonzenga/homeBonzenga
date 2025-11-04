import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Filter,
  Calendar,
  Building,
  Home,
  Users,
  Shield,
  CreditCard,
  CheckCircle,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Assets
import hair4 from '@/assets/hair4.jpg';
import makeup5 from '@/assets/makeup5.jpg';
import spa1 from '@/assets/spa1.jpg';
import nail from '@/assets/nail.jpg';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'hair', label: 'Hair' },
    { value: 'face', label: 'Face' },
    { value: 'spa', label: 'Spa' },
    { value: 'extras', label: 'Extras' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'kinshasa', label: 'Kinshasa' },
    { value: 'lubumbashi', label: 'Lubumbashi' },
    { value: 'goma', label: 'Goma' },
    { value: 'bukavu', label: 'Bukavu' },
    { value: 'kisangani', label: 'Kisangani' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Times' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'custom', label: 'Custom Date' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'nearest', label: 'Nearest' }
  ];

  // Enhanced mock data with service type
  const vendors = [
    {
      id: 1,
      name: 'Elite Beauty Salon',
      category: 'hair',
      location: 'kinshasa',
      serviceType: 'salon',
      rating: 4.8,
      reviewCount: 127,
      services: ['Haircut & Styling', 'Hair Coloring', 'Hair Treatment'],
      priceRange: '$30-$80',
      price: 55,
      image: hair4,
      verified: true,
      available: 'today'
    },
    {
      id: 2,
      name: 'Glamour At-Home',
      category: 'face',
      location: 'kinshasa',
      serviceType: 'at-home',
      rating: 4.9,
      reviewCount: 89,
      services: ['Makeup Application', 'Facial Treatment', 'Eyebrow Shaping'],
      priceRange: '$25-$70',
      price: 45,
      image: makeup5,
      verified: true,
      available: 'today'
    },
    {
      id: 3,
      name: 'Serenity Spa Center',
      category: 'spa',
      location: 'lubumbashi',
      serviceType: 'salon',
      rating: 4.7,
      reviewCount: 156,
      services: ['Full Body Massage', 'Facial Treatment', 'Aromatherapy'],
      priceRange: '$50-$120',
      price: 85,
      image: spa1,
      verified: true,
      available: 'this-week'
    },
    {
      id: 4,
      name: 'Mobile Nail Artist',
      category: 'extras',
      location: 'goma',
      serviceType: 'at-home',
      rating: 4.6,
      reviewCount: 73,
      services: ['Manicure', 'Pedicure', 'Nail Art', 'Gel Extensions'],
      priceRange: '$20-$60',
      price: 40,
      image: nail,
      verified: true,
      available: 'today'
    },
    {
      id: 5,
      name: 'Prestige Hair Studio',
      category: 'hair',
      location: 'kinshasa',
      serviceType: 'salon',
      rating: 4.9,
      reviewCount: 201,
      services: ['Braiding', 'Hair Extensions', 'Chemical Relaxing'],
      priceRange: '$40-$100',
      price: 70,
      image: hair4,
      verified: true,
      available: 'this-week'
    },
    {
      id: 6,
      name: 'Beauty Home Service',
      category: 'face',
      location: 'bukavu',
      serviceType: 'at-home',
      rating: 4.5,
      reviewCount: 64,
      services: ['Bridal Makeup', 'Party Makeup', 'Skincare Consultation'],
      priceRange: '$35-$90',
      price: 62,
      image: makeup5,
      verified: true,
      available: 'today'
    }
  ];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || vendor.location === selectedLocation;
    const matchesPrice = vendor.price >= priceRange[0] && vendor.price <= priceRange[1];
    const matchesAvailability = availability === 'all' || vendor.available === availability;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesAvailability;
  });

  // Sort vendors
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'nearest':
        return a.name.localeCompare(b.name); // Placeholder for distance sorting
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />

      {/* Hero Banner */}
      <section className="bg-[#fdf6f0] pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-[#f8d7da]/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#4e342e] mr-2" />
              <span className="text-sm font-medium text-[#4e342e]">Find Your Perfect Match</span>
        </div>

            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6 leading-tight">
              Find Your Perfect Beauty Service
            </h1>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto font-sans leading-relaxed">
              Discover trusted stylists and salons near you – book instantly, anytime.
            </p>
          </motion.div>

          {/* Main Search Bar */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-5 h-5" />
                <Input
                        placeholder="Search for services (e.g. haircut, manicure)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-lg border-[#f8d7da]/50 focus:border-[#4e342e] rounded-xl font-sans"
                />
              </div>
            </div>

                  {/* Category Dropdown */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-14 border-[#f8d7da]/50 focus:border-[#4e342e] rounded-xl font-sans">
                        <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

                  {/* Location Dropdown */}
            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-14 border-[#f8d7da]/50 focus:border-[#4e342e] rounded-xl font-sans">
                        <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

                <div className="flex justify-center mt-6">
                  <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Search className="w-5 h-5 mr-2" />
                    Search Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Filter & Sorting Section */}
      <section className="bg-white border-b border-[#f8d7da]/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-semibold text-[#4e342e] font-sans">Filters:</span>
              
              {/* Price Range */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#6d4c41] font-sans">Price: ${priceRange[0]} - ${priceRange[1]}</span>
                <div className="w-32">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200}
                    min={0}
                    step={10}
                    className="[&_.slider-thumb]:bg-[#4e342e] [&_.slider-track]:bg-[#f8d7da]"
                  />
                </div>
              </div>

              {/* Availability */}
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-40 h-10 border-[#f8d7da]/50">
                  <Clock className="w-4 h-4 mr-2 text-[#6d4c41]" />
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-[#4e342e] font-sans">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-10 border-[#f8d7da]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="py-16 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#4e342e]">
              Available Services ({sortedVendors.length})
            </h2>
          </div>

          {sortedVendors.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {sortedVendors.map((vendor, index) => (
                <motion.div key={vendor.id} variants={fadeInUp}>
                  <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden rounded-2xl h-full">
                    {/* Vendor Image */}
                    <div className="relative h-56 overflow-hidden">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />
                      
                      {/* Service Type Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${vendor.serviceType === 'at-home' ? 'bg-green-500' : 'bg-blue-500'} text-white font-medium`}>
                          {vendor.serviceType === 'at-home' ? (
                            <><Home className="w-3 h-3 mr-1" />At-Home</>
                          ) : (
                            <><Building className="w-3 h-3 mr-1" />Salon</>
                          )}
                    </Badge>
                  </div>
                  
                      {/* Verified Badge */}
                      {vendor.verified && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-[#4e342e] text-white">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      {/* Vendor Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-2">
                          {vendor.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-semibold text-[#4e342e]">{vendor.rating}</span>
                            </div>
                            <span className="text-[#6d4c41] text-sm">({vendor.reviewCount} reviews)</span>
                          </div>
                          <span className="text-[#4e342e] font-bold">{vendor.priceRange}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-[#6d4c41] mb-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span className="capitalize">{vendor.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className="capitalize">{vendor.available}</span>
                          </div>
                        </div>
                  
                        {/* Services */}
                        <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                            {vendor.services.slice(0, 2).map((service, serviceIndex) => (
                              <Badge key={serviceIndex} variant="secondary" className="bg-[#f8d7da]/30 text-[#4e342e] text-xs">
                            {service}
                          </Badge>
                        ))}
                            {vendor.services.length > 2 && (
                              <Badge variant="outline" className="text-xs border-[#f8d7da] text-[#6d4c41]">
                                +{vendor.services.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                        {/* Book Button */}
                        <Link to={`/customer/book/${vendor.id}`}>
                          <Button className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white py-3 rounded-xl font-semibold transition-all duration-300 group">
                      <Calendar className="w-4 h-4 mr-2" />
                            Book Appointment
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                        </Link>
                      </div>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 border-dashed border-[#f8d7da] bg-white/50">
              <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-[#4e342e] mb-2">No services found</h3>
                  <p className="text-[#6d4c41] mb-6 font-sans">
                    Try adjusting your search criteria or filters to find more options
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                      setPriceRange([0, 200]);
                      setAvailability('all');
                  }}
                    className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                >
                    Clear All Filters
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Book with Bonzenga Section */}
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
              Why Book with Bonzenga?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto font-sans">
              Your trusted partner for professional beauty services across Congo
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
                title: 'Verified Stylists & Salons',
                description: 'All professionals are thoroughly vetted and certified for quality assurance.'
              },
              {
                icon: CreditCard,
                title: 'Easy Rescheduling & Secure Payments',
                description: 'Flexible booking changes and safe, encrypted payment processing.'
              },
              {
                icon: MapPin,
                title: 'Available Across Congo',
                description: 'Find trusted beauty professionals in major cities throughout DR Congo.'
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


      {/* Footer */}
      <footer id="contact" className="bg-[#3b2c26] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-[#f8d7da] rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#3b2c26]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">HOME BONZENGA</h3>
                  <p className="text-[#f8d7da] text-sm font-sans">Premium Beauty Services</p>
                </div>
              </div>
              
              <div className="space-y-3 font-sans">
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">About Us</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Careers</a>
                <a href="#contact" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Contact</a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white">Services</h4>
              <div className="space-y-3 font-sans">
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">At-Home Services</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Salon Visits</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Hair Styling</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">For Beauticians</a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white">Support</h4>
              <div className="space-y-3 font-sans">
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Help Center</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Terms of Service</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="block text-white/70 hover:text-[#f8d7da] transition-colors duration-300">FAQ</a>
              </div>
            </div>

            {/* Contact & Social */}
            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-white">Connect</h4>
              <div className="space-y-3 text-white/70 mb-6 font-sans">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Kinshasa, DR Congo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-white/60 text-sm mb-4 sm:mb-0 font-sans">
                © 2024 HOME BONZENGA. All rights reserved.
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-[#f8d7da] hover:text-[#3b2c26] transition-all duration-300 font-sans">
                  English
                </button>
                <button className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-[#f8d7da] hover:text-[#3b2c26] transition-all duration-300 font-sans">
                  Français
                </button>
              </div>
            </div>
        </div>
      </div>
      </footer>
    </div>
  );
};

export default SearchPage;

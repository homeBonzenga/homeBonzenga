import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Building,
  Download,
  Share2,
  Home,
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SuccessData {
  bookingId: string;
  vendor: any;
  total: number;
}

const BookingSuccessPage = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (location.state) {
      setSuccessData(location.state as SuccessData);
    }
  }, [location.state]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  if (!successData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4e342e] mx-auto mb-4"></div>
            <p className="text-[#6d4c41]">Loading booking confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12 bg-gradient-to-br from-[#fdf6f0] to-[#f8d7da]/20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            {/* Success Header */}
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-[#4e342e] mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-xl text-[#6d4c41] mb-6">
                Your appointment has been successfully booked. You'll receive a confirmation email shortly.
              </p>
              <div className="bg-white rounded-lg p-6 shadow-lg inline-block">
                <p className="text-sm text-[#6d4c41] mb-2">Booking Reference</p>
                <p className="text-2xl font-bold text-[#4e342e] font-mono">{successData.bookingId}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Details */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div variants={fadeInUp}>
                  <Card className="border-0 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-[#4e342e] flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                            <Building className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-[#4e342e]">{successData.vendor.name}</h3>
                            <div className="flex items-center space-x-2 text-[#6d4c41]">
                              <MapPin className="w-4 h-4" />
                              <span>{successData.vendor.address}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-[#4e342e]" />
                            <div>
                              <p className="font-medium text-[#4e342e]">Date</p>
                              <p className="text-[#6d4c41]">Tomorrow, Dec 21, 2024</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-[#4e342e]" />
                            <div>
                              <p className="font-medium text-[#4e342e]">Time</p>
                              <p className="text-[#6d4c41]">2:00 PM - 3:30 PM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card className="border-0 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-[#4e342e] flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        What Happens Next?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-[#4e342e] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#4e342e] mb-1">Manager Assignment</h4>
                            <p className="text-[#6d4c41]">Our manager will assign the best available beautician for your services within 2 hours.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-[#4e342e] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#4e342e] mb-1">Beautician Confirmation</h4>
                            <p className="text-[#6d4c41]">You'll receive a notification with your assigned beautician's details and contact information.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-[#4e342e] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#4e342e] mb-1">Appointment Reminder</h4>
                            <p className="text-[#6d4c41]">We'll send you a reminder 24 hours and 2 hours before your appointment.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Actions Sidebar */}
              <div className="lg:col-span-1">
                <motion.div variants={fadeInUp}>
                  <Card className="border-0 bg-white shadow-lg sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-[#4e342e]">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-[#4e342e] hover:bg-[#6d4c41] text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download Receipt
                      </Button>
                      
                      <Button variant="outline" className="w-full border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Booking
                      </Button>
                      
                      <Link to="/customer" className="block">
                        <Button variant="outline" className="w-full border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                          <User className="w-4 h-4 mr-2" />
                          View Dashboard
                        </Button>
                      </Link>
                      
                      <Link to="/" className="block">
                        <Button variant="outline" className="w-full border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                          <Home className="w-4 h-4 mr-2" />
                          Back to Home
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-6">
                  <Card className="border-0 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] text-white">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                      <p className="text-white/90 mb-4 text-sm">
                        Our customer support team is here to help you with any questions.
                      </p>
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#4e342e]">
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Auto-redirect Notice */}
            <motion.div 
              className="text-center mt-12"
              variants={fadeInUp}
            >
              <div className="bg-white rounded-lg p-6 shadow-lg inline-block">
                <p className="text-[#6d4c41] mb-2">
                  Redirecting to your dashboard in {countdown} seconds...
                </p>
                <Link to="/customer">
                  <Button className="bg-[#4e342e] hover:bg-[#6d4c41] text-white">
                    Go to Dashboard Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;

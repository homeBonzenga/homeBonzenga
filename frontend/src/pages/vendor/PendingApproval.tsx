import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Mail, Phone, User, Building, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const PendingApproval = () => {
  const { user, vendor } = useSupabaseAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f5] via-[#fffaf5] to-[#ffffff] p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeIn}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#4e342e] mb-2">
              Account Under Review
            </h1>
            <p className="text-lg text-[#6d4c41]">
              We're currently reviewing your vendor application
            </p>
          </div>

          {/* Status Card */}
          <Card className="border-0 shadow-xl bg-white mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#4e342e]" />
                  <span>Application Status</span>
                </span>
                <Badge className="bg-yellow-500 text-white">PENDING</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse" />
                  <div>
                    <p className="text-[#4e342e] font-medium">Application Received</p>
                    <p className="text-sm text-[#6d4c41]">
                      Your vendor registration has been successfully submitted and is awaiting manager approval.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#f5e6d3] to-transparent" />
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
                  <div>
                    <p className="text-[#4e342e] font-medium">Under Review</p>
                    <p className="text-sm text-[#6d4c41]">
                      Our management team is reviewing your application. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#f5e6d3] to-transparent" />
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
                  <div>
                    <p className="text-[#4e342e] font-medium">Approval Decision</p>
                    <p className="text-sm text-[#6d4c41]">
                      You'll receive an email notification once your application has been reviewed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="border-0 shadow-xl bg-white mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#4e342e]" />
                <span>What Happens Next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#4e342e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4e342e] font-semibold">1</span>
                  </div>
                  <div>
                    <p className="text-[#4e342e] font-medium mb-1">Email Notification</p>
                    <p className="text-sm text-[#6d4c41]">
                      You'll receive an email at <span className="font-medium">{user?.email}</span> with the approval decision.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#f5e6d3] to-transparent" />
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#4e342e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4e342e] font-semibold">2</span>
                  </div>
                  <div>
                    <p className="text-[#4e342e] font-medium mb-1">Access Granted</p>
                    <p className="text-sm text-[#6d4c41]">
                      Once approved, you'll have full access to manage services, products, and employees.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#f5e6d3] to-transparent" />
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#4e342e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4e342e] font-semibold">3</span>
                  </div>
                  <div>
                    <p className="text-[#4e342e] font-medium mb-1">Start Building Your Business</p>
                    <p className="text-sm text-[#6d4c41]">
                      Add your services, products, and employee details to start accepting bookings from customers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-[#4e342e]" />
                <span>Application Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-[#6d4c41] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6d4c41]">Owner Name</p>
                      <p className="text-[#4e342e] font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-[#6d4c41] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6d4c41]">Email Address</p>
                      <p className="text-[#4e342e] font-medium">{user?.email}</p>
                    </div>
                  </div>
                  {user?.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-[#6d4c41] mt-0.5" />
                      <div>
                        <p className="text-sm text-[#6d4c41]">Phone Number</p>
                        <p className="text-[#4e342e] font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-[#6d4c41] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6d4c41]">Shop Name</p>
                      <p className="text-[#4e342e] font-medium">{vendor?.shopName || 'N/A'}</p>
                    </div>
                  </div>
                  {vendor?.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-[#6d4c41] mt-0.5" />
                      <div>
                        <p className="text-sm text-[#6d4c41]">Business Address</p>
                        <p className="text-[#4e342e] font-medium">
                          {vendor.address}, {vendor.city}, {vendor.state} {vendor.zipCode}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-yellow-500 text-white">PENDING</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-[#6d4c41] mb-4">
              Need assistance? Contact our support team
            </p>
            <p className="text-[#4e342e] font-medium">
              support@homebonzenga.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PendingApproval;



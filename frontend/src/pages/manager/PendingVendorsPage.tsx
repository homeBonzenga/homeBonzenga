import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  User,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingVendor {
  id: string;
  shopname: string;
  description: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearsInBusiness: number;
  numberOfEmployees: number;
  servicesOffered: string[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  status: string;
}

const PendingVendorsPage = () => {
  const { user } = useSupabaseAuth();
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [vendorToReject, setVendorToReject] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const businessTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'salon', label: 'Beauty Salon' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'beauty_center', label: 'Beauty Center' },
    { value: 'nail_salon', label: 'Nail Salon' },
    { value: 'barbershop', label: 'Barbershop' }
  ];

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/manager/vendors/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched pending vendors:', data.vendors?.length || 0);
        
        // Transform the backend data to match the frontend interface
        const transformedVendors = (data.vendors || []).map((vendor: any) => ({
          id: vendor.id,
          shopname: vendor.shopName,
          description: vendor.description || '',
          businessType: 'salon', // Default since schema doesn't have this field
          address: vendor.address,
          city: vendor.city,
          state: vendor.state,
          zipCode: vendor.zipCode,
          yearsInBusiness: 0, // Not in schema
          numberOfEmployees: 0, // Not in schema
          servicesOffered: [], // Not in schema
          user: {
            firstName: vendor.user?.firstName || '',
            lastName: vendor.user?.lastName || '',
            email: vendor.user?.email || '',
            phone: vendor.user?.phone || ''
          },
          createdAt: vendor.createdAt,
          status: vendor.status
        }));
        setPendingVendors(transformedVendors);
      } else {
        console.error('Failed to fetch pending vendors:', response.status, response.statusText);
        // Fallback to mock data
        const mockVendors: PendingVendor[] = [
          {
            id: '1',
            shopname: 'Elegant Beauty Salon',
            description: 'A premium beauty salon offering comprehensive hair, skin, and nail care services with a focus on personalized treatments.',
            businessType: 'salon',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            yearsInBusiness: 5,
            numberOfEmployees: 8,
            servicesOffered: ['Hair Styling', 'Facial Treatments', 'Makeup', 'Nail Care'],
            user: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 123-4567'
            },
            createdAt: '2024-12-20T10:00:00Z',
            status: 'PENDING'
          },
          {
            id: '2',
            shopname: 'Zen Spa & Wellness',
            description: 'A tranquil spa offering holistic wellness treatments including massage, facials, and body treatments.',
            businessType: 'spa',
            address: '456 Wellness Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            yearsInBusiness: 3,
            numberOfEmployees: 6,
            servicesOffered: ['Massage', 'Facial Treatments', 'Body Treatments', 'Spa Packages'],
            user: {
              firstName: 'Maria',
              lastName: 'Garcia',
              email: 'maria.garcia@email.com',
              phone: '+1 (555) 987-6543'
            },
            createdAt: '2024-12-19T15:30:00Z',
            status: 'PENDING'
          },
          {
            id: '3',
            shopname: 'Nail Art Studio',
            description: 'Specialized nail salon offering creative nail art, manicures, pedicures, and nail extensions.',
            businessType: 'nail_salon',
            address: '789 Art Street',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            yearsInBusiness: 2,
            numberOfEmployees: 4,
            servicesOffered: ['Manicure', 'Pedicure', 'Nail Art', 'Nail Extensions'],
            user: {
              firstName: 'Jennifer',
              lastName: 'Lee',
              email: 'jennifer.lee@email.com',
              phone: '+1 (555) 456-7890'
            },
            createdAt: '2024-12-18T09:15:00Z',
            status: 'PENDING'
          }
        ];
        setPendingVendors(mockVendors);
      }
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      toast.error('Failed to load pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorAction = async (vendorId: string, action: 'approve' | 'reject') => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      let body = {};
      if (action === 'reject') {
        body = { reason: rejectionReason || 'Application does not meet our current requirements.' };
      }
      
      const response = await fetch(`http://localhost:3001/api/manager/vendors/${vendorId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Vendor ${action}d successfully! Email notification sent.`, {
          description: action === 'approve' 
            ? 'The vendor can now access their dashboard.'
            : 'Rejection email sent to vendor.'
        });
        
        // Reset rejection form
        setRejectionReason('');
        setShowRejectDialog(false);
        setVendorToReject(null);
        
        fetchPendingVendors(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${action} vendor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      toast.error(`Failed to ${action} vendor`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectDialog = (vendorId: string) => {
    setVendorToReject(vendorId);
    setShowRejectDialog(true);
  };

  const confirmRejection = () => {
    if (vendorToReject) {
      handleVendorAction(vendorToReject, 'reject');
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const businessType = businessTypes.find(bt => bt.value === type);
    return businessType?.label || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredVendors = pendingVendors.filter(vendor => {
    const matchesSearch = 
      vendor.shopname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = businessTypeFilter === 'all' || vendor.businessType === businessTypeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeInUp}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Pending Vendor Applications</h1>
              <p className="text-[#6d4c41]">Review and approve vendor registration applications</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Badge className="bg-[#4e342e] text-white">
                {filteredVendors.length} Pending
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-4 h-4" />
                    <Input
                      placeholder="Search by shop name, owner name, or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={businessTypeFilter}
                    onChange={(e) => setBusinessTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                  >
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendors List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 bg-white shadow-lg animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVendors.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <Building className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No Pending Applications</h3>
                <p className="text-[#6d4c41]">
                  {searchTerm || businessTypeFilter !== 'all' 
                    ? 'No vendors match your search criteria.' 
                    : 'All vendor applications have been reviewed.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        {/* Vendor Info */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                              <Building className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-[#4e342e] mb-2">{vendor.shopname}</h3>
                              <div className="flex items-center space-x-4 mb-3">
                                <Badge variant="secondary" className="text-xs">
                                  {getBusinessTypeLabel(vendor.businessType)}
                                </Badge>
                                <div className="flex items-center space-x-1 text-sm text-[#6d4c41]">
                                  <Clock className="w-4 h-4" />
                                  <span>{vendor.yearsInBusiness} years in business</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-[#6d4c41]">
                                  <User className="w-4 h-4" />
                                  <span>{vendor.numberOfEmployees} employees</span>
                                </div>
                              </div>
                              <p className="text-[#6d4c41] text-sm mb-4 line-clamp-2">{vendor.description}</p>
                              
                              {/* Contact Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="font-medium text-[#4e342e] mb-2">Owner Information</h4>
                                  <div className="space-y-1 text-sm text-[#6d4c41]">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4" />
                                      <span>{vendor.user.firstName} {vendor.user.lastName}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4" />
                                      <span>{vendor.user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4" />
                                      <span>{vendor.user.phone}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#4e342e] mb-2">Business Location</h4>
                                  <div className="space-y-1 text-sm text-[#6d4c41]">
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="w-4 h-4" />
                                      <span>{vendor.address}</span>
                                    </div>
                                    <div className="text-sm text-[#6d4c41] ml-6">
                                      {vendor.city}, {vendor.state} {vendor.zipCode}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Services Offered */}
                              <div>
                                <h4 className="font-medium text-[#4e342e] mb-2">Services Offered</h4>
                                <div className="flex flex-wrap gap-2">
                                  {vendor.servicesOffered.map((service, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end space-y-4">
                          <div className="text-right">
                            <div className="text-sm text-[#6d4c41] mb-1">Application Date</div>
                            <div className="flex items-center space-x-1 text-[#4e342e]">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">{formatDate(vendor.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleVendorAction(vendor.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRejectDialog(vendor.id)}
                              disabled={isProcessing}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedVendor(vendor)}
                              className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Vendor Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this vendor application? The vendor will receive an email notification.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">
                Rejection Reason (Optional)
              </label>
              <Textarea
                placeholder="e.g., Application does not meet our current requirements..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This reason will be included in the rejection email sent to the vendor.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setVendorToReject(null);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRejection}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PendingVendorsPage;

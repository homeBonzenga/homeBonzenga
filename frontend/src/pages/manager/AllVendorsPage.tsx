import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Building,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
  User,
  Star,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Vendor {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
}

const AllVendorsPage = () => {
  const { user } = useSupabaseAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');

  const businessTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'salon', label: 'Beauty Salon' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'beauty_center', label: 'Beauty Center' },
    { value: 'nail_salon', label: 'Nail Salon' },
    { value: 'barbershop', label: 'Barbershop' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  useEffect(() => {
    fetchAllVendors();
  }, []);

  const fetchAllVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/manager/vendors/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform the API response to match the frontend interface
        const transformedVendors = (data.vendors || []).map((vendor: any) => ({
          id: vendor.id,
          shopname: vendor.shopName,
          description: vendor.description || '',
          businessType: 'salon', // Default since schema doesn't have this field
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          zipCode: vendor.zipCode || '',
          yearsInBusiness: 0, // Not in schema
          numberOfEmployees: 0, // Not in schema
          servicesOffered: [], // Not in schema
          status: vendor.status,
          isVerified: vendor.status === 'APPROVED',
          user: {
            firstName: vendor.user?.firstName || '',
            lastName: vendor.user?.lastName || '',
            email: vendor.user?.email || '',
            phone: vendor.user?.phone || ''
          },
          createdAt: vendor.createdAt,
          stats: vendor.stats || {
            totalBookings: 0,
            completedBookings: 0,
            totalRevenue: 0,
            averageRating: 0,
            totalReviews: 0
          }
        }));
        setVendors(transformedVendors);
      } else {
        // Fallback to mock data
        const mockVendors: Vendor[] = [
          {
            id: '1',
            shopname: 'Elegant Beauty Salon',
            description: 'A premium beauty salon offering comprehensive hair, skin, and nail care services.',
            businessType: 'salon',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            yearsInBusiness: 5,
            numberOfEmployees: 8,
            servicesOffered: ['Hair Styling', 'Facial Treatments', 'Makeup', 'Nail Care'],
            status: 'APPROVED',
            isVerified: true,
            user: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 123-4567'
            },
            createdAt: '2024-01-15T10:00:00Z',
            stats: {
              totalBookings: 156,
              completedBookings: 142,
              totalRevenue: 12500,
              averageRating: 4.8,
              totalReviews: 127
            }
          },
          {
            id: '2',
            shopname: 'Zen Spa & Wellness',
            description: 'A tranquil spa offering holistic wellness treatments.',
            businessType: 'spa',
            address: '456 Wellness Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            yearsInBusiness: 3,
            numberOfEmployees: 6,
            servicesOffered: ['Massage', 'Facial Treatments', 'Body Treatments'],
            status: 'APPROVED',
            isVerified: true,
            user: {
              firstName: 'Maria',
              lastName: 'Garcia',
              email: 'maria.garcia@email.com',
              phone: '+1 (555) 987-6543'
            },
            createdAt: '2024-02-20T15:30:00Z',
            stats: {
              totalBookings: 89,
              completedBookings: 82,
              totalRevenue: 8900,
              averageRating: 4.6,
              totalReviews: 89
            }
          },
          {
            id: '3',
            shopname: 'Nail Art Studio',
            description: 'Specialized nail salon offering creative nail art and treatments.',
            businessType: 'nail_salon',
            address: '789 Art Street',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            yearsInBusiness: 2,
            numberOfEmployees: 4,
            servicesOffered: ['Manicure', 'Pedicure', 'Nail Art'],
            status: 'PENDING',
            isVerified: false,
            user: {
              firstName: 'Jennifer',
              lastName: 'Lee',
              email: 'jennifer.lee@email.com',
              phone: '+1 (555) 456-7890'
            },
            createdAt: '2024-12-18T09:15:00Z',
            stats: {
              totalBookings: 0,
              completedBookings: 0,
              totalRevenue: 0,
              averageRating: 0,
              totalReviews: 0
            }
          }
        ];
        setVendors(mockVendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorAction = async (vendorId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/manager/vendors/${vendorId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(action === 'reject' ? { reason: '' } : {})
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Vendor ${action}d successfully! Email notification sent.`);
        fetchAllVendors(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({ message: `Failed to ${action} vendor` }));
        toast.error(errorData.message || `Failed to ${action} vendor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      toast.error(`Failed to ${action} vendor: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const businessType = businessTypes.find(bt => bt.value === type);
    return businessType?.label || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.shopname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesType = businessTypeFilter === 'all' || vendor.businessType === businessTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">All Vendors</h1>
              <p className="text-[#6d4c41]">Manage all registered vendors and their status</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Badge className="bg-[#4e342e] text-white">
                {filteredVendors.length} Total
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-4 h-4" />
                    <Input
                      placeholder="Search by shop name, owner, or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
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

          {/* Vendors Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
                <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No Vendors Found</h3>
                <p className="text-[#6d4c41]">
                  {searchTerm || statusFilter !== 'all' || businessTypeFilter !== 'all'
                    ? 'No vendors match your search criteria.' 
                    : 'No vendors have been registered yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-[#4e342e]">{vendor.shopname}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getBusinessTypeLabel(vendor.businessType)}
                              </Badge>
                              {vendor.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#6d4c41] text-sm mb-4 line-clamp-2">{vendor.description}</p>
                      
                      {/* Owner Info */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-sm text-[#6d4c41] mb-1">
                          <User className="w-4 h-4" />
                          <span>{vendor.user.firstName} {vendor.user.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-[#6d4c41] mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>{vendor.city}, {vendor.state}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-[#6d4c41]">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(vendor.createdAt)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      {vendor.status === 'APPROVED' && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-2 bg-[#f8d7da]/20 rounded-lg">
                            <div className="text-lg font-semibold text-[#4e342e]">{vendor.stats.totalBookings}</div>
                            <div className="text-xs text-[#6d4c41]">Bookings</div>
                          </div>
                          <div className="text-center p-2 bg-[#f8d7da]/20 rounded-lg">
                            <div className="text-lg font-semibold text-[#4e342e]">{formatCurrency(vendor.stats.totalRevenue)}</div>
                            <div className="text-xs text-[#6d4c41]">Revenue</div>
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      <div className="mb-4">
                        <div className="text-xs font-medium text-[#4e342e] mb-2">Services</div>
                        <div className="flex flex-wrap gap-1">
                          {vendor.servicesOffered.slice(0, 3).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {vendor.servicesOffered.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{vendor.servicesOffered.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {vendor.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleVendorAction(vendor.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVendorAction(vendor.id, 'reject')}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex-1"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AllVendorsPage;

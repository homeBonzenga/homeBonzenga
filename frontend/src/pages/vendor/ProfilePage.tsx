import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Save,
  Edit,
  Camera,
  Star,
  Award,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface VendorProfile {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shopName: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessType?: string;
  yearsInBusiness?: number;
  numberOfEmployees?: number;
  servicesOffered?: string[];
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  rating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

const ProfilePage = () => {
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shopname: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    businessType: 'salon',
    yearsInBusiness: 1,
    numberOfEmployees: 1
  });

  const businessTypes = [
    { value: 'salon', label: 'Beauty Salon' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'beauty_center', label: 'Beauty Center' },
    { value: 'nail_salon', label: 'Nail Salon' },
    { value: 'barbershop', label: 'Barbershop' }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${user?.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.user?.firstName || '',
          lastName: data.user?.lastName || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          shopname: data.shopName || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          businessType: 'salon', // data.businessType if available
          yearsInBusiness: 1, // data.yearsInBusiness if available
          numberOfEmployees: 1 // data.numberOfEmployees if available
        });
      } else {
        // Fallback to mock data if API fails
        const mockProfile: VendorProfile = {
          id: user?.id || '1',
          user: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 (555) 123-4567'
          },
          shopname: 'Elegant Beauty Salon',
          description: 'A premium beauty salon offering comprehensive hair, skin, and nail care services with a focus on personalized treatments and exceptional customer experience.',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          businessType: 'salon',
          yearsInBusiness: 5,
          numberOfEmployees: 8,
          servicesOffered: ['Hair Styling', 'Facial Treatments', 'Makeup', 'Nail Care', 'Manicure', 'Pedicure'],
          operatingHours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: '10:00', close: '16:00' }
          },
          rating: 4.8,
          totalReviews: 127,
          isVerified: true,
          status: 'APPROVED',
          createdAt: '2024-01-01T00:00:00Z'
        };
        setProfile(mockProfile);
        setFormData({
          firstName: mockProfile.user.firstName,
          lastName: mockProfile.user.lastName,
          email: mockProfile.user.email,
          phone: mockProfile.user.phone,
          shopname: mockProfile.shopname,
          description: mockProfile.description,
          address: mockProfile.address,
          city: mockProfile.city,
          state: mockProfile.state,
          zipCode: mockProfile.zipCode,
          businessType: mockProfile.businessType,
          yearsInBusiness: mockProfile.yearsInBusiness,
          numberOfEmployees: mockProfile.numberOfEmployees
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${user?.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#4e342e]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#4e342e] mb-2">Profile Not Found</h3>
              <p className="text-[#6d4c41]">Unable to load your profile information.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeInUp}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Profile</h1>
              <p className="text-[#6d4c41]">Manage your salon profile and business information</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Badge className={getStatusColor(profile.status)}>
                {profile.status}
              </Badge>
              {profile.isVerified && (
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#4e342e] flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#4e342e]">{profile.shopName}</h3>
                    <p className="text-[#6d4c41]">{profile.user.firstName} {profile.user.lastName}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-[#6d4c41]">
                        {profile.rating} ({profile.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="w-4 h-4 text-[#6d4c41]" />
                      <span className="text-sm text-[#6d4c41]">
                        {profile.yearsInBusiness} years in business
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-[#6d4c41]" />
                      <span className="text-sm text-[#6d4c41]">
                        {profile.numberOfEmployees} employees
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#4e342e] flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Business Information
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-[#4e342e] font-medium">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-[#4e342e] font-medium">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="shopname" className="text-[#4e342e] font-medium">Shop/Salon Name</Label>
                        <Input
                          id="shopname"
                          value={formData.shopname}
                          onChange={(e) => setFormData({ ...formData, shopname: e.target.value })}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-[#4e342e] font-medium">Business Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="businessType" className="text-[#4e342e] font-medium">Business Type</Label>
                          <select
                            id="businessType"
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            className="mt-2 w-full px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          >
                            {businessTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="yearsInBusiness" className="text-[#4e342e] font-medium">Years in Business</Label>
                          <Input
                            id="yearsInBusiness"
                            type="number"
                            min="1"
                            value={formData.yearsInBusiness}
                            onChange={(e) => setFormData({ ...formData, yearsInBusiness: parseInt(e.target.value) || 1 })}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="numberOfEmployees" className="text-[#4e342e] font-medium">Number of Employees</Label>
                          <Input
                            id="numberOfEmployees"
                            type="number"
                            min="1"
                            value={formData.numberOfEmployees}
                            onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 1 })}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-[#4e342e] mb-2">Contact Information</h4>
                          <div className="space-y-2 text-[#6d4c41]">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{profile.user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{profile.user.phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-[#4e342e] mb-2">Business Details</h4>
                          <div className="space-y-2 text-[#6d4c41]">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4" />
                              <span>{businessTypes.find(t => t.value === profile.businessType)?.label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4" />
                              <span>{profile.yearsInBusiness} years in business</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-[#4e342e] mb-2">Address</h4>
                        <div className="flex items-start space-x-2 text-[#6d4c41]">
                          <MapPin className="w-4 h-4 mt-1" />
                          <div>
                            <p>{profile.address || 'Not provided'}</p>
                            <p>{profile.city || ''}, {profile.state || ''} {profile.zipCode || ''}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-[#4e342e] mb-2">Business Description</h4>
                        <p className="text-[#6d4c41]">{profile.description || 'No description available'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-[#4e342e] mb-2">Services Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.servicesOffered && profile.servicesOffered.length > 0 ? (
                            profile.servicesOffered.map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No services listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Operating Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.operatingHours && Object.keys(profile.operatingHours).length > 0 ? (
                    Object.entries(profile.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between p-3 bg-[#f8d7da]/20 rounded-lg">
                        <span className="capitalize font-medium text-[#4e342e]">{day}</span>
                        <span className="text-[#6d4c41]">
                          {hours?.open} - {hours?.close}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No operating hours set</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  Upload,
  Camera
} from 'lucide-react';

interface VendorRegistrationData {
  // User details
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Vendor details
  shopname: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessType: string;
  yearsInBusiness: string;
  specialties: string[];
}

const VendorRegistrationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VendorRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    shopname: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'DR Congo',
    businessType: '',
    yearsInBusiness: '',
    specialties: []
  });

  const businessTypes = [
    { key: 'beautySalon', label: t('vendor.registration.businessTypes.beautySalon') },
    { key: 'hairSalon', label: t('vendor.registration.businessTypes.hairSalon') },
    { key: 'nailSalon', label: t('vendor.registration.businessTypes.nailSalon') },
    { key: 'spaCenter', label: t('vendor.registration.businessTypes.spaCenter') },
    { key: 'barbershop', label: t('vendor.registration.businessTypes.barbershop') },
    { key: 'beautyClinic', label: t('vendor.registration.businessTypes.beautyClinic') },
    { key: 'mobileBeautyService', label: t('vendor.registration.businessTypes.mobileBeautyService') },
    { key: 'other', label: t('vendor.registration.businessTypes.other') }
  ];

  const specialtyOptions = [
    { key: 'hairStyling', label: t('vendor.registration.specialtyOptions.hairStyling') },
    { key: 'hairColoring', label: t('vendor.registration.specialtyOptions.hairColoring') },
    { key: 'hairCutting', label: t('vendor.registration.specialtyOptions.hairCutting') },
    { key: 'facialTreatments', label: t('vendor.registration.specialtyOptions.facialTreatments') },
    { key: 'makeup', label: t('vendor.registration.specialtyOptions.makeup') },
    { key: 'nailArt', label: t('vendor.registration.specialtyOptions.nailArt') },
    { key: 'manicure', label: t('vendor.registration.specialtyOptions.manicure') },
    { key: 'pedicure', label: t('vendor.registration.specialtyOptions.pedicure') },
    { key: 'massage', label: t('vendor.registration.specialtyOptions.massage') },
    { key: 'spaTreatments', label: t('vendor.registration.specialtyOptions.spaTreatments') },
    { key: 'bridalServices', label: t('vendor.registration.specialtyOptions.bridalServices') },
    { key: 'mensGrooming', label: t('vendor.registration.specialtyOptions.mensGrooming') }
  ];

  const handleInputChange = (field: keyof VendorRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;
    return firstName && lastName && email && password && confirmPassword && phone && password === confirmPassword;
  };

  const validateStep2 = () => {
    const { shopname, description, address, city, state, zipCode, businessType } = formData;
    return shopname && description && address && city && state && zipCode && businessType;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map form data to the format expected by AuthContext
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'VENDOR' as const
      };

      await register(registerData);
      // Success toast is handled by AuthContext
      navigate('/vendor');
    } catch (error) {
      // Error toast is handled by AuthContext
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12 bg-gradient-to-br from-[#fdf6f0] to-[#f8d7da]/20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            {...fadeInUp}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#4e342e] rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#4e342e]">
                  Join as a Vendor
                </h1>
              </div>
              <p className="text-[#6d4c41] text-lg">
                Register your salon or beauty service to start accepting bookings
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step 
                        ? 'bg-[#4e342e] text-white' 
                        : 'bg-[#f8d7da] text-[#6d4c41]'
                    }`}>
                      {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-0.5 ${
                        currentStep > step ? 'bg-[#4e342e]' : 'bg-[#f8d7da]'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] text-center">
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Business Details'}
                  {currentStep === 3 && 'Specialties & Review'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-[#4e342e] font-medium">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-[#4e342e] font-medium">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-[#4e342e] font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-[#4e342e] font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password" className="text-[#4e342e] font-medium">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword" className="text-[#4e342e] font-medium">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Business Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="shopname" className="text-[#4e342e] font-medium">Salon/Shop Name</Label>
                        <Input
                          id="shopname"
                          value={formData.shopname}
                          onChange={(e) => handleInputChange('shopname', e.target.value)}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessType" className="text-[#4e342e] font-medium">Business Type</Label>
                        <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                          <SelectTrigger className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-[#4e342e] font-medium">Business Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          rows={4}
                          placeholder="Describe your salon, services, and what makes you unique..."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-[#4e342e] font-medium">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-[#4e342e] font-medium">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-[#4e342e] font-medium">State/Province</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="text-[#4e342e] font-medium">ZIP/Postal Code</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="yearsInBusiness" className="text-[#4e342e] font-medium">Years in Business</Label>
                        <Select value={formData.yearsInBusiness} onValueChange={(value) => handleInputChange('yearsInBusiness', value)}>
                          <SelectTrigger className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20">
                            <SelectValue placeholder="Select years in business" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', 'More than 10 years'].map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Specialties & Review */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-[#4e342e] font-medium mb-4 block">Services & Specialties</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {specialtyOptions.map((specialty) => (
                            <button
                              key={specialty.key}
                              type="button"
                              onClick={() => handleSpecialtyToggle(specialty.key)}
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-300 ${
                                formData.specialties.includes(specialty.key)
                                  ? 'border-[#4e342e] bg-[#4e342e] text-white'
                                  : 'border-[#f8d7da] text-[#4e342e] hover:border-[#4e342e] hover:bg-[#f8d7da]/20'
                              }`}
                            >
                              {specialty.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Section */}
                      <div className="bg-[#f8d7da]/10 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-[#4e342e] mb-4">Review Your Information</h3>
                        <div className="space-y-3 text-sm">
                          <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
                          <div><strong>Email:</strong> {formData.email}</div>
                          <div><strong>Phone:</strong> {formData.phone}</div>
                          <div><strong>Business:</strong> {formData.shopname}</div>
                          <div><strong>Type:</strong> {formData.businessType}</div>
                          <div><strong>Location:</strong> {formData.address}, {formData.city}, {formData.state}</div>
                          <div><strong>Specialties:</strong> {formData.specialties.join(', ') || 'None selected'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t">
                    <div>
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      {currentStep < 3 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={
                            (currentStep === 1 && !validateStep1()) ||
                            (currentStep === 2 && !validateStep2())
                          }
                          className="bg-[#4e342e] hover:bg-[#6d4c41] text-white"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={loading || formData.specialties.length === 0}
                          className="bg-[#4e342e] hover:bg-[#6d4c41] text-white"
                        >
                          {loading ? 'Creating Account...' : 'Complete Registration'}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-[#6d4c41]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#4e342e] hover:text-[#6d4c41] font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationPage;

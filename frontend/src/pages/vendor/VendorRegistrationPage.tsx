import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Scissors, 
  Sparkles, 
  Heart,
  CheckCircle,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceCategory {
  id: string;
  name: string;
  icon: any;
}

interface VendorForm {
  shopname: string;
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  description: string;
  services: string[];
}

const VendorRegistrationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState<VendorForm>({
    shopname: '',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'DR Congo',
    description: '',
    services: []
  });
  const [loading, setLoading] = useState(false);

  const serviceCategories: ServiceCategory[] = [
    { id: 'hair', name: 'Hair Styling', icon: Scissors },
    { id: 'face', name: 'Facial Treatment', icon: Sparkles },
    { id: 'extras', name: 'Nail Care & Extras', icon: Heart }
  ];

  const handleInputChange = (field: keyof VendorForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.shopname || !form.ownerFirstName || !form.ownerLastName || !form.email || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (form.services.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }

    setLoading(true);

    try {
      // Simulate vendor registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store vendor data (in a real app, this would be sent to the backend)
      const vendorData = {
        id: Date.now().toString(),
        shopname: form.shopname,
        owner: {
          firstName: form.ownerFirstName,
          lastName: form.ownerLastName,
          email: form.email,
          phone: form.phone
        },
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country
        },
        description: form.description,
        services: form.services,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Store in session storage for demo purposes
      sessionStorage.setItem('pendingVendor', JSON.stringify(vendorData));
      
      toast.success('Vendor registration submitted successfully!');
      
      // Navigate to login or success page
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-[#4e342e] hover:text-[#3b2c26]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-4">
            Register Your Salon/Shop
          </h1>
          <p className="text-lg text-[#6d4c41]">
            Join our platform and start offering your beauty services to customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Shop Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                <Building className="w-5 h-5" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shopname" className="text-[#4e342e] font-medium">
                  Shop/Salon Name *
                </Label>
                <Input
                  id="shopname"
                  value={form.shopname}
                  onChange={(e) => handleInputChange('shopname', e.target.value)}
                  placeholder="Enter your shop or salon name"
                  className="border-[#4e342e] text-[#4e342e]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#4e342e] font-medium">
                  Shop Description
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your shop, services, and what makes you unique..."
                  className="border-[#4e342e] text-[#4e342e]"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerFirstName" className="text-[#4e342e] font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="ownerFirstName"
                    value={form.ownerFirstName}
                    onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="border-[#4e342e] text-[#4e342e]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ownerLastName" className="text-[#4e342e] font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="ownerLastName"
                    value={form.ownerLastName}
                    onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="border-[#4e342e] text-[#4e342e]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-[#4e342e] font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="border-[#4e342e] text-[#4e342e]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-[#4e342e] font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+243 123 456 789"
                    className="border-[#4e342e] text-[#4e342e]"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shop Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street" className="text-[#4e342e] font-medium">
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={form.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Enter street address"
                  className="border-[#4e342e] text-[#4e342e]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-[#4e342e] font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="border-[#4e342e] text-[#4e342e]"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-[#4e342e] font-medium">
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state"
                    className="border-[#4e342e] text-[#4e342e]"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode" className="text-[#4e342e] font-medium">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={form.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Enter ZIP code"
                    className="border-[#4e342e] text-[#4e342e]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-[#4e342e] font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="border-[#4e342e] text-[#4e342e]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Services Offered *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#6d4c41] mb-4">
                Select the types of services your shop offers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {serviceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="flex items-center space-x-2 p-4 border border-[#fdf6f0] rounded-lg hover:bg-[#fdf6f0] transition-colors">
                      <Checkbox
                        id={category.id}
                        checked={form.services.includes(category.id)}
                        onCheckedChange={() => handleServiceToggle(category.id)}
                        className="border-[#4e342e] data-[state=checked]:bg-[#4e342e]"
                      />
                      <Label htmlFor={category.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-4 h-4 text-[#4e342e]" />
                        <span className="text-[#4e342e] font-medium">{category.name}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card className="border-0 shadow-lg bg-[#fdf6f0]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#4e342e] mt-0.5" />
                <div className="text-sm text-[#6d4c41]">
                  <p className="font-medium mb-2">Registration Terms:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Your application will be reviewed by our team</li>
                    <li>• You'll receive an email confirmation once approved</li>
                    <li>• You can start accepting bookings after approval</li>
                    <li>• We take a small commission from each booking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit"
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-12 py-4 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default VendorRegistrationPage;

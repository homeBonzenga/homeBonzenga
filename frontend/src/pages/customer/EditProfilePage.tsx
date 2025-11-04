import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  bio: z.string().optional(),
  notifications: z.boolean(),
  preferredServices: z.array(z.string()).optional(),
  preferredTimeSlots: z.array(z.string()).optional(),
});

const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  label: z.string().min(1, 'Label is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  isDefault: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
}

const EditProfilePage = () => {
  const { user } = useSupabaseAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      bio: '',
      notifications: true,
      preferredServices: [],
      preferredTimeSlots: [],
    },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: 'home',
      label: '',
      address: '',
      city: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    // Load existing addresses
    setAddresses([
      {
        id: '1',
        type: 'home',
        label: 'Home',
        address: '123 Main Street, Gombe',
        city: 'Kinshasa',
        isDefault: true,
      },
      {
        id: '2',
        type: 'work',
        label: 'Office',
        address: '456 Business District, Limete',
        city: 'Kinshasa',
        isDefault: false,
      },
    ]);
  }, []);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Profile updated:', data);
      toast.success('Profile updated successfully!');
      navigate('/customer/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onAddressSubmit = (data: AddressFormData) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...addr, ...data } : addr
      ));
      toast.success('Address updated successfully!');
    } else {
      // Add new address
      const newAddress: Address = {
        ...data,
        id: Date.now().toString(),
      };
      setAddresses(prev => [...prev, newAddress]);
      toast.success('Address added successfully!');
    }
    
    setShowAddressForm(false);
    setEditingAddress(null);
    addressForm.reset();
  };

  const deleteAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    toast.success('Address deleted successfully!');
  };

  const setDefaultAddress = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    toast.success('Default address updated!');
  };

  const editAddress = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset(address);
    setShowAddressForm(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif font-bold text-[#4e342e]">Edit Profile</h1>
            <Button 
              variant="outline"
              onClick={() => navigate('/customer/profile')}
              className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <div className="lg:col-span-1">
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-[#4e342e] to-[#6d4c41] text-white text-3xl">
                          {getInitials(user?.firstName || '', user?.lastName || '')}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        size="sm" 
                        className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full p-0 bg-white border-2 border-[#4e342e] hover:bg-[#f8d7da]"
                      >
                        <Camera className="w-5 h-5 text-[#4e342e]" />
                      </Button>
                    </div>
                    <p className="text-sm text-[#6d4c41]">Click to change profile photo</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-serif font-bold text-[#4e342e] flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself..." 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Email Notifications</FormLabel>
                              <p className="text-sm text-[#6d4c41]">Receive booking updates and promotions</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/customer/profile')}
                          className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  </Form>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-serif font-bold text-[#4e342e] flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Saved Addresses
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddressForm(true)}
                      className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Address
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-[#4e342e]">{address.label}</span>
                            {address.isDefault && (
                              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-[#6d4c41] text-sm">{address.address}</p>
                          <p className="text-[#6d4c41] text-sm">{address.city}</p>
                        </div>
                        <div className="flex space-x-2">
                          {!address.isDefault && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDefaultAddress(address.id)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => editAddress(address)}
                            className="text-[#4e342e] hover:bg-[#f8d7da]"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteAddress(address.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Address Form Modal */}
          {showAddressForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md border-0 bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-serif font-bold text-[#4e342e]">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                      <FormField
                        control={addressForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Type</FormLabel>
                            <FormControl>
                              <select 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...field}
                              >
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Home, Office" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter full address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>Set as Default</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            addressForm.reset();
                          }}
                          className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                        >
                          {editingAddress ? 'Update' : 'Add'} Address
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfilePage;

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User, 
  Mail, 
  Phone, 
  Users,
  Building,
  Calendar,
  Edit, 
  Save, 
  X, 
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  totalUsers: number;
  totalVendors: number;
  totalManagers: number;
  totalBookings: number;
  createdAt: string;
}

const AdminProfilePage = () => {
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || ''
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: ''
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4e342e]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-[#6d4c41] mx-auto mb-4" />
            <p className="text-[#6d4c41]">Failed to load profile</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#fdf6f0] p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4e342e]">
                  Admin Profile
                </h1>
                <p className="text-base sm:text-lg text-[#6d4c41] mt-1 sm:mt-2">
                  Manage your profile and view system statistics
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#4e342e] hover:bg-[#3b2c26] text-white text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base w-full sm:w-auto"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white text-sm sm:text-base w-full sm:w-auto"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-serif font-bold text-[#4e342e] flex items-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-[#6d4c41] font-medium text-sm sm:text-base">
                        First Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="mt-1 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="mt-1 text-[#4e342e] font-medium text-sm sm:text-base">{profile.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-[#6d4c41] font-medium text-sm sm:text-base">
                        Last Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="mt-1 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="mt-1 text-[#4e342e] font-medium text-sm sm:text-base">{profile.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-[#6d4c41] font-medium">
                      Email Address
                    </Label>
                    <div className="mt-1 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-[#6d4c41]" />
                      <p className="text-[#4e342e] font-medium">{profile.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role" className="text-[#6d4c41] font-medium">
                      Role
                    </Label>
                    <div className="mt-1 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-[#6d4c41]" />
                      <p className="text-[#4e342e] font-medium">{profile.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-serif font-bold text-[#4e342e]">
                    System Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-[#6d4c41]" />
                      <span className="text-[#6d4c41]">Total Users</span>
                    </div>
                    <span className="text-[#4e342e] font-bold">{profile.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-[#6d4c41]" />
                      <span className="text-[#6d4c41]">Total Vendors</span>
                    </div>
                    <span className="text-[#4e342e] font-bold">{profile.totalVendors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-[#6d4c41]" />
                      <span className="text-[#6d4c41]">Total Managers</span>
                    </div>
                    <span className="text-[#4e342e] font-bold">{profile.totalManagers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#6d4c41]" />
                      <span className="text-[#6d4c41]">Total Bookings</span>
                    </div>
                    <span className="text-[#4e342e] font-bold">{profile.totalBookings}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfilePage;

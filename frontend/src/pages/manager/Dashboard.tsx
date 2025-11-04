import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  UserCheck,
  MapPin,
  Settings,
  Loader2,
  Building,
  Phone,
  Mail,
  User,
  X,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

interface ManagerStats {
  pendingVendorApplications: number;
  totalActiveVendors: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface PendingVendor {
  id: string;
  shopname: string;
  businessType: string;
  city: string;
  state: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  status: string;
}


interface RecentAppointment {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  vendor: {
    shopname: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  total: number;
  serviceType: string;
}

const ManagerDashboard = () => {
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      // Fetch real data from API
      const response = await fetch('http://localhost:3001/api/manager/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Set stats from API
        setStats({
          pendingVendorApplications: data.stats.pendingVendorApplications || 0,
          totalActiveVendors: data.stats.totalActiveVendors || 0,
          totalAppointments: data.stats.totalAppointments || 0,
          pendingAppointments: data.stats.pendingAppointments || 0,
          completedAppointments: data.stats.completedAppointments || 0,
          totalRevenue: data.stats.totalRevenue || 0,
          monthlyRevenue: data.stats.monthlyRevenue || 0
        });
        
        // Transform pending vendors from API
        setPendingVendors((data.pendingVendors || []).map((vendor: any) => ({
          id: vendor.id,
          shopname: vendor.shopName,
          businessType: 'salon', // Default
          city: vendor.city || 'Unknown',
          state: vendor.state || 'Unknown',
          user: {
            firstName: vendor.user?.firstName || 'Unknown',
            lastName: vendor.user?.lastName || '',
            email: vendor.user?.email || '',
            phone: vendor.user?.phone || ''
          },
          createdAt: vendor.createdAt,
          status: vendor.status.toUpperCase()
        })));
        
        // Transform recent appointments from API
        setRecentAppointments((data.recentAppointments || []).map((appointment: any) => ({
          id: appointment.id,
          customer: {
            firstName: appointment.customer?.firstName || 'Unknown',
            lastName: appointment.customer?.lastName || '',
            email: appointment.customer?.email || ''
          },
          vendor: {
            shopname: appointment.vendor?.shopName || 'Unknown'
          },
          scheduledDate: appointment.scheduledDate,
          scheduledTime: appointment.scheduledTime,
          status: appointment.status,
          total: appointment.total,
          serviceType: appointment.items?.[0]?.service?.name || 'Service'
        })));
      } else {
        // Fallback to empty data on error
        console.warn('Failed to fetch manager data, using empty data');
        setStats({
          pendingVendorApplications: 0,
          totalActiveVendors: 0,
          totalAppointments: 0,
          pendingAppointments: 0,
          completedAppointments: 0,
          totalRevenue: 0,
          monthlyRevenue: 0
        });
        setPendingVendors([]);
        setRecentAppointments([]);
      }
    } catch (error) {
      console.error('Error loading manager data:', error);
      // Fallback to empty data
      setStats({
        pendingVendorApplications: 0,
        totalActiveVendors: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      });
      setPendingVendors([]);
      setRecentAppointments([]);
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
        toast.success(`Vendor ${action}d successfully! Email notification sent.`, {
          description: action === 'approve' 
            ? 'The vendor can now access their dashboard.'
            : 'Rejection email sent to vendor.'
        });
        fetchManagerData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({ message: `Failed to ${action} vendor` }));
        toast.error(errorData.message || `Failed to ${action} vendor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      toast.error(`Failed to ${action} vendor: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };



  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading manager dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4e342e]">
                Manager Dashboard
              </h1>
              <p className="text-[#6d4c41] mt-2">
                Welcome back, {user?.firstName}! Manage assignments and monitor operations.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Link to="/manager/reports">
                <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Vendor Applications</p>
                    <p className="text-2xl font-bold text-primary">{stats.pendingVendorApplications}</p>
                  </div>
                  <Building className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>


            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Active Vendors</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalActiveVendors}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appointments Overview</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Vendor Applications */}
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif font-bold text-[#4e342e] flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Pending Vendor Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVendors.length > 0 ? (
                  pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 border border-[#f8d7da] rounded-lg bg-[#fdf6f0]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-[#4e342e]">{vendor.shopname}</h4>
                          <p className="text-sm text-[#6d4c41]">{vendor.user.firstName} {vendor.user.lastName}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {vendor.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-[#6d4c41] mb-3">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{vendor.businessType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{vendor.city}, {vendor.state}</span>
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
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleVendorAction(vendor.id, 'approve')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleVendorAction(vendor.id, 'reject')}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 text-[#6d4c41] mx-auto mb-4" />
                    <p className="text-[#6d4c41]">No pending vendor applications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Recent Appointments */}
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif font-bold text-[#4e342e] flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Recent Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-[#fdf6f0] rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#4e342e] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#4e342e]">
                            {appointment.customer.firstName} {appointment.customer.lastName}
                          </h4>
                          <p className="text-sm text-[#6d4c41]">{appointment.vendor.shopname}</p>
                          <p className="text-sm text-[#6d4c41]">{appointment.serviceType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#6d4c41] mb-1">
                          {new Date(appointment.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-[#6d4c41] mb-2">
                          {appointment.scheduledTime}
                        </div>
                        <Badge className={`px-2 py-1 text-xs ${
                          appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-[#6d4c41] mx-auto mb-4" />
                    <p className="text-[#6d4c41]">No recent appointments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif font-bold text-[#4e342e]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/manager/pending-vendors">
                  <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white justify-start h-auto p-4 w-full">
                    <div className="text-left">
                      <AlertCircle className="w-5 h-5 mb-2" />
                      <div className="font-semibold">Pending Vendors</div>
                      <div className="text-xs opacity-80">Review applications</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/manager/vendors">
                  <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white justify-start h-auto p-4 w-full">
                    <div className="text-left">
                      <Building className="w-5 h-5 mb-2" />
                      <div className="font-semibold">All Vendors</div>
                      <div className="text-xs opacity-80">Manage vendors</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/manager/appointments">
                  <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white justify-start h-auto p-4 w-full">
                    <div className="text-left">
                      <Calendar className="w-5 h-5 mb-2" />
                      <div className="font-semibold">Appointments</div>
                      <div className="text-xs opacity-80">Manage bookings</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/manager/at-home-appointments">
                  <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white justify-start h-auto p-4 w-full">
                    <div className="text-left">
                      <Home className="w-5 h-5 mb-2" />
                      <div className="font-semibold">At-Home Appointments</div>
                      <div className="text-xs opacity-80">Assign vendors</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/manager/reports">
                  <Button variant="outline" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white justify-start h-auto p-4 w-full">
                    <div className="text-left">
                      <TrendingUp className="w-5 h-5 mb-2" />
                      <div className="font-semibold">Reports</div>
                      <div className="text-xs opacity-80">Analytics & insights</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;

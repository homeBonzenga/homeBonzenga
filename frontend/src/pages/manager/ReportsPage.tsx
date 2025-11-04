import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Loader2,
  Star,
  Activity,
  Target,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ManagerStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalCustomers: number;
}

interface VendorPerformance {
  id: string;
  shopname: string;
  businessType: string;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

interface MonthlyData {
  month: string;
  vendors: number;
  appointments: number;
  revenue: number;
}

const ReportsPage = () => {
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchReportsData();
  }, [timeRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/manager/reports?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setVendorPerformance(data.vendorPerformance || []);
        setMonthlyData(data.monthlyData || []);
      } else {
        // Fallback to mock data
        setStats({
          totalVendors: 15,
          activeVendors: 12,
          pendingVendors: 3,
          totalAppointments: 156,
          completedAppointments: 142,
          pendingAppointments: 8,
          totalRevenue: 12500,
          monthlyRevenue: 3200,
          averageRating: 4.6,
          totalCustomers: 89
        });
        
        setVendorPerformance([
          {
            id: '1',
            shopname: 'Elegant Beauty Salon',
            businessType: 'salon',
            totalBookings: 45,
            completedBookings: 42,
            totalRevenue: 3200,
            averageRating: 4.8,
            totalReviews: 38
          },
          {
            id: '2',
            shopname: 'Zen Spa & Wellness',
            businessType: 'spa',
            totalBookings: 32,
            completedBookings: 30,
            totalRevenue: 2800,
            averageRating: 4.6,
            totalReviews: 25
          },
          {
            id: '3',
            shopname: 'Nail Art Studio',
            businessType: 'nail_salon',
            totalBookings: 28,
            completedBookings: 26,
            totalRevenue: 1200,
            averageRating: 4.4,
            totalReviews: 18
          }
        ]);
        
        setMonthlyData([
          { month: 'Jan', vendors: 8, appointments: 45, revenue: 2800 },
          { month: 'Feb', vendors: 10, appointments: 52, revenue: 3100 },
          { month: 'Mar', vendors: 11, appointments: 48, revenue: 2900 },
          { month: 'Apr', vendors: 12, appointments: 55, revenue: 3200 },
          { month: 'May', vendors: 13, appointments: 58, revenue: 3400 },
          { month: 'Jun', vendors: 15, appointments: 62, revenue: 3600 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBusinessTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'salon': 'Beauty Salon',
      'spa': 'Spa & Wellness',
      'beauty_center': 'Beauty Center',
      'nail_salon': 'Nail Salon',
      'barbershop': 'Barbershop'
    };
    return types[type] || type;
  };

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

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

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No Reports Data</h3>
              <p className="text-[#6d4c41]">Reports data will appear here once you have vendors and appointments.</p>
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
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Reports & Analytics</h1>
              <p className="text-[#6d4c41]">Comprehensive overview of platform performance</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6d4c41]">Total Vendors</p>
                      <p className="text-2xl font-bold text-[#4e342e]">{stats.totalVendors}</p>
                      <div className="flex items-center mt-2">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {stats.activeVendors} Active
                        </Badge>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6d4c41]">Total Appointments</p>
                      <p className="text-2xl font-bold text-[#4e342e]">{stats.totalAppointments}</p>
                      <div className="flex items-center mt-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{stats.completedAppointments} completed</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6d4c41]">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#4e342e]">{formatCurrency(stats.totalRevenue)}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{formatCurrency(stats.monthlyRevenue)} this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6d4c41]">Average Rating</p>
                      <p className="text-2xl font-bold text-[#4e342e]">{stats.averageRating}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-yellow-600">Platform average</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vendor Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#4e342e] flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Top Performing Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendorPerformance.map((vendor, index) => (
                      <div key={vendor.id} className="flex items-center justify-between p-3 bg-[#f8d7da]/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-[#4e342e]">{vendor.shopname}</p>
                            <p className="text-sm text-[#6d4c41]">{getBusinessTypeLabel(vendor.businessType)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#4e342e]">{formatCurrency(vendor.totalRevenue)}</p>
                          <p className="text-sm text-[#6d4c41]">{vendor.completedBookings} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#4e342e] flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((month, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#4e342e]">{month.month}</span>
                          <span className="text-sm text-[#6d4c41]">{formatCurrency(month.revenue)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-[#f8d7da]/30 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[#4e342e] to-[#6d4c41] h-2 rounded-full"
                              style={{ width: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-[#6d4c41] w-16 text-right">
                            {month.appointments} apps
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Pending Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8"
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#4e342e] mb-1">{stats.pendingVendors}</h3>
                    <p className="text-sm text-[#6d4c41]">Pending Vendor Applications</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#4e342e] mb-1">{stats.pendingAppointments}</h3>
                    <p className="text-sm text-[#6d4c41]">Pending Appointments</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#4e342e] mb-1">{stats.totalCustomers}</h3>
                    <p className="text-sm text-[#6d4c41]">Total Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;

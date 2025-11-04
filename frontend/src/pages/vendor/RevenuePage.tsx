import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface RevenueData {
  total: number;
  thisMonth: number;
  lastMonth: number;
  monthly: Array<{
    month: string;
    amount: number;
  }>;
}

interface ServiceRevenue {
  service: string;
  revenue: number;
  bookings: number;
}

const RevenuePage = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  const COLORS = ['#4e342e', '#6d4c41', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8'];

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const mockData = await import('@/mockData/vendors.json');
      const vendorData = mockData.default.vendors.find(v => v.status === 'approved') || mockData.default.vendors[0];
      
      setRevenueData(vendorData.revenue);
      
      // Calculate service revenue from appointments
      const serviceStats: { [key: string]: { revenue: number; bookings: number } } = {};
      vendorData.appointments.forEach((appointment: any) => {
        if (appointment.status === 'completed') {
          if (!serviceStats[appointment.service]) {
            serviceStats[appointment.service] = { revenue: 0, bookings: 0 };
          }
          serviceStats[appointment.service].revenue += appointment.total;
          serviceStats[appointment.service].bookings += 1;
        }
      });

      const serviceRevenueData = Object.entries(serviceStats).map(([service, stats]) => ({
        service,
        revenue: stats.revenue,
        bookings: stats.bookings
      }));

      setServiceRevenue(serviceRevenueData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = () => {
    if (!revenueData) return 0;
    if (revenueData.lastMonth === 0) return 100;
    return ((revenueData.thisMonth - revenueData.lastMonth) / revenueData.lastMonth) * 100;
  };

  const getGrowthIcon = () => {
    const growth = getGrowthPercentage();
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getGrowthColor = () => {
    const growth = getGrowthPercentage();
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const exportRevenueReport = () => {
    if (!revenueData) return;
    
    const reportContent = `
REVENUE REPORT
==============

Total Revenue: ${revenueData.total.toLocaleString()} CDF
This Month: ${revenueData.thisMonth.toLocaleString()} CDF
Last Month: ${revenueData.lastMonth.toLocaleString()} CDF
Growth: ${getGrowthPercentage().toFixed(1)}%

MONTHLY BREAKDOWN:
${revenueData.monthly.map(month => 
  `${month.month}: ${month.amount.toLocaleString()} CDF`
).join('\n')}

SERVICE BREAKDOWN:
${serviceRevenue.map(service => 
  `${service.service}: ${service.revenue.toLocaleString()} CDF (${service.bookings} bookings)`
).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Revenue report downloaded successfully!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading revenue data...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!revenueData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">No revenue data available</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">
                Revenue Analytics
              </h1>
              <p className="text-lg text-[#6d4c41]">
                Track your salon's financial performance
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={exportRevenueReport}
                className="flex items-center gap-2 px-4 py-2 bg-[#4e342e] text-white rounded-lg hover:bg-[#3b2c26] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6d4c41]">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#4e342e]">
                    {revenueData.total.toLocaleString()} CDF
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-[#4e342e]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6d4c41]">This Month</p>
                  <p className="text-2xl font-bold text-[#4e342e]">
                    {revenueData.thisMonth.toLocaleString()} CDF
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-[#4e342e]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6d4c41]">Growth</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${getGrowthColor()}`}>
                      {getGrowthPercentage().toFixed(1)}%
                    </p>
                    <div className={getGrowthColor()}>
                      {getGrowthIcon()}
                    </div>
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-[#4e342e]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} CDF`, 'Revenue']}
                      labelStyle={{ color: '#4e342e' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4e342e" 
                      strokeWidth={3}
                      dot={{ fill: '#4e342e', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Service Revenue Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Revenue by Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={serviceRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ service, percent }) => `${service} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {serviceRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} CDF`, 'Revenue']}
                      labelStyle={{ color: '#4e342e' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Performance Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-[#4e342e] flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#fdf6f0]">
                    <th className="text-left py-3 px-4 font-medium text-[#4e342e]">Service</th>
                    <th className="text-right py-3 px-4 font-medium text-[#4e342e]">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-[#4e342e]">Bookings</th>
                    <th className="text-right py-3 px-4 font-medium text-[#4e342e]">Avg. Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRevenue.map((service, index) => (
                    <tr key={service.service} className="border-b border-[#fdf6f0] hover:bg-[#fdf6f0]">
                      <td className="py-3 px-4 text-[#6d4c41]">{service.service}</td>
                      <td className="py-3 px-4 text-right font-medium text-[#4e342e]">
                        {service.revenue.toLocaleString()} CDF
                      </td>
                      <td className="py-3 px-4 text-right text-[#6d4c41]">
                        {service.bookings}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6d4c41]">
                        {Math.round(service.revenue / service.bookings).toLocaleString()} CDF
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RevenuePage;

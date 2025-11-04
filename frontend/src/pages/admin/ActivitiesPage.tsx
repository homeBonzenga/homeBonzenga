import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  CreditCard,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  Loader2,
  Activity,
  UserCheck,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  Package,
  Star,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'vendor_approval' | 'booking_completed' | 'payment_processed' | 'dispute_created' | 'refund_processed' | 'manager_approval' | 'beautician_approval' | 'vendor_suspension' | 'user_suspension';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  vendor?: {
    name: string;
    businessName: string;
    email: string;
  };
  amount?: number;
  status?: 'success' | 'pending' | 'failed' | 'cancelled';
  location?: string;
  details?: string;
}

const ActivitiesPage = () => {
  const { user } = useSupabaseAuth();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, typeFilter, statusFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'user_registration',
          title: 'New User Registration',
          description: 'A new user has registered on the platform',
          timestamp: '2024-12-20T10:30:00Z',
          user: { name: 'Marie Kabila', email: 'marie.kabila@example.com', phone: '+243 777 888 999' },
          status: 'success'
        },
        {
          id: '2',
          type: 'vendor_approval',
          title: 'Vendor Approved',
          description: 'A vendor has been approved by manager',
          timestamp: '2024-12-20T09:15:00Z',
          vendor: { name: 'Grace Mbuyi', businessName: 'Belle Époque Salon', email: 'grace@bellepoque.com' },
          status: 'success'
        },
        {
          id: '3',
          type: 'booking_completed',
          title: 'Booking Completed',
          description: 'A beauty service booking has been completed',
          timestamp: '2024-12-20T08:45:00Z',
          user: { name: 'Sarah Johnson', email: 'sarah.j@example.com' },
          amount: 150000,
          location: 'At-Home Service',
          status: 'success'
        },
        {
          id: '4',
          type: 'payment_processed',
          title: 'Payment Processed',
          description: 'Payment has been successfully processed',
          timestamp: '2024-12-20T08:30:00Z',
          user: { name: 'Maria Garcia', email: 'maria.g@example.com' },
          amount: 85000,
          status: 'success'
        },
        {
          id: '5',
          type: 'dispute_created',
          title: 'Dispute Created',
          description: 'A customer has created a dispute',
          timestamp: '2024-12-20T07:20:00Z',
          user: { name: 'Emma Wilson', email: 'emma.w@example.com' },
          amount: 120000,
          status: 'pending'
        },
        {
          id: '6',
          type: 'refund_processed',
          title: 'Refund Processed',
          description: 'Refund has been processed for a cancelled booking',
          timestamp: '2024-12-20T06:15:00Z',
          user: { name: 'Priya Sharma', email: 'priya.s@example.com' },
          amount: 95000,
          status: 'success'
        },
        {
          id: '7',
          type: 'manager_approval',
          title: 'Manager Approval',
          description: 'A beautician has been approved by manager',
          timestamp: '2024-12-19T16:45:00Z',
          user: { name: 'John Doe', email: 'john.doe@example.com' },
          status: 'success'
        },
        {
          id: '8',
          type: 'beautician_approval',
          title: 'Beautician Final Approval',
          description: 'A beautician has received final admin approval',
          timestamp: '2024-12-19T15:30:00Z',
          user: { name: 'Lisa Chen', email: 'lisa.chen@example.com' },
          status: 'success'
        },
        {
          id: '9',
          type: 'vendor_suspension',
          title: 'Vendor Suspended',
          description: 'A vendor has been suspended due to policy violation',
          timestamp: '2024-12-19T14:20:00Z',
          vendor: { name: 'Mike Johnson', businessName: 'Quick Beauty', email: 'mike@quickbeauty.com' },
          status: 'success'
        },
        {
          id: '10',
          type: 'user_suspension',
          title: 'User Suspended',
          description: 'A user account has been suspended',
          timestamp: '2024-12-19T13:10:00Z',
          user: { name: 'Robert Smith', email: 'robert.smith@example.com' },
          status: 'success'
        },
        {
          id: '11',
          type: 'payment_processed',
          title: 'Payment Failed',
          description: 'Payment processing failed due to insufficient funds',
          timestamp: '2024-12-19T12:00:00Z',
          user: { name: 'Anna Brown', email: 'anna.brown@example.com' },
          amount: 75000,
          status: 'failed'
        },
        {
          id: '12',
          type: 'booking_completed',
          title: 'Booking Cancelled',
          description: 'A booking has been cancelled by customer',
          timestamp: '2024-12-19T11:30:00Z',
          user: { name: 'David Lee', email: 'david.lee@example.com' },
          amount: 110000,
          status: 'cancelled'
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.vendor?.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter);
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-5 h-5" />;
      case 'vendor_approval':
        return <Building className="w-5 h-5" />;
      case 'booking_completed':
        return <Calendar className="w-5 h-5" />;
      case 'payment_processed':
        return <CreditCard className="w-5 h-5" />;
      case 'dispute_created':
        return <AlertCircle className="w-5 h-5" />;
      case 'refund_processed':
        return <RefreshCw className="w-5 h-5" />;
      case 'manager_approval':
        return <UserCheck className="w-5 h-5" />;
      case 'beautician_approval':
        return <CheckCircle className="w-5 h-5" />;
      case 'vendor_suspension':
        return <Shield className="w-5 h-5" />;
      case 'user_suspension':
        return <Shield className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-[#f8d7da]/30 text-[#4e342e]';
      case 'pending':
        return 'bg-[#6d4c41]/20 text-[#6d4c41]';
      case 'failed':
        return 'bg-[#6d4c41]/20 text-[#6d4c41]';
      case 'cancelled':
        return 'bg-[#6d4c41]/20 text-[#6d4c41]';
      default:
        return 'bg-[#6d4c41]/20 text-[#6d4c41]';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'User Registration';
      case 'vendor_approval':
        return 'Vendor Approval';
      case 'booking_completed':
        return 'Booking';
      case 'payment_processed':
        return 'Payment';
      case 'dispute_created':
        return 'Dispute';
      case 'refund_processed':
        return 'Refund';
      case 'manager_approval':
        return 'Manager Approval';
      case 'beautician_approval':
        return 'Beautician Approval';
      case 'vendor_suspension':
        return 'Vendor Suspension';
      case 'user_suspension':
        return 'User Suspension';
      default:
        return 'Activity';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#4e342e] mx-auto mb-4" />
            <p className="text-[#6d4c41]">Loading activities...</p>
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
            <div className="flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="outline" size="sm" className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Platform Activities</h1>
                <p className="text-[#6d4c41]">Monitor all platform activities and user interactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={fetchActivities}
                className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 bg-white shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-4 h-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#f8d7da]/50 focus:border-[#4e342e]"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-[#f8d7da]/50 focus:border-[#4e342e]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user_registration">User Registration</SelectItem>
                  <SelectItem value="vendor_approval">Vendor Approval</SelectItem>
                  <SelectItem value="booking_completed">Booking</SelectItem>
                  <SelectItem value="payment_processed">Payment</SelectItem>
                  <SelectItem value="dispute_created">Dispute</SelectItem>
                  <SelectItem value="refund_processed">Refund</SelectItem>
                  <SelectItem value="manager_approval">Manager Approval</SelectItem>
                  <SelectItem value="beautician_approval">Beautician Approval</SelectItem>
                  <SelectItem value="vendor_suspension">Vendor Suspension</SelectItem>
                  <SelectItem value="user_suspension">User Suspension</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-[#f8d7da]/50 focus:border-[#4e342e]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center text-sm text-[#6d4c41]">
                <Filter className="w-4 h-4 mr-2" />
                {filteredActivities.length} of {activities.length} activities
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card className="border-0 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-serif font-bold text-[#4e342e]">
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentActivities.length > 0 ? (
              <div className="divide-y divide-[#f8d7da]">
                {currentActivities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-[#fdf6f0] transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-[#4e342e]">{activity.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status || 'Unknown'}
                            </Badge>
                            <Badge className="bg-[#4e342e] text-white text-xs">
                              {getTypeLabel(activity.type)}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-[#6d4c41] mb-3">{activity.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-[#6d4c41]">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatDate(activity.timestamp)}</span>
                          </div>
                          
                          {activity.user && (
                            <div className="flex items-center text-[#6d4c41]">
                              <Users className="w-4 h-4 mr-2" />
                              <div>
                                <div className="font-medium">{activity.user.name}</div>
                                <div className="text-xs">{activity.user.email}</div>
                                {activity.user.phone && (
                                  <div className="text-xs">{activity.user.phone}</div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {activity.vendor && (
                            <div className="flex items-center text-[#6d4c41]">
                              <Building className="w-4 h-4 mr-2" />
                              <div>
                                <div className="font-medium">{activity.vendor.businessName}</div>
                                <div className="text-xs">{activity.vendor.name}</div>
                                <div className="text-xs">{activity.vendor.email}</div>
                              </div>
                            </div>
                          )}
                          
                          {activity.amount && (
                            <div className="flex items-center text-[#4e342e] font-semibold">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>{formatAmount(activity.amount)}</span>
                            </div>
                          )}
                          
                          {activity.location && (
                            <div className="flex items-center text-[#6d4c41]">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {activity.details && (
                          <div className="mt-3 p-3 bg-[#f8d7da]/15 rounded-lg">
                            <p className="text-sm text-[#6d4c41]">{activity.details}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No activities found</h3>
                <p className="text-[#6d4c41]">Try adjusting your filters or search terms</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-[#6d4c41]">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} activities
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum 
                        ? "bg-[#4e342e] text-white" 
                        : "border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActivitiesPage;

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  UserCheck,
  Search,
  Filter,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  X,
  AlertTriangle,
  Loader2,
  Plus,
  Shield,
  Clock,
  Activity,
  Building,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  lastLoginAt?: string;
  isVerified: boolean;
  stats: {
    vendorsApproved: number;
    vendorsRejected: number;
    appointmentsManaged: number;
    totalActions: number;
  };
}

const ManagersPage = () => {
  const { user } = useSupabaseAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddManager, setShowAddManager] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'PENDING', label: 'Pending' }
  ];

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/managers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManagers(data.managers || []);
      } else {
        // Fallback to mock data
        const mockManagers: Manager[] = [
          {
            id: '1',
            firstName: 'Mike',
            lastName: 'Wilson',
            email: 'mike.wilson@email.com',
            phone: '+1 (555) 123-4567',
            status: 'ACTIVE',
            createdAt: '2024-01-10T08:00:00Z',
            lastLoginAt: '2024-12-20T16:45:00Z',
            isVerified: true,
            stats: {
              vendorsApproved: 15,
              vendorsRejected: 3,
              appointmentsManaged: 89,
              totalActions: 107
            }
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Thompson',
            email: 'sarah.thompson@email.com',
            phone: '+1 (555) 987-6543',
            status: 'ACTIVE',
            createdAt: '2024-02-15T10:30:00Z',
            lastLoginAt: '2024-12-20T14:20:00Z',
            isVerified: true,
            stats: {
              vendorsApproved: 8,
              vendorsRejected: 2,
              appointmentsManaged: 45,
              totalActions: 55
            }
          },
          {
            id: '3',
            firstName: 'David',
            lastName: 'Lee',
            email: 'david.lee@email.com',
            status: 'SUSPENDED',
            createdAt: '2024-03-20T12:00:00Z',
            lastLoginAt: '2024-12-15T09:30:00Z',
            isVerified: false,
            stats: {
              vendorsApproved: 5,
              vendorsRejected: 1,
              appointmentsManaged: 23,
              totalActions: 29
            }
          }
        ];
        setManagers(mockManagers);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const updateManagerStatus = async (managerId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/managers/${managerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Manager ${newStatus.toLowerCase()} successfully!`);
        fetchManagers(); // Refresh data
      } else {
        toast.error(`Failed to ${newStatus.toLowerCase()} manager`);
      }
    } catch (error) {
      console.error(`Error updating manager status:`, error);
      toast.error(`Failed to ${newStatus.toLowerCase()} manager`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
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

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = 
      manager.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || manager.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Manager Oversight</h1>
              <p className="text-[#6d4c41]">Manage manager accounts and monitor their activities</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={() => setShowAddManager(true)}
                className="bg-[#4e342e] hover:bg-[#6d4c41] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manager
              </Button>
              <Badge className="bg-[#4e342e] text-white">
                {filteredManagers.length} Managers
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-4 h-4" />
                    <Input
                      placeholder="Search by name or email..."
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
              </div>
            </CardContent>
          </Card>

          {/* Managers List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 bg-white shadow-lg animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredManagers.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <UserCheck className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No Managers Found</h3>
                <p className="text-[#6d4c41]">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No managers match your search criteria.' 
                    : 'No managers have been added yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredManagers.map((manager, index) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Manager Info */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center">
                              <UserCheck className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold text-[#4e342e]">
                                  {manager.firstName} {manager.lastName}
                                </h3>
                                {manager.isVerified && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-[#6d4c41] mb-3">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{manager.email}</span>
                                </div>
                                {manager.phone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{manager.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Joined {formatDate(manager.createdAt)}</span>
                                </div>
                                {manager.lastLoginAt && (
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Last login {formatDate(manager.lastLoginAt)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Activity Stats */}
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-[#f8d7da]/20 rounded-lg">
                              <div className="text-lg font-semibold text-[#4e342e]">{manager.stats.vendorsApproved}</div>
                              <div className="text-xs text-[#6d4c41]">Vendors Approved</div>
                            </div>
                            <div className="text-center p-3 bg-[#f8d7da]/20 rounded-lg">
                              <div className="text-lg font-semibold text-[#4e342e]">{manager.stats.vendorsRejected}</div>
                              <div className="text-xs text-[#6d4c41]">Vendors Rejected</div>
                            </div>
                            <div className="text-center p-3 bg-[#f8d7da]/20 rounded-lg">
                              <div className="text-lg font-semibold text-[#4e342e]">{manager.stats.appointmentsManaged}</div>
                              <div className="text-xs text-[#6d4c41]">Appointments</div>
                            </div>
                            <div className="text-center p-3 bg-[#f8d7da]/20 rounded-lg">
                              <div className="text-lg font-semibold text-[#4e342e]">{manager.stats.totalActions}</div>
                              <div className="text-xs text-[#6d4c41]">Total Actions</div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <Badge className={getStatusColor(manager.status)}>
                            {manager.status}
                          </Badge>
                          
                          <div className="flex space-x-2">
                            {manager.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateManagerStatus(manager.id, 'SUSPENDED')}
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => updateManagerStatus(manager.id, 'ACTIVE')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activate
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Manager Modal Placeholder */}
          {showAddManager && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-[#4e342e]">Add New Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6d4c41] mb-4">Manager creation form would go here.</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowAddManager(false)}
                      className="flex-1 bg-[#4e342e] hover:bg-[#6d4c41] text-white"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ManagersPage;

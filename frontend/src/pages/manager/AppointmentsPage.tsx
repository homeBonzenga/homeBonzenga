import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar,
  Clock,
  User,
  Building,
  MapPin,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  Loader2,
  Mail,
  DollarSign,
  Home,
  Store
} from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  vendor: {
    shopname: string;
    address: string;
    city: string;
    state: string;
  };
  services: Array<{
    service: {
      name: string;
      price: number;
      duration: number;
    };
    quantity: number;
  }>;
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  total: number;
  serviceType: 'AT_HOME' | 'SALON_VISIT';
  notes?: string;
  createdAt: string;
}

const AppointmentsPage = () => {
  const { user } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const serviceTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'AT_HOME', label: 'At-Home Services' },
    { value: 'SALON_VISIT', label: 'Salon Visits' }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/manager/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        // Fallback to mock data
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            customer: {
              firstName: 'Emily',
              lastName: 'Davis',
              email: 'emily.davis@email.com',
              phone: '+1 (555) 123-4567'
            },
            vendor: {
              shopname: 'Elegant Beauty Salon',
              address: '123 Main Street',
              city: 'New York',
              state: 'NY'
            },
            services: [
              {
                service: {
                  name: 'Bridal Makeup',
                  price: 150,
                  duration: 120
                },
                quantity: 1
              }
            ],
            scheduledDate: '2024-12-21',
            scheduledTime: '14:00',
            status: 'PENDING',
            total: 150,
            serviceType: 'AT_HOME',
            notes: 'Wedding day makeup for bride',
            createdAt: '2024-12-20T10:00:00Z'
          },
          {
            id: '2',
            customer: {
              firstName: 'Lisa',
              lastName: 'Wilson',
              email: 'lisa.wilson@email.com',
              phone: '+1 (555) 987-6543'
            },
            vendor: {
              shopname: 'Zen Spa & Wellness',
              address: '456 Wellness Ave',
              city: 'Los Angeles',
              state: 'CA'
            },
            services: [
              {
                service: {
                  name: 'Facial Treatment',
                  price: 80,
                  duration: 90
                },
                quantity: 1
              },
              {
                service: {
                  name: 'Manicure',
                  price: 25,
                  duration: 45
                },
                quantity: 1
              }
            ],
            scheduledDate: '2024-12-22',
            scheduledTime: '10:00',
            status: 'CONFIRMED',
            total: 105,
            serviceType: 'SALON_VISIT',
            createdAt: '2024-12-19T15:30:00Z'
          },
          {
            id: '3',
            customer: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 456-7890'
            },
            vendor: {
              shopname: 'Nail Art Studio',
              address: '789 Art Street',
              city: 'Chicago',
              state: 'IL'
            },
            services: [
              {
                service: {
                  name: 'Gel Manicure',
                  price: 35,
                  duration: 60
                },
                quantity: 1
              }
            ],
            scheduledDate: '2024-12-23',
            scheduledTime: '16:00',
            status: 'PENDING',
            total: 35,
            serviceType: 'SALON_VISIT',
            createdAt: '2024-12-20T14:20:00Z'
          }
        ];
        setAppointments(mockAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/manager/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Appointment status updated successfully!');
        fetchAppointments();
      } else {
        toast.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeIcon = (type: string) => {
    return type === 'AT_HOME' ? Home : Store;
  };

  const getServiceTypeLabel = (type: string) => {
    return type === 'AT_HOME' ? 'At-Home Service' : 'Salon Visit';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vendor.shopname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = serviceTypeFilter === 'all' || appointment.serviceType === serviceTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">All Appointments</h1>
              <p className="text-[#6d4c41]">Manage all customer appointments and bookings</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Badge className="bg-[#4e342e] text-white">
                {filteredAppointments.length} Total
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-4 h-4" />
                    <Input
                      placeholder="Search by customer name, vendor, or email..."
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
                <div>
                  <select
                    value={serviceTypeFilter}
                    onChange={(e) => setServiceTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                  >
                    {serviceTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
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
          ) : filteredAppointments.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No Appointments Found</h3>
                <p className="text-[#6d4c41]">
                  {searchTerm || statusFilter !== 'all' || serviceTypeFilter !== 'all'
                    ? 'Try adjusting your search criteria.' 
                    : 'No appointments have been scheduled yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => {
                const ServiceTypeIcon = getServiceTypeIcon(appointment.serviceType);
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          {/* Customer & Vendor Info */}
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#4e342e] mb-2">
                                  {appointment.customer.firstName} {appointment.customer.lastName}
                                </h3>
                                <div className="space-y-1 text-sm text-[#6d4c41] mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Building className="w-4 h-4" />
                                    <span>{appointment.vendor.shopname}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{appointment.vendor.city}, {appointment.vendor.state}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{appointment.customer.email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Appointment Details */}
                          <div className="flex-1">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-[#6d4c41]" />
                                <span className="text-sm font-medium text-[#4e342e]">
                                  {formatDate(appointment.scheduledDate)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-[#6d4c41]" />
                                <span className="text-sm text-[#6d4c41]">
                                  {formatTime(appointment.scheduledTime)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ServiceTypeIcon className="w-4 h-4 text-[#6d4c41]" />
                                <span className="text-sm text-[#6d4c41]">
                                  {getServiceTypeLabel(appointment.serviceType)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-[#6d4c41]" />
                                <span className="text-sm font-semibold text-[#4e342e]">
                                  {formatCurrency(appointment.total)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Services */}
                          <div className="flex-1">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-[#4e342e]">Services:</h4>
                              {(appointment.services || []).map((serviceItem, idx) => (
                                <div key={idx} className="text-sm text-[#6d4c41]">
                                  {serviceItem.service.name} ({formatCurrency(serviceItem.service.price)})
                                </div>
                              ))}
                              {appointment.notes && (
                                <div className="text-xs text-[#6d4c41] mt-2 italic">
                                  Note: {appointment.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex flex-col items-end space-y-3">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                            
                            <div className="flex space-x-2">
                              {appointment.status === 'PENDING' && appointment.serviceType === 'AT_HOME' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                </>
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
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;

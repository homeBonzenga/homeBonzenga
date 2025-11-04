import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from '@/lib/supabase';
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
  Phone,
  MapPin,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  Loader2,
  DollarSign
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
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'AWAITING_VENDOR_RESPONSE' | 'VENDOR_CONFIRMED';
  total: number;
  notes?: string;
  createdAt: string;
}

const AppointmentsPage = () => {
  const { user } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; email?: string; phone?: string }>>([]);
  const [selectedEmployeeByBooking, setSelectedEmployeeByBooking] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'AWAITING_VENDOR_RESPONSE', label: 'Awaiting Vendor Response' },
    { value: 'VENDOR_CONFIRMED', label: 'Vendor Confirmed' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${user?.id}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Appointments data received:', data);
        
        // Transform API data to match Appointment interface
        const transformedAppointments: Appointment[] = (data.appointments || data.data || []).map((appointment: any) => ({
          id: appointment.id,
          customer: {
            firstName: appointment.customer?.firstName || 'Unknown',
            lastName: appointment.customer?.lastName || '',
            email: appointment.customer?.email || '',
            phone: appointment.customer?.phone || ''
          },
          services: appointment.items?.map((item: any) => ({
            service: {
              name: item.service?.name || 'Service',
              price: item.service?.price || item.price || 0,
              duration: item.service?.duration || item.duration || 60
            },
            quantity: item.quantity || 1
          })) || [],
          scheduledDate: appointment.scheduledDate || appointment.createdAt,
          scheduledTime: appointment.scheduledTime || '10:00 AM',
          status: appointment.status || 'PENDING',
          total: appointment.total || 0,
          notes: appointment.notes,
          createdAt: appointment.createdAt || new Date().toISOString()
        }));
        
        setAppointments(transformedAppointments);
      } else {
        // Fallback to mock data if API fails
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            customer: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 123-4567'
            },
            services: [
              {
                service: {
                  name: 'Haircut & Styling',
                  price: 45,
                  duration: 60
                },
                quantity: 1
              }
            ],
            scheduledDate: '2024-12-21',
            scheduledTime: '14:00',
            status: 'CONFIRMED',
            total: 45,
            notes: 'Customer prefers shorter layers',
            createdAt: '2024-12-20T10:00:00Z'
          },
          {
            id: '2',
            customer: {
              firstName: 'Maria',
              lastName: 'Garcia',
              email: 'maria.garcia@email.com',
              phone: '+1 (555) 987-6543'
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
            status: 'PENDING',
            total: 105,
            createdAt: '2024-12-20T15:30:00Z'
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

  // ✅ Fetch available employees instead of beauticians
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, phone, role, status')
        .eq('status', 'ACTIVE');

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        // eslint-disable-next-line no-console
        console.log('✅ Available employees fetched:', data);
        setEmployees((data || []).map((e: any) => ({ id: e.id, name: e.name, email: e.email, phone: e.phone })));
      }
    } catch (e) {
      console.error('Error fetching employees:', e);
    }
  };

  const assignEmployee = async (bookingId: string, employeeId: string) => {
    try {
      // eslint-disable-next-line no-console
      console.log(`⚙️ Assigning beautician ${employeeId} to booking ${bookingId}`);

      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({
          beautician_id: employeeId,
          status: 'VENDOR_CONFIRMED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateBookingError) throw updateBookingError;

      const { error: updateEmployeeError } = await supabase
        .from('employees')
        .update({ status: 'BUSY' })
        .eq('id', employeeId);

      if (updateEmployeeError) throw updateEmployeeError;

      toast.success('Beautician assigned successfully!');
      // eslint-disable-next-line no-console
      console.log(`✅ Beautician assigned successfully`);
      fetchAppointments();
      fetchEmployees();
    } catch (err) {
      console.error('❌ Failed to assign beautician:', err);
      toast.error('Failed to assign beautician. Try again.');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let method = 'PUT';
      
      if (newStatus === 'CONFIRMED') {
        endpoint = `http://localhost:3001/api/vendor/bookings/${appointmentId}/approve`;
      } else if (newStatus === 'CANCELLED') {
        endpoint = `http://localhost:3001/api/vendor/bookings/${appointmentId}/reject`;
      } else {
        endpoint = `http://localhost:3001/api/vendor/bookings/${appointmentId}/status`;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...(newStatus === 'CANCELLED' && { reason: 'Vendor cancelled' }),
          ...(newStatus === 'CONFIRMED' && { employeeId: null })
        })
      });

      if (response.ok) {
        toast.success(`Appointment ${newStatus.toLowerCase()}!`);
        fetchAppointments(); // Refresh the list
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
      case 'AWAITING_VENDOR_RESPONSE':
        return 'bg-blue-100 text-blue-800';
      case 'VENDOR_CONFIRMED':
        return 'bg-indigo-100 text-indigo-800';
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Appointments</h1>
              <p className="text-[#6d4c41]">Manage customer appointments and bookings</p>
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
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-4 h-4" />
                    <Input
                      placeholder="Search by customer name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
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
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria.' 
                    : 'You don\'t have any appointments yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Customer Info */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-[#4e342e]">
                                {appointment.customer.firstName} {appointment.customer.lastName}
                              </h3>
                              <div className="space-y-1 text-sm text-[#6d4c41]">
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{appointment.customer.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
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
                              <DollarSign className="w-4 h-4 text-[#6d4c41]" />
                              <span className="text-sm font-semibold text-[#4e342e]">
                                ${appointment.total}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="flex-1">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-[#4e342e]">Services:</h4>
                            {appointment.services && appointment.services.length > 0 ? (
                              appointment.services.map((serviceItem, idx) => (
                                <div key={idx} className="text-sm text-[#6d4c41]">
                                  {serviceItem.service?.name || 'Service'} (${serviceItem.service?.price || 0})
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-[#6d4c41]">No services listed</div>
                            )}
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                          
                          <div className="flex space-x-2">
                            {appointment.status === 'PENDING' && (
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
                            
                            {appointment.status === 'AWAITING_VENDOR_RESPONSE' && (
                              <div className="flex items-center gap-2">
                                <select
                                  value={selectedEmployeeByBooking[appointment.id] || ''}
                                  onChange={(e) => setSelectedEmployeeByBooking(prev => ({ ...prev, [appointment.id]: e.target.value }))}
                                  className="px-2 py-1 border border-[#f8d7da] rounded-md"
                                >
                                  <option value="">Assign Beautician</option>
                                  {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                      {emp.name}{emp.email ? ` - ${emp.email}` : ''}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  disabled={!selectedEmployeeByBooking[appointment.id]}
                                  onClick={() => assignEmployee(appointment.id, selectedEmployeeByBooking[appointment.id])}
                                  className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                                >
                                  Confirm Assignment
                                </Button>
                              </div>
                            )}

                            {appointment.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Start
                              </Button>
                            )}
                            
                            {appointment.status === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAppointment(appointment)}
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
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;

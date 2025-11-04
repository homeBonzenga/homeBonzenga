import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  serviceId: string;
  date: string;
  time: string;
  status: string;
  total: number;
  notes: string;
  createdAt: string;
}

const AppointmentsManagementPage = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${user?.id}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load appointments');
      const data = await response.json();
      // Map to local shape
      const list = (data.appointments || []).map((b: any) => ({
        id: b.id,
        customerName: `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.trim(),
        customerEmail: b.customer?.email || '',
        customerPhone: b.customer?.phone || '',
        service: (b.items?.[0]?.service?.name) || 'Service',
        serviceId: b.items?.[0]?.service?.id || '',
        date: b.scheduledDate || b.createdAt,
        time: b.scheduledTime || '10:00',
        status: (b.status || 'pending').toLowerCase(),
        total: b.total || 0,
        notes: b.notes || '',
        createdAt: b.createdAt
      }));
      setAppointments(list);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: newStatus }
        : appointment
    ));
    toast.success('Appointment status updated');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAppointmentsByStatus = (status: string) => {
    return filteredAppointments.filter(appointment => appointment.status === status);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading appointments...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">
            Appointments Management
          </h1>
          <p className="text-lg text-[#6d4c41]">
            Manage your salon appointments and bookings
          </p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({filteredAppointments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getAppointmentsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({getAppointmentsByStatus('confirmed').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getAppointmentsByStatus('completed').length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({getAppointmentsByStatus('cancelled').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                <p className="text-xl font-semibold text-[#4e342e] mb-2">No appointments found</p>
                <p className="text-[#6d4c41]">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {getAppointmentsByStatus(status).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
                  <p className="text-xl font-semibold text-[#4e342e] mb-2">No {status} appointments</p>
                  <p className="text-[#6d4c41]">Appointments with {status} status will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getAppointmentsByStatus(status).map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Appointment Card Component
const AppointmentCard = ({ 
  appointment, 
  onStatusChange 
}: { 
  appointment: Appointment; 
  onStatusChange: (id: string, status: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#4e342e] mb-1">
              {appointment.service}
            </h3>
            <p className="text-[#6d4c41] text-sm">
              Booking ID: {appointment.id}
            </p>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(appointment.status)}
              {appointment.status}
            </div>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#6d4c41]">
              <User className="w-4 h-4" />
              <span className="font-medium">{appointment.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6d4c41]">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{appointment.customerEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6d4c41]">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{appointment.customerPhone}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#6d4c41]">
              <Calendar className="w-4 h-4" />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6d4c41]">
              <Clock className="w-4 h-4" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6d4c41]">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">{appointment.total.toLocaleString()} CDF</span>
            </div>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-4 p-3 bg-[#fdf6f0] rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-[#4e342e] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#4e342e] mb-1">Customer Notes:</p>
                <p className="text-sm text-[#6d4c41]">{appointment.notes}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-[#6d4c41]">
            Booked on {new Date(appointment.createdAt).toLocaleDateString()}
          </div>
          
          {appointment.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}

          {appointment.status === 'confirmed' && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onStatusChange(appointment.id, 'completed')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsManagementPage;

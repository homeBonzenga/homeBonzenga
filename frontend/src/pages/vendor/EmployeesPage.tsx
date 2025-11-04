import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  User,
  Clock,
  Star,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  experience: number;
  specialization: string;
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  totalBookings: number;
}

interface EmployeeForm {
  name: string;
  role: string;
  email: string;
  phone: string;
  experience: string;
  specialization: string;
}

const EmployeesPage = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>({
    name: '',
    role: '',
    email: '',
    phone: '',
    experience: '',
    specialization: ''
  });

  const roles = [
    { value: 'stylist', label: 'Hair Stylist' },
    { value: 'colorist', label: 'Color Specialist' },
    { value: 'technician', label: 'Beauty Technician' },
    { value: 'aesthetician', label: 'Aesthetician' },
    { value: 'nail_specialist', label: 'Nail Specialist' },
    { value: 'manager', label: 'Salon Manager' }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      const response = await api.get<{ employees: Employee[] }>(`/vendor/${user.id}/employees`);
      const data = response.data;
      
      if (data.employees) {
        setEmployees(data.employees);
        console.log(`✅ Loaded ${data.employees.length} employees from database`);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      role: '',
      email: '',
      phone: '',
      experience: '',
      specialization: ''
    });
    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setForm({
      name: employee.name,
      role: employee.role,
      email: employee.email,
      phone: employee.phone,
      experience: employee.experience.toString(),
      specialization: employee.specialization
    });
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!form.name || !form.role || !form.email || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    const employeeData = {
      name: form.name,
      role: form.role,
      email: form.email,
      phone: form.phone,
      experience: form.experience,
      specialization: form.specialization
    };

    try {
      if (editingEmployee) {
        // Update existing employee
        await api.put(`/vendor/${user.id}/employees/${editingEmployee.id}`, employeeData);
        toast.success('Employee updated successfully');
      } else {
        // Add new employee
        await api.post(`/vendor/${user.id}/employees`, employeeData);
        toast.success('Employee added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      // Refresh the employee list
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      await api.delete(`/vendor/${user.id}/employees/${employeeId}`);
      toast.success('Employee deleted successfully');
      // Refresh the employee list
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const getRoleLabel = (role: string) => {
    const roleData = roles.find(r => r.value === role);
    return roleData?.label || role;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading employees...</div>
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
                Employees
              </h1>
              <p className="text-lg text-[#6d4c41]">
                Manage your salon employees and staff
              </p>
            </div>
            <Button 
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
              onClick={handleAddEmployee}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-serif text-[#4e342e]">
                        {employee.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-[#fdf6f0] text-[#4e342e] text-xs mt-1">
                        {getRoleLabel(employee.role)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEmployee(employee)}
                      className="text-[#4e342e] hover:text-[#3b2c26]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#6d4c41] text-sm">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6d4c41] text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6d4c41] text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{employee.specialization}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#f8d7da]">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-[#6d4c41] text-sm font-medium">{employee.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#6d4c41]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{employee.experience} years</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={employee.status === 'ACTIVE' ? "default" : "secondary"}
                      className={employee.status === 'ACTIVE' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                      }
                    >
                      {employee.status}
                    </Badge>
                    <span className="text-xs text-[#6d4c41]">
                      {employee.totalBookings} bookings
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
            <p className="text-xl font-semibold text-[#4e342e] mb-2">No employees yet</p>
            <p className="text-[#6d4c41] mb-4">Add your first employee to start managing your team</p>
            <Button 
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
              onClick={handleAddEmployee}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Employee
            </Button>
          </div>
        )}

        {/* Add/Edit Employee Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif text-[#4e342e]">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#4e342e] font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter employee name"
                  className="border-[#4e342e] text-[#4e342e] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-[#4e342e] font-medium">
                  Role *
                </Label>
                <Select value={form.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="border-[#4e342e] text-[#4e342e] mt-2">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-[#4e342e] font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className="border-[#4e342e] text-[#4e342e] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-[#4e342e] font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="border-[#4e342e] text-[#4e342e] mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience" className="text-[#4e342e] font-medium">
                  Experience (years)
                </Label>
                <Input
                  id="experience"
                  type="number"
                  value={form.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="0"
                  className="border-[#4e342e] text-[#4e342e] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="specialization" className="text-[#4e342e] font-medium">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  value={form.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="e.g., Hair Color & Styling"
                  className="border-[#4e342e] text-[#4e342e] mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEmployee}
                  className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;


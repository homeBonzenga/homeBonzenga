import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
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
  Scissors,
  Sparkles,
  Heart,
  DollarSign,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  isActive: boolean;
}

interface ServiceForm {
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
}

const ServicesManagementPage = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>({
    name: '',
    category: '',
    price: '',
    duration: '',
    description: ''
  });

  const categories = [
    { value: 'hair', label: 'Hair Styling', icon: Scissors },
    { value: 'face', label: 'Facial Treatment', icon: Sparkles },
    { value: 'extras', label: 'Nail Care & Extras', icon: Heart }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const mockData = await import('@/mockData/vendors.json');
      const vendorData = mockData.default.vendors.find(v => v.status === 'approved') || mockData.default.vendors[0];
      setServices(vendorData.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      price: '',
      duration: '',
      description: ''
    });
    setEditingService(null);
  };

  const handleAddService = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setForm({
      name: service.name,
      category: service.category,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description
    });
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!form.name || !form.category || !form.price || !form.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    const serviceData = {
      name: form.name,
      category: form.category,
      price: parseInt(form.price),
      duration: parseInt(form.duration),
      description: form.description,
      isActive: true
    };

    if (editingService) {
      // Update existing service
      setServices(prev => prev.map(s => 
        s.id === editingService.id 
          ? { ...s, ...serviceData }
          : s
      ));
      toast.success('Service updated successfully');
    } else {
      // Add new service
      const newService: Service = {
        id: Date.now().toString(),
        ...serviceData
      };
      setServices(prev => [...prev, newService]);
      toast.success('Service added successfully');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Service deleted successfully');
    }
  };

  const handleToggleService = (serviceId: string) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, isActive: !s.isActive }
        : s
    ));
    toast.success('Service status updated');
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || Scissors;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.label || category;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#4e342e] text-xl">Loading services...</div>
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
                Services Management
              </h1>
              <p className="text-lg text-[#6d4c41]">
                Manage your salon services and pricing
              </p>
            </div>
            <Button 
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
              onClick={handleAddService}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = getCategoryIcon(service.category);
            return (
              <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#4e342e] rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-serif text-[#4e342e]">
                          {service.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-[#fdf6f0] text-[#4e342e] text-xs">
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleService(service.id)}
                        className={service.isActive ? "text-green-600" : "text-gray-400"}
                      >
                        {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditService(service)}
                        className="text-[#4e342e] hover:text-[#3b2c26]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6d4c41] text-sm mb-4">{service.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-[#6d4c41]">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{service.price.toLocaleString()} CDF</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#6d4c41]">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Badge 
                      variant={service.isActive ? "default" : "secondary"}
                      className={service.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                      }
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="w-16 h-16 text-[#6d4c41] mx-auto mb-4" />
            <p className="text-xl font-semibold text-[#4e342e] mb-2">No services yet</p>
            <p className="text-[#6d4c41] mb-4">Add your first service to start accepting bookings</p>
            <Button 
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
              onClick={handleAddService}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        )}

        {/* Add/Edit Service Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif text-[#4e342e]">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#4e342e] font-medium">
                  Service Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter service name"
                  className="border-[#4e342e] text-[#4e342e]"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-[#4e342e] font-medium">
                  Category *
                </Label>
                <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="border-[#4e342e] text-[#4e342e]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-[#4e342e] font-medium">
                    Price (CDF) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    className="border-[#4e342e] text-[#4e342e]"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-[#4e342e] font-medium">
                    Duration (min) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={form.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="0"
                    className="border-[#4e342e] text-[#4e342e]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-[#4e342e] font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the service..."
                  className="border-[#4e342e] text-[#4e342e]"
                  rows={3}
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
                  onClick={handleSaveService}
                  className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ServicesManagementPage;

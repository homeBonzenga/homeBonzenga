import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Scissors,
  Palette,
  Sparkles,
  Award,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

const ServicesPage = () => {
  const { user } = useSupabaseAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [backendCategories, setBackendCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'hair'
  });

  const categoryOptions = [
    { value: 'hair', label: 'Hair Care', icon: Scissors },
    { value: 'face', label: 'Face Care', icon: Palette },
    { value: 'nail', label: 'Nail Care', icon: Sparkles },
    { value: 'spa', label: 'Spa & Wellness', icon: Award },
    { value: 'makeup', label: 'Makeup', icon: Palette }
  ];

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vendor/categories');
      if (response.ok) {
        const data = await response.json();
        const backend = data.categories || [];
        setBackendCategories(backend);
        if (!selectedCategoryId && backend.length > 0) {
          setSelectedCategoryId(backend[0].id);
        }
        // Fallback: if backend has none, try Supabase service_categories
        if (!backend || backend.length === 0) {
          const { data: supaData, error } = await supabase
            .from('service_categories')
            .select('id, name')
            .eq('is_active', true);
          if (!error) {
            const list = supaData || [];
            setBackendCategories(list);
            if (!selectedCategoryId && list.length > 0) {
              setSelectedCategoryId(list[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${user?.id}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        // Fallback to mock data if API fails
        const mockServices: Service[] = [
          {
            id: '1',
            name: 'Haircut & Styling',
            description: 'Professional haircut with styling and blow-dry',
            price: 45,
            duration: 60,
            category: 'hair',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Facial Treatment',
            description: 'Deep cleansing facial with moisturizing mask',
            price: 80,
            duration: 90,
            category: 'face',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ];
        setServices(mockServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        setIsSubmitting(false);
        return;
      }

      // Use selected backend categoryId directly
      const categoryId = selectedCategoryId;
      const validIds = new Set(backendCategories.map(c => c.id));
      if (!categoryId || !isUuid(categoryId) || !validIds.has(categoryId)) {
        toast.error('Please select a valid category.');
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      const url = editingService 
        ? `http://localhost:3001/api/vendor/${user?.id}/services/${editingService.id}`
        : `http://localhost:3001/api/vendor/${user?.id}/services`;
      
      const method = editingService ? 'PUT' : 'POST';

      // Send categoryId instead of category
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        categoryId: categoryId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingService ? 'Service updated successfully!' : 'Service created successfully!');
        setIsDialogOpen(false);
        setEditingService(null);
        setFormData({ name: '', description: '', price: 0, duration: 30, category: 'hair' });
        // keep selectedCategoryId as-is
        fetchServices();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${user?.id}/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Service deleted successfully!');
        fetchServices();
      } else {
        toast.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    });
    // Try to align selectedCategoryId with service.category name
    const match = backendCategories.find(c => (c.name || '').toLowerCase() === (service.category || '').toLowerCase());
    setSelectedCategoryId(match?.id || selectedCategoryId);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: 0, duration: 30, category: 'hair' });
    if (backendCategories.length > 0) {
      setSelectedCategoryId(backendCategories[0].id);
    }
    setIsDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categoryOptions.find(cat => cat.value === category);
    return categoryData?.icon || Sparkles;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = categoryOptions.find(cat => cat.value === category);
    return categoryData?.label || 'Other';
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
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Services Management</h1>
              <p className="text-[#6d4c41]">Manage your salon services and pricing</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleAddNew}
                  className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#4e342e]">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-[#4e342e] font-medium">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-[#4e342e] font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-[#4e342e] font-medium">Category</Label>
                        <select
                          id="category"
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                          required
                        >
                          {backendCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {backendCategories.length === 0 && (
                          <p className="text-xs text-[#6d4c41] mt-1">No categories available. Please create categories first.</p>
                        )}
                    </div>
                    
                    <div>
                      <Label htmlFor="price" className="text-[#4e342e] font-medium">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration" className="text-[#4e342e] font-medium">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                        className="mt-2 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingService ? 'Update' : 'Create'} Service
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : services.length === 0 ? (
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 text-[#6d4c41]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#4e342e] mb-2">No Services Yet</h3>
                <p className="text-[#6d4c41] mb-6">Start by adding your first service to begin accepting bookings.</p>
                <Button 
                  onClick={handleAddNew}
                  className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const CategoryIcon = getCategoryIcon(service.category);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4e342e] to-[#6d4c41] rounded-lg flex items-center justify-center">
                              <CategoryIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-[#4e342e]">{service.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryLabel(service.category)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(service)}
                              className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(service.id)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[#6d4c41] text-sm mb-4 line-clamp-2">{service.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-[#6d4c41]">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold">${service.price}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-[#6d4c41]">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
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

export default ServicesPage;

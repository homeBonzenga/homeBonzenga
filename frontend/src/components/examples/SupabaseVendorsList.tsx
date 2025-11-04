import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Star, Clock, Phone, Mail } from 'lucide-react';
import { supabaseDb } from '@/lib/supabaseDatabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  shopname: string;
  description: string;
  status: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    isActive: boolean;
  }>;
  reviews: Array<{
    rating: number;
  }>;
}

export const SupabaseVendorsList: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    loadVendors();
  }, [cityFilter]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const result = await supabaseDb.getVendors({
        status: 'APPROVED',
        city: cityFilter || undefined
      });

      if (result.success && 'data' in result) {
        setVendors(result.data);
      } else if (!result.success && 'error' in result) {
        toast.error('Failed to load vendors: ' + result.error);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = (reviews: Array<{ rating: number }>) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.shopname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading vendors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Beauty Vendors</h2>
          <p className="text-muted-foreground">
            Discover amazing beauty services near you
          </p>
        </div>
        {user && (
          <Badge variant="outline" className="text-sm">
            Welcome, {user.firstName}!
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search vendors, services, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="sm:w-48">
          <Input
            placeholder="Filter by city"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>
        <Button onClick={loadVendors} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{vendor.shopname}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vendor.city}, {vendor.state}
                  </CardDescription>
                </div>
                <Badge 
                  variant={vendor.status === 'APPROVED' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {vendor.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Owner Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {vendor.user.avatar ? (
                    <img 
                      src={vendor.user.avatar} 
                      alt={`${vendor.user.firstName} ${vendor.user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {vendor.user.firstName[0]}{vendor.user.lastName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {vendor.user.firstName} {vendor.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {vendor.user.email}
                  </p>
                </div>
              </div>

              {/* Description */}
              {vendor.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {vendor.description}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {calculateAverageRating(vendor.reviews)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({vendor.reviews.length} reviews)
                </span>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.services
                    .filter(service => service.isActive)
                    .slice(0, 3)
                    .map((service) => (
                      <Badge key={service.id} variant="secondary" className="text-xs">
                        {service.name} - ${service.price}
                      </Badge>
                    ))}
                  {vendor.services.filter(s => s.isActive).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{vendor.services.filter(s => s.isActive).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Address */}
              <p className="text-xs text-muted-foreground">
                {vendor.address}
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredVendors.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No vendors found</p>
            <p className="text-sm">
              {searchTerm || cityFilter 
                ? 'Try adjusting your search or filters'
                : 'No approved vendors available at the moment'
              }
            </p>
          </div>
          {(searchTerm || cityFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCityFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredVendors.length} of {vendors.length} vendors
      </div>
    </div>
  );
};

export default SupabaseVendorsList;

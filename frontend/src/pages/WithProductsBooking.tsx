import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Clock, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Home,
  ArrowLeft
} from 'lucide-react';
interface ServiceCategory {
  category: string;
  services: string[];
}

const WithProductsBooking: React.FC = () => {
  const navigate = useNavigate();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesDetailed, setServicesDetailed] = useState<Array<{ id: string; name: string; price?: number; category?: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; stock?: number; category?: string }>>([]);
  const [filteredProducts, setFilteredProducts] = useState<Array<{ id: string; name: string; price: number; stock?: number; category?: string }>>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [productSearch, setProductSearch] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [groupedRes, detailedRes, productsRes] = await Promise.all([
          fetch('http://localhost:3001/api/services/unique/grouped'),
          fetch('http://localhost:3001/api/services/unique/detailed'),
          fetch('http://localhost:3001/api/products')
        ]);
        if (groupedRes.ok) {
          const g = await groupedRes.json();
          if (g.success) setServiceCategories(g.data);
        }
        if (detailedRes.ok) {
          const d = await detailedRes.json();
          setServicesDetailed((d.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            price: typeof s.price === 'number' ? s.price : Number(s.price) || 0,
            category: inferServiceCategory(s.name, s.description)
          })));
        }
        if (productsRes.ok) {
          const p = await productsRes.json();
          const list = (p.data?.products || []).map((pr: any) => ({
            id: pr.id,
            name: pr.name,
            price: typeof pr.price === 'number' ? pr.price : Number(pr.price) || 0,
            stock: pr.stock,
            category: inferProductCategory(pr.name)
          }));
          setProducts(list);
          setFilteredProducts(list);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to mock data if API fails
        setServiceCategories([
          { category: 'Hair Styling', services: ['Cuts & Styling', 'Braiding', 'Coloring', 'Bridal Hair'] },
          { category: 'Skin Care', services: ['Facial Treatment', 'Clean-up', 'Glow Treatments'] },
          { category: 'Makeup', services: ['Party Makeup', 'Bridal Makeup', 'Event Makeup'] },
          { category: 'Nail Care', services: ['Manicure', 'Pedicure', 'Nail Art'] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Helpers to infer categories
  const inferServiceCategory = (name?: string, description?: string): string => {
    const text = `${name || ''} ${description || ''}`.toLowerCase();
    if (/hair|cut|braid|style|color|shampoo|keratin/.test(text)) return 'Hair';
    if (/skin|facial|glow|clean|spa|massage|peel|acne/.test(text)) return 'Skin';
    if (/makeup|bridal|party|lip|eye|foundation|cosmetic/.test(text)) return 'Makeup';
    if (/nail|manicure|pedicure|polish|gel|acrylic/.test(text)) return 'Nail';
    return 'Other';
  };

  const inferProductCategory = (name?: string): string => {
    const text = `${name || ''}`.toLowerCase();
    if (/shampoo|conditioner|hair|keratin|oil|spray/.test(text)) return 'Hair';
    if (/skin|cream|serum|mask|lotion|toner/.test(text)) return 'Skin';
    if (/makeup|lip|eye|foundation|blush|palette/.test(text)) return 'Makeup';
    if (/nail|polish|manicure|pedicure|gel|acrylic/.test(text)) return 'Nail';
    return 'General';
  };

  // Filter products by selected services and search
  useEffect(() => {
    const q = productSearch.toLowerCase();
    if (showAllProducts || selectedServiceIds.size === 0) {
      setFilteredProducts(products.filter(p => !q || p.name.toLowerCase().includes(q)));
      return;
    }
    const selected = servicesDetailed.filter(s => selectedServiceIds.has(s.id));
    const cats = new Set(selected.map(s => (s.category || '').toLowerCase()).filter(Boolean));
    const list = products.filter(p => {
      const pc = (p.category || '').toLowerCase();
      if (!pc) return false;
      return cats.has(pc);
    }).filter(p => !q || p.name.toLowerCase().includes(q));
    setFilteredProducts(list);
  }, [products, servicesDetailed, selectedServiceIds, productSearch, showAllProducts]);

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const incQty = (id: string) => setProductQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const decQty = (id: string) => setProductQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));

  const selectedServices = servicesDetailed.filter(s => selectedServiceIds.has(s.id));
  const selectedProducts = filteredProducts.filter(p => (productQuantities[p.id] || 0) > 0);
  const servicesTotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const productsTotal = selectedProducts.reduce((sum, p) => sum + p.price * (productQuantities[p.id] || 0), 0);
  const grandTotal = servicesTotal + productsTotal;

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#4e342e] text-xl">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-white/30">
                <Package className="w-5 h-5 text-white mr-3" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">WITH PRODUCTS</span>
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight"
              variants={fadeInUp}
            >
              Services with Professional Products
            </motion.h1>

            <motion.p 
              className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Our beauticians bring all necessary professional products and tools for a complete service experience
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services + Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services */}
            <div>
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[#4e342e] mb-2">Select Services</h2>
                <p className="text-[#6d4c41]">Choose one or more services</p>
              </motion.div>

              {serviceCategories.map((category, catIndex) => (
                <div key={catIndex} className="mb-6">
                  <h3 className="text-lg font-semibold text-[#4e342e] mb-3">{category.category}</h3>
                  <div className="space-y-3">
                    {category.services.map((name, idx) => {
                      const svc = servicesDetailed.find(s => s.name === name) || { id: name, name, price: 0 };
                      const selected = selectedServiceIds.has(svc.id);
                      return (
                        <Card key={`${catIndex}-${idx}`} className={`border ${selected ? 'border-[#4e342e]' : 'border-[#d7ccc8]'} hover:shadow-md`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-[#4e342e] text-white">Service</Badge>
                                </div>
                                <div className="text-[#4e342e] font-semibold">{svc.name}</div>
                                <div className="text-sm text-[#6d4c41]">Professional service</div>
                                <div className="text-sm text-[#4e342e] font-medium mt-1">${(svc.price || 0).toFixed(2)}</div>
                              </div>
                              <Button
                                variant={selected ? 'outline' : 'default'}
                                className={selected ? 'border-[#4e342e] text-[#4e342e]' : 'bg-[#4e342e] hover:bg-[#3b2c26] text-white'}
                                onClick={() => toggleService(svc.id)}
                              >
                                {selected ? 'Remove' : 'Select'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Products + Cart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[#4e342e]">Recommended Products for Your Selected Services</h2>
                  <p className="text-[#6d4c41] text-sm">Based on selected categories. Toggle to view all products.</p>
                </div>
                <label className="text-sm text-[#4e342e] flex items-center gap-2">
                  <input type="checkbox" checked={showAllProducts} onChange={(e) => setShowAllProducts(e.target.checked)} />
                  Show all products
                </label>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-white"
                />
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => {
                    const qty = productQuantities[p.id] || 0;
                    const outOfStock = p.stock !== undefined && p.stock <= 0;
                    return (
                      <div key={p.id} className="border rounded-lg p-3 shadow-md bg-white">
                        <div className="w-full h-32 bg-[#fdf6f0] rounded-md" />
                        <h3 className="text-lg font-semibold mt-2 text-[#4e342e]">{p.name}</h3>
                        <p className="text-sm text-[#6d4c41]">{p.category || 'General'}</p>
                        <p className="font-medium mt-1 text-[#4e342e]">${p.price.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="outline" className="border-[#4e342e] text-[#4e342e]" disabled={qty===0} onClick={() => decQty(p.id)}>-</Button>
                          <div className="w-8 text-center text-[#4e342e]">{qty}</div>
                          <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white" disabled={outOfStock} onClick={() => incQty(p.id)}>Add</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-[#6d4c41]">No related products found for the selected services.</div>
              )}

              {/* Cart Summary */}
              <div className="mt-6 p-4 bg-[#fdf6f0] rounded-lg border border-[#d7ccc8]">
                <div className="flex items-center justify-between text-[#4e342e] font-semibold">
                  <span>Services</span>
                  <span>${servicesTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#4e342e] font-semibold mt-1">
                  <span>Products</span>
                  <span>${productsTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#4e342e] font-bold mt-2 border-t border-[#d7ccc8] pt-2">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                <div className="mt-3 text-right">
                  <Button
                    className="bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                    disabled={selectedServiceIds.size===0}
                    onClick={() => {
                      const services = selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price || 0 }));
                      const products = selectedProducts.map(p => ({ id: p.id, name: p.name, price: p.price, quantity: productQuantities[p.id] || 0 }));
                      // Store booking data for PaymentPage (which reads from sessionStorage)
                      const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0)
                        + products.reduce((sum, p) => sum + p.price * (p.quantity || 0), 0);
                      const bookingData = {
                        services: [
                          ...services.map(s => ({ name: s.name, price: s.price, quantity: 1 })),
                          ...products.filter(p => (p.quantity || 0) > 0).map(p => ({ name: p.name, price: p.price, quantity: p.quantity }))
                        ],
                        date: new Date().toISOString(),
                        time: '10:00',
                        address: '',
                        phone: '',
                        notes: 'At-home with products',
                        beauticianPreference: 'any',
                        totalPrice,
                        totalDuration: 0,
                        type: 'AT_HOME'
                      };
                      try { sessionStorage.setItem('bookingData', JSON.stringify(bookingData)); } catch {}
                      navigate('/customer/payment', { state: { services, products } });
                    }}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Why Choose Services with Products?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Professional products ensure the best results for your beauty service
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Package,
                title: 'Professional Products',
                description: 'High-quality products used by salon professionals'
              },
              {
                icon: Star,
                title: 'Best Results',
                description: 'Optimal results with professional-grade materials'
              },
              {
                icon: Home,
                title: 'Convenience',
                description: 'No need to purchase or prepare anything yourself'
              }
            ].map((benefit, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                      {benefit.title}
                    </h3>
                    <p className="text-[#6d4c41] leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Back Button */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button 
            variant="outline"
            className="border-2 border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            onClick={() => navigate('/customer/at-home-services/select-option')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Options
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WithProductsBooking;

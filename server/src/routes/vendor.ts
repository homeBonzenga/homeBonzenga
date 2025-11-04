import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import employeesRouter from './employees';
import vendorProductsRouter from './vendor-products';

const router = Router();
const prisma = new PrismaClient();

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Vendor routes are working!' });
});

// Middleware to protect routes (simplified for demo)
const protect = (req: any, res: any, next: any) => {
  // Temporarily allow all requests for debugging
  // In production, verify JWT token here
  console.log('Vendor route accessed:', req.path, 'Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
};

// Get vendor profile
router.get('/:vendorId/profile', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },  
      include: {
        user: true,
        services: true,
        bookings: {
          include: {
            customer: true,
            items: {
              include: { service: true }
            }
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Calculate stats
    const totalBookings = vendor.bookings.length;
    const completedBookings = vendor.bookings.filter((b: any) => b.status === 'COMPLETED').length;
    const totalRevenue = vendor.bookings
      .filter((b: any) => b.status === 'COMPLETED')
      .reduce((sum: number, b: any) => sum + b.total, 0);

    const profile = {
      ...vendor,
      stats: {
        totalBookings,
        completedBookings,
        totalRevenue,
        averageRating: 4.8, // Mock data
        totalReviews: 127 // Mock data
      }
    };

    console.log('Vendor profile for userId:', userId, 'Status:', vendor.status);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update vendor profile
router.put('/:vendorId/profile', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;
    const updateData = req.body;

    // Find the vendor record first
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update user data
    if (updateData.firstName || updateData.lastName || updateData.email || updateData.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          phone: updateData.phone
        }
      });
    }

    // Update vendor data
    const vendorUpdateData: any = {};
    if (updateData.shopName) vendorUpdateData.shopName = updateData.shopName;
    if (updateData.description) vendorUpdateData.description = updateData.description;
    if (updateData.address) vendorUpdateData.address = updateData.address;
    if (updateData.city) vendorUpdateData.city = updateData.city;
    if (updateData.state) vendorUpdateData.state = updateData.state;
    if (updateData.zipCode) vendorUpdateData.zipCode = updateData.zipCode;
    if (updateData.businessType) vendorUpdateData.businessType = updateData.businessType;
    if (updateData.yearsInBusiness) vendorUpdateData.yearsInBusiness = updateData.yearsInBusiness;
    if (updateData.numberOfEmployees) vendorUpdateData.numberOfEmployees = updateData.numberOfEmployees;

    if (Object.keys(vendorUpdateData).length > 0) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: vendorUpdateData
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get vendor services
router.get('/:vendorId/services', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;
    console.log(`📥 GET /api/vendor/${userId}/services - Fetching vendor services`);

    // Find the vendor record for this user
    let vendor = await prisma.vendor.findUnique({
      where: { userId }
    });
    console.log(`Vendor found:`, vendor ? `Yes (${vendor.id})` : 'No');

    // Auto-create vendor record if it doesn't exist
    if (!vendor) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.role !== 'VENDOR') {
        return res.status(404).json({ message: 'Vendor user not found' });
      }

      console.log(`Auto-creating vendor record for user ${user.email}`);
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          shopName: `${user.firstName} ${user.lastName}'s Shop`,
          description: 'Please update your shop description',
          address: '123 Main Street',
          city: 'City',
          state: 'State',
          zipCode: '00000',
          latitude: 0,
          longitude: 0,
          status: 'PENDING'
        }
      });
    }

    const services = await prisma.service.findMany({
      where: { vendorId: vendor.id },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform services to include category name for frontend compatibility
    const servicesWithCategory = services.map(service => ({
      ...service,
      category: service.categories && service.categories.length > 0 
        ? service.categories[0].category.name 
        : 'Other'
    }));

    res.json({ services: servicesWithCategory });
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.serviceCategoryModel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Create new service
router.post('/:vendorId/services', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params; // This is actually the user ID
    const { name, description, price, duration, categoryId } = req.body;
    console.log(`📥 POST /api/vendor/${userId}/services - Creating service`);

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, categoryId' });
    }

    // Find the vendor record for this user
    let vendor = await prisma.vendor.findUnique({
      where: { userId }
    });
    console.log(`Vendor found:`, vendor ? `Yes (${vendor.id})` : 'No');

    // Auto-create vendor record if it doesn't exist
    if (!vendor) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.role !== 'VENDOR') {
        console.error(`❌ User ${userId} not found or not a vendor`);
        return res.status(404).json({ message: 'Vendor user not found' });
      }

      console.log(`🔧 Auto-creating vendor record for user ${user.email}`);
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          shopName: `${user.firstName} ${user.lastName}'s Shop`,
          description: 'Please update your shop description',
          address: '123 Main Street',
          city: 'City',
          state: 'State',
          zipCode: '00000',
          latitude: 0,
          longitude: 0,
          status: 'PENDING'
        }
      });
      console.log(`✅ Vendor record created: ${vendor.id}`);
    }

    // Verify category exists
    const category = await prisma.serviceCategoryModel.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    console.log(`Creating service for vendor ${vendor.id} in category ${category.name}`);
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        vendorId: vendor.id, // Use the actual vendor ID
        isActive: true
      }
    });

    // Create category mapping
    await prisma.serviceCategoryMap.create({
      data: {
        serviceId: service.id,
        categoryId: categoryId
      }
    });

    console.log(`✅ Service created: ${service.id} with category: ${category.name}`);
    res.status(201).json({ 
      service: {
        ...service,
        category: category.name
      }
    });
  } catch (error) {
    console.error('❌ Error creating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update service
router.put('/:vendorId/services/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, price, duration, category, isActive } = req.body;

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json({ service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete service
router.delete('/:vendorId/services/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;

    await prisma.service.delete({
      where: { id: serviceId }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get vendor appointments
router.get('/:vendorId/appointments', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    const { status, limit = 50 } = req.query;

    const whereClause: any = {
      vendorId: vendor.id
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const appointments = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { scheduledDate: 'desc' },
      take: parseInt(limit as string)
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching vendor appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get vendor revenue stats
router.get('/:vendorId/revenue', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    const { range = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get completed bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        vendorId: vendor.id,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        items: {
          include: { service: true }
        }
      }
    });

    // Calculate stats
    const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);
    const totalBookings = bookings.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get all-time stats for comparison
    const allTimeBookings = await prisma.booking.findMany({
      where: {
        vendorId: vendor.id,
        status: 'COMPLETED'
      }
    });

    const allTimeRevenue = allTimeBookings.reduce((sum, b) => sum + b.total, 0);
    const previousPeriodRevenue = allTimeRevenue - totalRevenue;
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    // Get top services
    const serviceStats = new Map();
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        const serviceName = item.service.name;
        if (serviceStats.has(serviceName)) {
          const current = serviceStats.get(serviceName);
          serviceStats.set(serviceName, {
            revenue: current.revenue + (item.service.price * item.quantity),
            bookings: current.bookings + 1
          });
        } else {
          serviceStats.set(serviceName, {
            revenue: item.service.price * item.quantity,
            bookings: 1
          });
        }
      });
    });

    const topServices = Array.from(serviceStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Mock monthly data for chart
    const monthlyData = [
      { month: 'Jan', revenue: 2800, bookings: 32 },
      { month: 'Feb', revenue: 3100, bookings: 35 },
      { month: 'Mar', revenue: 2900, bookings: 33 },
      { month: 'Apr', revenue: 3200, bookings: 36 },
      { month: 'May', revenue: 3400, bookings: 38 },
      { month: 'Jun', revenue: totalRevenue, bookings: totalBookings }
    ];

    // Mock recent transactions
    const recentTransactions = bookings.slice(0, 10).map(booking => ({
      id: booking.id,
      customer: booking.customerId,
      service: booking.items[0]?.service.name || 'Multiple Services',
      amount: booking.total,
      date: booking.createdAt.toISOString().split('T')[0],
      status: booking.status.toLowerCase()
    }));

    const stats = {
      totalRevenue: allTimeRevenue,
      monthlyRevenue: totalRevenue,
      weeklyRevenue: range === 'week' ? totalRevenue : 850, // Mock
      totalBookings: allTimeBookings.length,
      completedBookings: totalBookings,
      averageBookingValue,
      revenueGrowth,
      topServices,
      monthlyData,
      recentTransactions
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching vendor revenue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get vendor dashboard stats
router.get('/:vendorId/dashboard', protect, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: { vendorId: vendor.id },
      include: {
        customer: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get services
    const services = await prisma.service.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    // Calculate stats
    const allBookings = await prisma.booking.findMany({
      where: { vendorId: vendor.id }
    });

    const newBookings = allBookings.filter(b => b.status === 'PENDING').length;
    const completedServices = allBookings.filter(b => b.status === 'COMPLETED').length;
    const monthlyRevenue = allBookings
      .filter(b => b.status === 'COMPLETED' && 
        new Date(b.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .reduce((sum, b) => sum + b.total, 0);
    const totalServices = services.length;
    const pendingBookings = allBookings.filter(b => b.status === 'PENDING').length;
    const totalCustomers = new Set(allBookings.map(b => b.customerId)).size;

    const stats = {
      newBookings,
      completedServices,
      monthlyRevenue,
      totalServices,
      pendingBookings,
      totalCustomers,
      averageRating: 4.8, // Mock data
      totalReviews: 127 // Mock data
    };

    res.json({
      stats,
      recentAppointments: recentBookings,
      services
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status (accept/reject)
router.put('/bookings/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['CONFIRMED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === 'REJECTED' || status === 'CANCELLED' ? reason : undefined
      }
    });

    res.json({ message: 'Booking status updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mount employee and product routes
router.use('/', employeesRouter);
router.use('/', vendorProductsRouter);

export default router;
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to protect routes (simplified for demo)
const protect = (req: any, res: any, next: any) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all vendors with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, category, limit = 20, offset = 0 } = req.query;

    const where: any = {
      status: 'APPROVED'
    };

    if (search) {
      where.OR = [
        { shopName: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { address: { contains: String(search), mode: 'insensitive' } },
        { city: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: true,
        services: {
          where: category ? { categories: { some: { category: { name: String(category) } } } } : undefined,
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      },
      take: parseInt(String(limit)),
      skip: parseInt(String(offset)),
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to include calculated fields
    const transformedVendors = vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.shopName,
      description: vendor.description,
      address: vendor.address,
      city: vendor.city,
      rating: 4.5 + Math.random() * 0.5, // Mock rating
      reviewCount: Math.floor(Math.random() * 200) + 50, // Mock review count
      distance: Math.random() * 5, // Mock distance
      categories: vendor.services.flatMap(service => 
        service.categories.map(cat => cat.category.name.toLowerCase())
      ).filter((value, index, self) => self.indexOf(value) === index),
      image: '/api/placeholder/300/200',
      isOpen: Math.random() > 0.2, // 80% chance of being open
      nextAvailableSlot: 'Today 2:00 PM', // Mock next available slot
      phone: vendor.user.phone || '+1 (555) 123-4567',
      email: vendor.user.email,
      workingHours: {
        'Monday': '9:00 AM - 7:00 PM',
        'Tuesday': '9:00 AM - 7:00 PM',
        'Wednesday': '9:00 AM - 7:00 PM',
        'Thursday': '9:00 AM - 7:00 PM',
        'Friday': '9:00 AM - 8:00 PM',
        'Saturday': '8:00 AM - 6:00 PM',
        'Sunday': '10:00 AM - 5:00 PM'
      }
    }));

    res.json({ vendors: transformedVendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: true,
        services: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get beauticians (users with BEAUTICIAN role associated with this vendor)
    const beauticians = await prisma.user.findMany({
      where: {
        role: 'BEAUTICIAN',
        // In a real app, you'd have a relationship between beauticians and vendors
        // For now, we'll return mock beauticians
      },
      take: 5
    });

    // Mock beautician data with vendor association
    const mockBeauticians = beauticians.map(beautician => ({
      id: beautician.id,
      name: `${beautician.firstName} ${beautician.lastName}`,
      specialization: ['Hair Styling', 'Facial Treatments', 'Makeup'].slice(0, Math.floor(Math.random() * 3) + 1),
      rating: 4.5 + Math.random() * 0.5,
      experience: Math.floor(Math.random() * 10) + 1,
      avatar: '/api/placeholder/100/100',
      isAvailable: Math.random() > 0.3,
      nextAvailableSlot: 'Today 3:00 PM'
    }));

    // Mock products
    const mockProducts = [
      {
        id: '1',
        name: 'Premium Hair Shampoo',
        description: 'Professional grade shampoo for all hair types',
        price: 25,
        image: '/api/placeholder/150/150',
        inStock: true,
        category: 'hair'
      },
      {
        id: '2',
        name: 'Anti-Aging Face Cream',
        description: 'Luxury face cream with anti-aging properties',
        price: 45,
        image: '/api/placeholder/150/150',
        inStock: true,
        category: 'face'
      },
      {
        id: '3',
        name: 'Nail Art Kit',
        description: 'Complete nail art kit with tools and colors',
        price: 35,
        image: '/api/placeholder/150/150',
        inStock: false,
        category: 'nail'
      }
    ];

    const transformedVendor = {
      id: vendor.id,
      name: vendor.shopName,
      description: vendor.description,
      address: vendor.address,
      city: vendor.city,
      rating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      distance: Math.random() * 5,
      categories: vendor.services.flatMap(service => 
        service.categories.map(cat => cat.category.name.toLowerCase())
      ).filter((value, index, self) => self.indexOf(value) === index),
      images: ['/api/placeholder/800/400', '/api/placeholder/800/400'],
      isOpen: Math.random() > 0.2,
      nextAvailableSlot: 'Today 2:00 PM',
      phone: vendor.user.phone || '+1 (555) 123-4567',
      email: vendor.user.email,
      workingHours: {
        'Monday': '9:00 AM - 7:00 PM',
        'Tuesday': '9:00 AM - 7:00 PM',
        'Wednesday': '9:00 AM - 7:00 PM',
        'Thursday': '9:00 AM - 7:00 PM',
        'Friday': '9:00 AM - 8:00 PM',
        'Saturday': '8:00 AM - 6:00 PM',
        'Sunday': '10:00 AM - 5:00 PM'
      }
    };

    res.json({
      vendor: transformedVendor,
      services: vendor.services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.categories[0]?.category.name.toLowerCase() || 'general'
      })),
      beauticians: mockBeauticians,
      products: mockProducts
    });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new booking
router.post('/:id/bookings', protect, async (req, res) => {
  try {
    const { id: vendorId } = req.params;
    const { 
      customerId, 
      services, 
      products, 
      scheduledDate, 
      scheduledTime, 
      customerInfo,
      total 
    } = req.body;

    // Validate vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Resolve required fields: duration and addressId
    const serviceIds = Array.isArray(services) ? services.map((s: any) => s.id) : [];
    const dbServices = serviceIds.length > 0
      ? await prisma.service.findMany({ where: { id: { in: serviceIds } } })
      : [];

    const computedDuration = dbServices.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Prefer explicit addressId from request, else user's default address, or create a temporary one
    const bodyAddressId = (req.body && (req.body.addressId || req.body?.customerInfo?.addressId)) as string | undefined;
    let resolvedAddressId = bodyAddressId;
    
    if (!resolvedAddressId) {
      const defaultAddress = await prisma.address.findFirst({ where: { userId: customerId, isDefault: true } });
      if (defaultAddress) {
        resolvedAddressId = defaultAddress.id;
      }
    }
    
    // If still no address, create a temporary one from customer info
    if (!resolvedAddressId) {
      const customerAddress = customerInfo?.address || 'Not specified';
      const temporaryAddress = await prisma.address.create({
        data: {
          userId: customerId,
          type: 'HOME',
          name: 'Booking Address',
          street: customerAddress,
          city: customerInfo?.city || 'Unknown',
          state: customerInfo?.state || 'Unknown',
          zipCode: customerInfo?.zipCode || '00000',
          isDefault: false // Don't make it default, just for this booking
        }
      });
      resolvedAddressId = temporaryAddress.id;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        vendorId,
        bookingType: 'AT_HOME', // Set as At-Home service
        status: 'PENDING',
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration: computedDuration,
        subtotal: total,
        total,
        addressId: resolvedAddressId,
        items: {
          create: services.map((service: any) => ({
            serviceId: service.id,
            quantity: 1,
            price: service.price
          }))
        }
      },
      include: {
        vendor: {
          include: {
            user: true
          }
        },
        customer: true,
        items: {
          include: {
            service: true
          }
        }
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: customerId,
        amount: total,
        method: 'CARD', // Default for demo
        status: 'PENDING'
      }
    });

    res.status(201).json({
      booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

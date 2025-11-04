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

// Create new booking
router.post('/', protect, async (req, res) => {
  try {
    const {
      customerId,
      vendorId, // optional for manager assignment later
      services,
      products,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      total
    } = req.body;

    // Validate required fields
    if (!customerId || !services || !scheduledDate || !scheduledTime || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Compute required fields and resolve addressId
    const serviceIds = Array.isArray(services) ? services.map((s: any) => s.id) : [];
    const dbServices = serviceIds.length > 0
      ? await prisma.service.findMany({ where: { id: { in: serviceIds } } })
      : [];

    const computedDuration = dbServices.reduce((sum, s) => sum + (s.duration || 0), 0);
    const computedSubtotal = Array.isArray(services)
      ? services.reduce((sum: number, s: any) => sum + (Number(s.price) * Number(s.quantity || 1)), 0)
      : Number(total) || 0;
    const finalTotal = Number(total) || computedSubtotal;

    const bodyAddressId = (req.body && (req.body.addressId || req.body?.address?.id)) as string | undefined;
    let resolvedAddressId = bodyAddressId;
    if (!resolvedAddressId) {
      const defaultAddress = await prisma.address.findFirst({ where: { userId: customerId, isDefault: true } });
      if (defaultAddress) {
        resolvedAddressId = defaultAddress.id;
      }
    }
    // If still missing, create an address from provided fields if available
    if (!resolvedAddressId && address && address.street && address.city) {
      const createdAddress = await prisma.address.create({
        data: {
          userId: customerId,
          street: address.street,
          city: address.city,
          state: address.state || '',
          zipCode: address.zipCode || '',
          isDefault: false
        }
      });
      resolvedAddressId = createdAddress.id;
    }
    if (!resolvedAddressId) {
      return res.status(400).json({ error: 'addressId is required or provide address fields (street, city)' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        vendorId: vendorId || null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        addressId: resolvedAddressId,
        notes,
        duration: computedDuration,
        subtotal: computedSubtotal,
        total: finalTotal,
        status: 'PENDING',
        items: {
          create: services.map((service: any) => ({
            serviceId: service.id,
            quantity: service.quantity || 1,
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
        amount: finalTotal,
        status: 'PENDING',
        method: 'ONLINE'
      }
    });

    res.status(201).json({ 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's bookings
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    const where: any = { customerId: userId };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vendor: {
          include: {
            user: true
          }
        },
        items: {
          include: {
            service: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(limit)),
      skip: parseInt(String(offset))
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
        },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
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

    res.json({ booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        // You might want to add a cancellation reason field
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

    res.json({ booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking statistics for user
router.get('/user/:userId/stats', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const [activeBookings, completedBookings, pendingPayments, totalBookings] = await Promise.all([
      prisma.booking.count({
        where: { 
          customerId: userId, 
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } 
        }
      }),
      prisma.booking.count({
        where: { 
          customerId: userId, 
          status: 'COMPLETED' 
        }
      }),
      prisma.payment.count({
        where: { 
          userId, 
          status: 'PENDING' 
        }
      }),
      prisma.booking.count({
        where: { customerId: userId }
      })
    ]);

    res.json({
      activeBookings,
      completedBookings,
      pendingPayments,
      totalBookings
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

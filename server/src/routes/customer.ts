import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// ==================== PROFILE MANAGEMENT ====================

// Get customer profile
router.get('/profile', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          take: 1
        },
        _count: {
          select: {
            bookings: true,
            payments: true
          }
        }
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update customer profile
router.put('/profile', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName,
        lastName,
        phone,
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ==================== ADDRESS MANAGEMENT ====================

// Get customer addresses
router.get('/addresses', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' }
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/addresses', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      type,
      name,
      street,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      isDefault
    } = req.body;

    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        type,
        name,
        street,
        city,
        state,
        zipCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isDefault: isDefault || false
      }
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create address' });
  }
});

// Update address
router.put('/addresses/:id', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      name,
      street,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      isDefault
    } = req.body;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        type,
        name,
        street,
        city,
        state,
        zipCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isDefault: isDefault || false
      }
    });

    res.json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:id', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

// ==================== APPOINTMENT BOOKING ====================

// Search available vendors
router.get('/vendors/search', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      location,
      date,
      time,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: 'APPROVED'
    };

    if (category) {
      where.services = {
        some: {
          categories: {
            some: {
              category: {
                name: { contains: category as string, mode: 'insensitive' }
              }
            }
          }
        }
      };
    }

    if (search) {
      where.OR = [
        { shopName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        services: {
          where: { isActive: true },
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average ratings
    const vendorsWithRating = vendors.map(vendor => {
      const avgRating = vendor.reviews.length > 0
        ? vendor.reviews.reduce((sum, review) => sum + review.rating, 0) / vendor.reviews.length
        : 0;

      return {
        ...vendor,
        avgRating,
        reviewCount: vendor._count.reviews
      };
    });

    const total = await prisma.vendor.count({ where });

    res.json({
      success: true,
      data: vendorsWithRating,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search vendors' });
  }
});

// Get vendor details
router.get('/vendors/:id', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id, status: 'APPROVED' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        services: {
          where: { isActive: true },
          include: {
            categories: {
              include: {
                category: true
              }
            },
            addons: {
              include: {
                addon: true
              }
            }
          }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Calculate average rating
    const avgRating = vendor.reviews.length > 0
      ? vendor.reviews.reduce((sum, review) => sum + review.rating, 0) / vendor.reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        ...vendor,
        avgRating,
        reviewCount: vendor.reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor details' });
  }
});

// Check vendor availability
router.get('/vendors/:id/availability', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const targetDate = new Date(date as string);

    const slots = await prisma.vendorSlot.findMany({
      where: {
        vendorId: id,
        date: targetDate,
        status: 'AVAILABLE'
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch availability' });
  }
});

// Book appointment
router.post('/bookings', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      vendorId,
      scheduledDate,
      scheduledTime,
      addressId,
      services,
      notes
    } = req.body;

    // Validate required fields
    if (!vendorId || !scheduledDate || !scheduledTime || !addressId || !services) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify vendor exists and is approved
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, status: 'APPROVED' }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id }
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Calculate total price
    let subtotal = 0;
    for (const service of services) {
      const serviceDetails = await prisma.service.findUnique({
        where: { id: service.serviceId }
      });
      if (serviceDetails) {
        subtotal += serviceDetails.price * service.quantity;
      }
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: req.user!.id,
        vendorId,
        bookingType: 'AT_HOME', // Set as At-Home service
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration: 60, // Default duration, can be calculated from services
        subtotal,
        tax,
        total,
        addressId,
        notes,
        status: 'PENDING'
      },
      include: {
        customer: true,
        vendor: {
          include: {
            user: true
          }
        },
        address: true
      }
    });

    // Create booking items
    for (const service of services) {
      await prisma.bookingItem.create({
        data: {
          bookingId: booking.id,
          serviceId: service.serviceId,
          quantity: service.quantity,
          price: service.price
        }
      });
    }

    // Reserve the time slot
    await prisma.vendorSlot.updateMany({
      where: {
        vendorId,
        date: new Date(scheduledDate),
        startTime: scheduledTime,
        status: 'AVAILABLE'
      },
      data: {
        status: 'BOOKED',
        bookingId: booking.id
      }
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// Get customer bookings
router.get('/bookings', async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // For now, allow access without auth for debugging
    // In production, this should use requireAuth middleware
    const customerId = userId || 'temp-customer-id';
    
    const where: any = { customerId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              shopName: true,
              user: { select: { firstName: true, lastName: true } }
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              role: true,
              phone: true
            }
          },
          items: {
            include: {
              service: true
            }
          },
          address: true
        },
        skip,
        take: Number(limit),
        orderBy: { scheduledDate: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Get booking details
router.get('/bookings/:id', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
      include: {
        vendor: {
          include: {
            user: true
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            role: true,
            phone: true
          }
        },
        items: {
          include: {
            service: true,
            addons: {
              include: {
                addon: true
              }
            }
          }
        },
        address: true,
        payments: true,
        events: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking details' });
  }
});

// Cancel booking
router.patch('/bookings/:id/cancel', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by customer'
      }
    });

    // Free up the time slot
    await prisma.vendorSlot.updateMany({
      where: { bookingId: id },
      data: {
        status: 'AVAILABLE',
        bookingId: null
      }
    });

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: id,
        type: 'CANCELLED',
        data: JSON.stringify({ reason, cancelledBy: 'CUSTOMER' })
      }
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

// ==================== PAYMENT HISTORY ====================

// Get payment history
router.get('/payments', requireAuth, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id };
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              vendor: {
                select: {
                  id: true,
                  shopName: true
                }
              }
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

export default router;
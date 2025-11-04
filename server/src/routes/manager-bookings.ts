import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all bookings for manager dashboard (alias 1: with explicit /bookings)
router.get('/bookings', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { status, bookingType, notesContains, page = '1', limit = '10' } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (bookingType) where.bookingType = bookingType;
    if (notesContains && String(notesContains).trim().length > 0) {
      where.notes = { contains: String(notesContains).trim() };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        vendor: {
          select: {
            id: true,
            shopName: true,
            address: true,
            city: true
          }
        },
        address: true,
        items: {
          include: {
            service: {
              select: {
                name: true,
                description: true,
                price: true
              }
            }
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
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            method: true
          }
        }
      },
      orderBy: { scheduledDate: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const total = await prisma.booking.count({ where });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching manager bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Get all bookings for manager dashboard (alias 2: base path '/')
router.get('/', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { status, notesContains, page = '1', limit = '10' } = req.query as any;
    const where: any = {};
    if (status) where.status = status;
    if (notesContains && String(notesContains).trim().length > 0) {
      where.notes = { contains: String(notesContains).trim() };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vendor: { select: { id: true, shopName: true, address: true, city: true } },
        address: true,
        items: { include: { service: { select: { name: true, description: true, price: true } } } },
        employee: { select: { id: true, name: true, role: true, phone: true } }
      },
      orderBy: { scheduledDate: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const total = await prisma.booking.count({ where });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching manager bookings (base path):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Assign vendor to a booking (alias 1)
router.put('/bookings/:id/assign-vendor', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    // Verify vendor exists and is approved
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, status: 'APPROVED' }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found or not approved' });
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        vendorId,
        status: 'AWAITING_VENDOR_RESPONSE'
      },
      include: {
        customer: true,
        vendor: true,
        address: true,
        items: {
          include: {
            service: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Vendor assigned successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error assigning vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to assign vendor' });
  }
});

// Assign vendor to a booking (alias 2: base path)
router.put('/:id/assign-vendor', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, status: 'APPROVED' } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found or not approved' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { vendorId, status: 'AWAITING_VENDOR_RESPONSE' },
      include: { customer: true, vendor: true, address: true, items: { include: { service: true } } }
    });

    res.json({ success: true, message: 'Vendor assigned successfully', data: booking });
  } catch (error) {
    console.error('Error assigning vendor (base path):', error);
    res.status(500).json({ success: false, message: 'Failed to assign vendor' });
  }
});

// Get booking statistics for manager (alias 1)
router.get('/bookings/stats', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const [total, pending, awaitingManager, awaitingVendor, confirmed, inProgress, completed] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'AWAITING_MANAGER' } }),
      prisma.booking.count({ where: { status: 'AWAITING_VENDOR_RESPONSE' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } })
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        awaitingManager,
        awaitingVendor,
        confirmed,
        inProgress,
        completed
      }
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Get booking statistics for manager (alias 2: base path)
router.get('/stats', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const [total, pending, awaitingManager, awaitingVendor, confirmed, inProgress, completed] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'AWAITING_MANAGER' } }),
      prisma.booking.count({ where: { status: 'AWAITING_VENDOR_RESPONSE' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } })
    ]);

    res.json({ success: true, data: { total, pending, awaitingManager, awaitingVendor, confirmed, inProgress, completed } });
  } catch (error) {
    console.error('Error fetching booking stats (base path):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

export default router;

// ==================== ONE-TIME UTILITIES ====================

// Bulk update: set AWAITING_MANAGER for at-home PENDING bookings (notes contains 'at home')
router.put('/bookings/bulk/awaiting-manager', requireAuth, requireRole(['MANAGER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { phrase = 'at home' } = (req.body || {}) as { phrase?: string };

    // Update bookings that are clearly at-home (by notes) and still pending
    const result = await prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        notes: {
          contains: String(phrase).trim()
        }
      },
      data: {
        status: 'AWAITING_MANAGER'
      }
    });

    res.json({
      success: true,
      message: 'Bookings updated to AWAITING_MANAGER',
      data: {
        count: result.count,
        phrase
      }
    });
  } catch (error) {
    console.error('Error bulk-updating bookings to AWAITING_MANAGER:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk update bookings' });
  }
});


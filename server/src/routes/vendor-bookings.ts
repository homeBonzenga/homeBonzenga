import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all bookings for a vendor
router.get('/bookings', requireAuth, requireRole(['VENDOR']), async (req: AuthenticatedRequest, res) => {
  try {
    // Get vendor ID from user
    const vendor = await prisma.vendor.findFirst({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ['PENDING', 'AWAITING_VENDOR_RESPONSE', 'CONFIRMED', 'IN_PROGRESS'] }
      },
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
        employee: {
          select: {
            id: true,
            name: true,
            role: true,
            phone: true
          }
        },
        address: true,
        items: {
          include: {
            service: {
              select: {
                name: true,
                description: true,
                price: true,
                duration: true
              }
            }
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Approve a booking
router.put('/bookings/:id/approve', requireAuth, requireRole(['VENDOR']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    // Get vendor
    const vendor = await prisma.vendor.findFirst({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Verify booking exists and belongs to this vendor
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        vendorId: vendor.id,
        status: { in: ['PENDING', 'AWAITING_VENDOR_RESPONSE'] }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not available for approval' });
    }

    // If employeeId is provided, verify employee belongs to vendor
    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          vendorId: vendor.id,
          status: 'ACTIVE'
        }
      });

      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
    }

    // Update booking to confirmed and assign employee
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        employeeId: employeeId || null
      },
      include: {
        customer: true,
        vendor: true,
        employee: true,
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
      message: 'Booking confirmed successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ success: false, message: 'Failed to approve booking' });
  }
});

// Reject a booking
router.put('/bookings/:id/reject', requireAuth, requireRole(['VENDOR']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get vendor
    const vendor = await prisma.vendor.findFirst({
      where: { userId: req.user!.id }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Verify booking exists and belongs to this vendor
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        vendorId: vendor.id,
        status: { in: ['PENDING', 'AWAITING_VENDOR_RESPONSE'] }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not available for rejection' });
    }

    // Update booking to rejected
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Booking rejected by vendor'
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
      message: 'Booking rejected successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ success: false, message: 'Failed to reject booking' });
  }
});

export default router;


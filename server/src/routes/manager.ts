import express from 'express';
import { PrismaClient } from '@prisma/client';
const { sendVendorApprovalEmail, sendVendorRejectionEmail } = require('../utils/sendEmail');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to protect routes (simplified for demo)
const protect = (req: any, res: any, next: any) => {
  // For demo purposes, allow requests without strict auth
  // In production, you'd verify JWT token here
  console.log('Manager route accessed:', req.path);
  next();
};

// Get manager dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get pending vendors
    const pendingVendors = await prisma.vendor.findMany({
      where: { status: 'PENDING' },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent appointments
    const recentAppointments = await prisma.booking.findMany({
      include: {
        customer: true,
        vendor: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Calculate stats
    const totalVendors = await prisma.vendor.count();
    const activeVendors = await prisma.vendor.count({ where: { status: 'APPROVED' } });
    const pendingVendorApplications = await prisma.vendor.count({ where: { status: 'PENDING' } });
    
    const totalAppointments = await prisma.booking.count();
    const pendingAppointments = await prisma.booking.count({ where: { status: 'PENDING' } });
    const completedAppointments = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true }
    });

    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { total: true }
    });

    const stats = {
      pendingVendorApplications,
      totalActiveVendors: activeVendors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue: totalRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0
    };

    res.json({
      stats,
      pendingVendors,
      recentAppointments
    });
  } catch (error) {
    console.error('Error fetching manager dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pending vendors
router.get('/vendors/pending', protect, async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { status: 'PENDING' },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ vendors });
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all vendors
router.get('/vendors/all', protect, async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: true,
        bookings: {
          where: { status: 'COMPLETED' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats for each vendor
    const vendorsWithStats = vendors.map(vendor => ({
      ...vendor,
      stats: {
        totalBookings: vendor.bookings.length,
        completedBookings: vendor.bookings.length,
        totalRevenue: vendor.bookings.reduce((sum, booking) => sum + booking.total, 0),
        averageRating: 4.5, // Mock data
        totalReviews: Math.floor(vendor.bookings.length * 0.8) // Mock data
      }
    }));

    res.json({ vendors: vendorsWithStats });
  } catch (error) {
    console.error('Error fetching all vendors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve vendor
router.put('/vendors/:id/approve', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Get vendor with user info for email notification
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update vendor status
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: 'APPROVED',
      }
    });

    // Send approval email (non-blocking)
    sendVendorApprovalEmail(
      vendor.user.email,
      vendor.shopName,
      `${vendor.user.firstName} ${vendor.user.lastName}`
    ).catch((error: any) => {
      console.error('Failed to send approval email:', error);
    });

    res.json({ message: 'Vendor approved successfully', vendor: updatedVendor });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject vendor
router.put('/vendors/:id/reject', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get vendor with user info for email notification
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update vendor status
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: 'REJECTED'
      }
    });

    // Send rejection email (non-blocking)
    sendVendorRejectionEmail(
      vendor.user.email,
      vendor.shopName,
      `${vendor.user.firstName} ${vendor.user.lastName}`,
      reason || ''
    ).catch((error: any) => {
      console.error('Failed to send rejection email:', error);
    });

    res.json({ message: 'Vendor rejected successfully', vendor: updatedVendor });
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all appointments
router.get('/appointments', protect, async (req, res) => {
  try {
    const { status, serviceType, limit = 50 } = req.query;

    const whereClause: any = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (serviceType && serviceType !== 'all') {
      whereClause.serviceType = serviceType;
    }

    const appointments = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        vendor: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { scheduledDate: 'desc' },
      take: parseInt(limit as string)
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update appointment status
router.patch('/appointments/:appointmentId/status', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await prisma.booking.update({
      where: { id: appointmentId },
      data: { status }
    });

    res.json({ message: 'Appointment status updated successfully', appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reports data
router.get('/reports', protect, async (req, res) => {
  try {
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

    // Get vendor stats
    const totalVendors = await prisma.vendor.count();
    const activeVendors = await prisma.vendor.count({ where: { status: 'APPROVED' } });
    const pendingVendors = await prisma.vendor.count({ where: { status: 'PENDING' } });

    // Get appointment stats
    const totalAppointments = await prisma.booking.count();
    const completedAppointments = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const pendingAppointments = await prisma.booking.count({ where: { status: 'PENDING' } });

    // Get revenue stats
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true }
    });

    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _sum: { total: true }
    });

    // Get customer count
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    const stats = {
      totalVendors,
      activeVendors,
      pendingVendors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenue: totalRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      averageRating: 4.6, // Mock data
      totalCustomers
    };

    // Get vendor performance data
    const vendors = await prisma.vendor.findMany({
      where: { status: 'APPROVED' },
      include: {
        bookings: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    const vendorPerformance = vendors.map(vendor => ({
      id: vendor.id,
      shopName: vendor.shopName,
      // businessType not in schema; omit or compute if needed
      totalBookings: vendor.bookings.length,
      completedBookings: vendor.bookings.length,
      totalRevenue: vendor.bookings.reduce((sum, booking) => sum + booking.total, 0),
      averageRating: 4.5, // Mock data
      totalReviews: Math.floor(vendor.bookings.length * 0.8) // Mock data
    })).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

    // Mock monthly data for chart
    const monthlyData = [
      { month: 'Jan', vendors: Math.floor(totalVendors * 0.6), appointments: Math.floor(totalAppointments * 0.3), revenue: Math.floor((totalRevenue._sum.total || 0) * 0.2) },
      { month: 'Feb', vendors: Math.floor(totalVendors * 0.7), appointments: Math.floor(totalAppointments * 0.35), revenue: Math.floor((totalRevenue._sum.total || 0) * 0.25) },
      { month: 'Mar', vendors: Math.floor(totalVendors * 0.75), appointments: Math.floor(totalAppointments * 0.3), revenue: Math.floor((totalRevenue._sum.total || 0) * 0.23) },
      { month: 'Apr', vendors: Math.floor(totalVendors * 0.8), appointments: Math.floor(totalAppointments * 0.35), revenue: Math.floor((totalRevenue._sum.total || 0) * 0.26) },
      { month: 'May', vendors: Math.floor(totalVendors * 0.85), appointments: Math.floor(totalAppointments * 0.37), revenue: Math.floor((totalRevenue._sum.total || 0) * 0.27) },
      { month: 'Jun', vendors: totalVendors, appointments: totalAppointments, revenue: totalRevenue._sum.total || 0 }
    ];

    res.json({
      stats,
      vendorPerformance,
      monthlyData
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get manager profile
router.get('/profile', protect, async (req, res) => {
  try {
    // For demo purposes, return mock profile data
    // In production, fetch from database using req.user.id
    const managerProfile = {
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@homebonzenga.com',
      role: 'MANAGER',
      totalVendorsManaged: await prisma.vendor.count({ where: { status: 'APPROVED' } }),
      totalCustomersManaged: await prisma.user.count({ where: { role: 'CUSTOMER' } }),
      totalAppointmentsManaged: await prisma.booking.count(),
      createdAt: new Date()
    };
    
    res.json(managerProfile);
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update manager profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    // In production, update database using req.user.id
    // For demo, just return success
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating manager profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

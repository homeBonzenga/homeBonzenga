import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendVendorApprovalNotification, sendVendorRejectionNotification } from '../lib/emailService';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to protect routes (simplified for demo)
const protect = (req: any, res: any, next: any) => {
  // In a real app, you'd verify JWT token here
  // For demo, we'll just check if user ID is provided
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Get admin dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get comprehensive stats
    const totalUsers = await prisma.user.count();
    const totalVendors = await prisma.vendor.count();
    const totalManagers = await prisma.user.count({ where: { role: 'MANAGER' } });
    
    const pendingApprovals = await prisma.vendor.count({ where: { status: 'PENDING' } });
    
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const atHomeBookings = await prisma.booking.count(); // All bookings are at-home in this schema
    const salonBookings = 0; // No salon bookings in current schema
    
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

    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });
    const activeVendors = await prisma.vendor.count({ where: { status: 'APPROVED' } });
    const pendingVendors = await prisma.vendor.count({ where: { status: 'PENDING' } });

    const stats = {
      totalUsers,
      totalVendors,
      totalManagers,
      pendingApprovals,
      totalRevenue: totalRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      pendingPayouts: 0, // Mock data
      refundRequests: 0, // Mock data
      activeUsers,
      suspendedUsers,
      activeVendors,
      pendingVendors,
      totalBookings,
      completedBookings,
      atHomeBookings,
      salonBookings,
      totalCommissions: (totalRevenue._sum.total || 0) * 0.15, // 15% commission
      pendingDisputes: 0, // Mock data
      averageRating: 4.6 // Mock data
    };

    // Get recent activity
    const recentActivity = [
      {
        id: '1',
        type: 'user_registration',
        description: 'New user registered',
        timestamp: new Date().toISOString(),
        user: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        id: '2',
        type: 'vendor_approval',
        description: 'Vendor approved by manager',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'Sarah Johnson', email: 'sarah@example.com' }
      }
    ];

    // Get top vendors
    const topVendors = await prisma.vendor.findMany({
      include: {
        bookings: {
          where: { status: 'COMPLETED' }
        }
      },
      take: 5
    });

    const topVendorsWithStats = topVendors.map(vendor => ({
      id: vendor.id,
      shopName: vendor.shopName,
      totalBookings: vendor.bookings.length,
      totalRevenue: vendor.bookings.reduce((sum, booking) => sum + booking.total, 0),
      averageRating: 4.5, // Mock data
      status: vendor.status
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      stats,
      recentActivity,
      topVendors: topVendorsWithStats
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users
router.get('/users', protect, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bookings: {
          where: { status: 'COMPLETED' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const usersWithStats = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: null, // Not available in current schema
      totalBookings: user.bookings.length,
      totalSpent: user.bookings.reduce((sum: number, booking: any) => sum + (booking.total || 0), 0),
      isVerified: true // Default to true since not in schema
    }));

    res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user status
router.patch('/users/:userId/status', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all vendors
router.get('/vendors', protect, async (req, res) => {
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

    const vendorsWithStats = vendors.map(vendor => ({
      id: vendor.id,
      shopname: vendor.shopName,
      description: vendor.description,
      businessType: 'salon', // Default since not in schema
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      status: vendor.status,
      isVerified: true, // Default since not in schema
      user: {
        firstName: vendor.user.firstName,
        lastName: vendor.user.lastName,
        email: vendor.user.email,
        phone: vendor.user.phone || ''
      },
      createdAt: vendor.createdAt.toISOString(),
      approvedAt: vendor.status === 'APPROVED' ? vendor.updatedAt.toISOString() : null,
      stats: {
        totalBookings: vendor.bookings.length,
        completedBookings: vendor.bookings.length,
        totalRevenue: vendor.bookings.reduce((sum: number, booking: any) => sum + (booking.total || 0), 0),
        averageRating: 4.5, // Mock data
        totalReviews: Math.floor(vendor.bookings.length * 0.8) // Mock data
      }
    }));

    res.json({ vendors: vendorsWithStats });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update vendor status
router.patch('/vendors/:vendorId/status', protect, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, reason } = req.body;

    // Get vendor with user details before updating
    const vendorBefore = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true }
    });

    if (!vendorBefore) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update vendor status
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status }
    });

    // Send email notification based on status change
    if (status === 'APPROVED' && vendorBefore.status !== 'APPROVED') {
      // Send approval email
      sendVendorApprovalNotification({
        email: vendorBefore.user.email,
        shopName: vendorBefore.shopName,
        ownerName: `${vendorBefore.user.firstName} ${vendorBefore.user.lastName}`
      }).catch(err => {
        console.error('Failed to send approval notification email:', err);
        // Don't block the status update if email fails
      });
    } else if (status === 'REJECTED' && vendorBefore.status !== 'REJECTED') {
      // Send rejection email
      sendVendorRejectionNotification({
        email: vendorBefore.user.email,
        shopName: vendorBefore.shopName,
        ownerName: `${vendorBefore.user.firstName} ${vendorBefore.user.lastName}`,
        reason: reason || 'Your application did not meet our requirements at this time.'
      }).catch(err => {
        console.error('Failed to send rejection notification email:', err);
        // Don't block the status update if email fails
      });
    }

    res.json({ message: 'Vendor status updated successfully', vendor });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete vendor
router.delete('/vendors/:vendorId', protect, async (req, res) => {
  try {
    const { vendorId } = req.params;

    await prisma.vendor.delete({
      where: { id: vendorId }
    });

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all managers
router.get('/managers', protect, async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      orderBy: { createdAt: 'desc' }
    });

    // Mock stats for managers
    const managersWithStats = managers.map(manager => ({
      id: manager.id,
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      phone: manager.phone || null,
      status: manager.status,
      createdAt: manager.createdAt.toISOString(),
      lastLoginAt: null, // Not available in current schema
      isVerified: true, // Default since not in schema
      stats: {
        vendorsApproved: Math.floor(Math.random() * 20) + 5,
        vendorsRejected: Math.floor(Math.random() * 5) + 1,
        appointmentsManaged: Math.floor(Math.random() * 100) + 20,
        totalActions: Math.floor(Math.random() * 120) + 30
      }
    }));

    res.json({ managers: managersWithStats });
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update manager status
router.patch('/managers/:managerId/status', protect, async (req, res) => {
  try {
    const { managerId } = req.params;
    const { status } = req.body;

    const manager = await prisma.user.update({
      where: { id: managerId },
      data: { status }
    });

    res.json({ message: 'Manager status updated successfully', manager });
  } catch (error) {
    console.error('Error updating manager status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get settings
router.get('/settings', protect, async (req, res) => {
  try {
    // Mock settings data
    const settings = {
      platformName: 'Home Bonzenga',
      platformDescription: 'Premium Beauty Services Platform',
      supportEmail: 'support@homebonzenga.com',
      supportPhone: '+243 123 456 789',
      platformAddress: 'Kinshasa, DR Congo',
      timezone: 'Africa/Kinshasa',
      defaultCommissionRate: 15,
      minimumPayoutAmount: 50,
      maximumPayoutAmount: 10000,
      payoutProcessingDays: 7,
      allowUserRegistration: true,
      requireEmailVerification: true,
      allowVendorRegistration: true,
      requireVendorApproval: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      maintenanceMode: false,
      debugMode: false,
      autoBackup: true,
      backupFrequency: 'daily'
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update settings
router.put('/settings', protect, async (req, res) => {
  try {
    const { settings } = req.body;

    // Mock update
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin profile
router.get('/profile', protect, async (req, res) => {
  try {
    // For demo purposes, return mock profile data
    // In production, fetch from database using req.user.id
    const adminProfile = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@homebonzenga.com',
      role: 'ADMIN',
      totalUsers: await prisma.user.count(),
      totalVendors: await prisma.vendor.count(),
      totalManagers: await prisma.user.count({ where: { role: 'MANAGER' } }),
      totalBookings: await prisma.booking.count(),
      createdAt: new Date()
    };
    
    res.json(adminProfile);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update admin profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    // In production, update database using req.user.id
    // For demo, just return success
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get access logs with filtering
router.get('/access-logs', protect, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      role, 
      success, 
      method,
      email,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate as string);
      }
    }

    if (role) {
      where.roleAttempted = role;
    }

    if (success !== undefined) {
      where.success = success === 'true';
    }

    if (method) {
      where.method = method;
    }

    if (email) {
      // SQLite doesn't support case-insensitive mode, so we'll use contains
      where.emailAttempted = {
        contains: email as string,
      };
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.accessLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
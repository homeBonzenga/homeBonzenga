import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// User Dashboard endpoints
router.get('/user/stats', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
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
          userId: userId,
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
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

router.get('/user/bookings', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        vendor: {
          include: { user: true }
        },
        items: {
          include: { service: true }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.booking.count({
      where: { customerId: userId }
    });

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('User bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// Vendor Dashboard endpoints
router.get('/vendor/stats', async (req, res) => {
  try {
    const vendorId = req.query.vendorId as string;
    
    const [newBookings, completedServices, totalRevenue, totalServices] = await Promise.all([
      prisma.booking.count({
        where: { 
          vendorId: vendorId,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      }),
      prisma.booking.count({
        where: { 
          vendorId: vendorId,
          status: 'COMPLETED'
        }
      }),
      prisma.payment.aggregate({
        where: { 
          booking: { vendorId: vendorId },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      prisma.service.count({
        where: { vendorId: vendorId }
      })
    ]);

    res.json({
      newBookings,
      completedServices,
      monthlyRevenue: totalRevenue._sum.amount || 0,
      totalServices
    });
  } catch (error) {
    console.error('Vendor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor stats' });
  }
});

router.get('/vendor/services', async (req, res) => {
  try {
    const vendorId = req.query.vendorId as string;
    
    const services = await prisma.service.findMany({
      where: { vendorId: vendorId },
      include: {
        categories: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(services);
  } catch (error) {
    console.error('Vendor services error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor services' });
  }
});

router.get('/vendor/appointments', async (req, res) => {
  try {
    const vendorId = req.query.vendorId as string;
    
    const appointments = await prisma.booking.findMany({
      where: { vendorId: vendorId },
      include: {
        customer: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error('Vendor appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor appointments' });
  }
});

// Beautician Dashboard endpoints
router.get('/beautician/stats', async (req, res) => {
  try {
    const beauticianId = req.query.beauticianId as string;
    
    const [upcomingAppointments, completedServices, totalEarnings] = await Promise.all([
      prisma.booking.count({
        where: { 
          // Note: This assumes beautician is linked to bookings somehow
          // You might need to adjust based on your schema
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
        }
      }),
      prisma.booking.count({
        where: { 
          status: 'COMPLETED'
        }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      })
    ]);

    res.json({
      upcomingAppointments,
      completedServices,
      totalEarnings: totalEarnings._sum.amount || 0
    });
  } catch (error) {
    console.error('Beautician stats error:', error);
    res.status(500).json({ error: 'Failed to fetch beautician stats' });
  }
});

router.get('/beautician/appointments', async (req, res) => {
  try {
    const beauticianId = req.query.beauticianId as string;
    
    const appointments = await prisma.booking.findMany({
      where: { 
        // Adjust based on your schema
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
      },
      include: {
        customer: true,
        vendor: {
          include: { user: true }
        },
        items: {
          include: { service: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error('Beautician appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch beautician appointments' });
  }
});

// Manager Dashboard endpoints
router.get('/manager/stats', async (req, res) => {
  try {
    const [pendingVendorApplications, pendingBeauticianApplications, totalActiveVendors, appointmentsOverview] = await Promise.all([
      prisma.vendor.count({
        where: { status: 'PENDING' }
      }),
      prisma.user.count({
        where: { 
          role: 'BEAUTICIAN',
          status: 'PENDING'
        }
      }),
      prisma.vendor.count({
        where: { status: 'APPROVED' }
      }),
      prisma.booking.count({
        where: { 
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
        }
      })
    ]);

    res.json({
      pendingVendorApplications,
      pendingBeauticianApplications,
      totalActiveVendors,
      appointmentsOverview
    });
  } catch (error) {
    console.error('Manager stats error:', error);
    res.status(500).json({ error: 'Failed to fetch manager stats' });
  }
});

router.get('/manager/pending-approvals', async (req, res) => {
  try {
    const [pendingVendors, pendingBeauticians] = await Promise.all([
      prisma.vendor.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        where: { 
          role: 'BEAUTICIAN',
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      pendingVendors,
      pendingBeauticians
    });
  } catch (error) {
    console.error('Manager pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

router.post('/manager/approve-vendor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { 
        status: action === 'approve' ? 'APPROVED' : 'REJECTED'
      },
      include: { user: true }
    });

    res.json(vendor);
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ error: 'Failed to update vendor status' });
  }
});

router.post('/manager/approve-beautician/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const beautician = await prisma.user.update({
      where: { id },
      data: { 
        status: action === 'approve' ? 'ACTIVE' : 'SUSPENDED'
      }
    });

    res.json(beautician);
  } catch (error) {
    console.error('Approve beautician error:', error);
    res.status(500).json({ error: 'Failed to update beautician status' });
  }
});

// Admin Dashboard endpoints
router.get('/admin/stats', async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalBeauticians, pendingApprovals, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.user.count({
        where: { role: 'BEAUTICIAN' }
      }),
      (async () => {
        const [pendingVendors, pendingBeauticians] = await Promise.all([
          prisma.vendor.count({
            where: { status: 'PENDING' }
          }),
          prisma.user.count({
            where: { 
              role: 'BEAUTICIAN',
              status: 'PENDING'
            }
          })
        ]);
        return pendingVendors + pendingBeauticians;
      })(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      totalUsers,
      totalVendors,
      totalBeauticians,
      pendingApprovals,
      totalRevenue: totalRevenue._sum.amount || 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

router.get('/admin/revenue-chart', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Get revenue data for the last 12 months
    const revenueData = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(amount) as revenue
      FROM payments 
      WHERE status = 'COMPLETED' 
        AND createdAt >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month
    `;

    res.json(revenueData);
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

router.get('/admin/bookings-distribution', async (req, res) => {
  try {
    const distribution = await prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json(distribution);
  } catch (error) {
    console.error('Bookings distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings distribution' });
  }
});

router.get('/admin/vendor-management', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(vendors);
  } catch (error) {
    console.error('Vendor management error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

router.get('/admin/beautician-management', async (req, res) => {
  try {
    const beauticians = await prisma.user.findMany({
      where: { role: 'BEAUTICIAN' },
      orderBy: { createdAt: 'desc' }
    });

    res.json(beauticians);
  } catch (error) {
    console.error('Beautician management error:', error);
    res.status(500).json({ error: 'Failed to fetch beauticians' });
  }
});

router.get('/admin/user-overview', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance
    });

    res.json(users);
  } catch (error) {
    console.error('User overview error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;

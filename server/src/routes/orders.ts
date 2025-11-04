import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// ==================== ORDER MANAGEMENT ====================

// Create new order
router.post('/', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Create order with items
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user.id,
          totalAmount: parseFloat(totalAmount),
          status: 'PENDING',
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: parseFloat(item.totalPrice)
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  vendor: {
                    select: {
                      id: true,
                      shopName: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Create initial delivery event
      await tx.deliveryEvent.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING',
          note: 'Order created and pending payment',
          data: JSON.stringify({
            orderId: newOrder.id,
            customerId: req.user.id,
            totalAmount: newOrder.totalAmount
          })
        }
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Get customer orders
router.get('/my-orders', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = { customerId: req.user.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    shopName: true
                  }
                }
              }
            }
          }
        },
        deliveryEvents: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get latest delivery status
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/:id', requireAuth, requireRole(['CUSTOMER', 'VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Build where clause based on user role
    let where: any = { id };
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'VENDOR') {
      where.items = {
        some: {
          product: {
            vendorId: req.user.vendorId
          }
        }
      };
    }

    const order = await prisma.order.findFirst({
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
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    shopName: true,
                    address: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        deliveryEvents: {
          orderBy: { createdAt: 'asc' }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Cancel order
router.patch('/:id/cancel', requireAuth, requireRole(['CUSTOMER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Build where clause based on user role
    let where: any = { id };
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: true,
        deliveryEvents: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel delivered order' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Create delivery event
    await prisma.deliveryEvent.create({
      data: {
        orderId: id,
        status: 'CANCELLED',
        note: `Order cancelled${reason ? `: ${reason}` : ''}`,
        data: JSON.stringify({
          reason,
          cancelledBy: req.user.role,
          cancelledAt: new Date()
        })
      }
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

// ==================== DELIVERY TRACKING ====================

// Update delivery status (Vendor/Admin only)
router.patch('/:id/delivery-status', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status' });
    }

    // Build where clause based on user role
    let where: any = { id };
    if (req.user.role === 'VENDOR') {
      where.items = {
        some: {
          product: {
            vendorId: req.user.vendorId
          }
        }
      };
    }

    const order = await prisma.order.findFirst({ where });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status if delivery is completed or failed
    let orderStatus = order.status;
    if (status === 'DELIVERED') {
      orderStatus = 'DELIVERED';
    } else if (status === 'FAILED') {
      orderStatus = 'FAILED';
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: orderStatus }
    });

    // Create delivery event
    const deliveryEvent = await prisma.deliveryEvent.create({
      data: {
        orderId: id,
        status,
        note: note || `Delivery status updated to ${status}`,
        data: JSON.stringify({
          status,
          note,
          updatedBy: req.user.role,
          updatedAt: new Date()
        })
      }
    });

    res.json({
      success: true,
      data: {
        order: updatedOrder,
        deliveryEvent
      }
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ success: false, message: 'Failed to update delivery status' });
  }
});

// Get delivery timeline
router.get('/:id/delivery-timeline', requireAuth, requireRole(['CUSTOMER', 'VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Build where clause based on user role
    let where: any = { id };
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'VENDOR') {
      where.items = {
        some: {
          product: {
            vendorId: req.user.vendorId
          }
        }
      };
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        deliveryEvents: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Format timeline events
    const timeline = order.deliveryEvents.map(event => ({
      id: event.id,
      status: event.status,
      note: event.note,
      timestamp: event.createdAt,
      data: event.data ? JSON.parse(event.data) : null
    }));

    res.json({
      success: true,
      data: {
        orderId: id,
        currentStatus: order.status,
        timeline
      }
    });
  } catch (error) {
    console.error('Error fetching delivery timeline:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery timeline' });
  }
});

// ==================== ADMIN ORDER MANAGEMENT ====================

// Get all orders (Admin only)
router.get('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const vendorId = req.query.vendorId as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (vendorId) {
      where.items = {
        some: {
          product: {
            vendorId
          }
        }
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    shopName: true
                  }
                }
              }
            }
          }
        },
        deliveryEvents: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { deliveryEvents: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Create delivery event if status change affects delivery
    if (['PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED'].includes(status)) {
      await prisma.deliveryEvent.create({
        data: {
          orderId: id,
          status: status === 'PROCESSING' ? 'PROCESSING' : 
                  status === 'SHIPPED' ? 'SHIPPED' : 
                  status === 'DELIVERED' ? 'DELIVERED' : 'FAILED',
          note: note || `Order status updated to ${status}`,
          data: JSON.stringify({
            status,
            note,
            updatedBy: 'ADMIN',
            updatedAt: new Date()
          })
        }
      });
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// ==================== VENDOR ORDER MANAGEMENT ====================

// Get vendor orders
router.get('/vendor/my-orders', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {
      items: {
        some: {
          product: {
            vendorId: req.user.vendorId
          }
        }
      }
    };

    if (status) where.status = status;

    const orders = await prisma.order.findMany({
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
        items: {
          where: {
            product: {
              vendorId: req.user.vendorId
            }
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        deliveryEvents: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor orders' });
  }
});

export default router;

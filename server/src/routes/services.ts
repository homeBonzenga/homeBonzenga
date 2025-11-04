import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// ==================== PUBLIC SERVICES ====================

// Get all services (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const vendorId = req.query.vendorId as string;
    const search = req.query.search as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    
    if (category) where.categoryId = category;
    if (vendorId) where.vendorId = vendorId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (minPrice !== undefined) where.price = { gte: minPrice };
    if (maxPrice !== undefined) {
      if (where.price) {
        where.price.lte = maxPrice;
      } else {
        where.price = { lte: maxPrice };
      }
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
            address: true,
            rating: true,
            totalReviews: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        addons: {
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true
              }
            }
          }
        },
        media: {
          where: { type: 'IMAGE' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.service.count({ where });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Get service details (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: { id, isActive: true },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
            description: true,
            address: true,
            phone: true,
            email: true,
            rating: true,
            totalReviews: true,
            workingHours: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        addons: {
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true
              }
            }
          }
        },
        media: {
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
});

// Get service categories (public)
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await prisma.serviceCategoryModel.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { services: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Debug endpoint to see all services
router.get('/debug/all', async (req, res) => {
  try {
    const allServices = await prisma.service.findMany({
      include: {
        vendor: {
          select: {
            shopName: true,
            status: true
          }
        }
      }
    });

    const approvedVendorServices = allServices.filter(s => s.vendor.status === 'APPROVED');

    res.json({
      success: true,
      data: {
        totalServices: allServices.length,
        approvedVendorServices: approvedVendorServices.length,
        services: allServices.map(s => ({
          name: s.name,
          isActive: s.isActive,
          vendorShop: s.vendor.shopName,
          vendorStatus: s.vendor.status
        }))
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get unique services grouped by category (public)
router.get('/unique/grouped', async (req, res) => {
  try {
    console.log('📥 Fetching services for at-home page...');
    
    // Get all active services from approved vendors with their categories
    const services = await prisma.service.findMany({
      where: { 
        isActive: true,
        vendor: {
          status: 'APPROVED'
        }
      },
      select: {
        name: true,
        description: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Found ${services.length} active services from approved vendors`);

    // Group services by their actual database category
    const categoryMap: Record<string, Set<string>> = {};

    services.forEach((service: any) => {
      const serviceName = service.name;
      
      // Get the first category assigned to this service
      if (service.categories && service.categories.length > 0) {
        const categoryName = service.categories[0].category.name;
        
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = new Set();
        }
        categoryMap[categoryName].add(serviceName);
      } else {
        // If no category assigned, put in "Other"
        if (!categoryMap['Other']) {
          categoryMap['Other'] = new Set();
        }
        categoryMap['Other'].add(serviceName);
      }
    });

    console.log('📊 Categorization results:');
    Object.entries(categoryMap).forEach(([cat, servs]) => {
      console.log(`   ${cat}: ${servs.size} unique services`);
    });

    // Convert to the format expected by frontend
    const result = Object.entries(categoryMap).map(([category, servicesSet]) => ({
      category,
      services: Array.from(servicesSet)
    }));

    console.log(`✅ Returning ${result.length} categories to frontend`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error fetching unique services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unique services' });
  }
});

// Get vendor services (public)
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const skip = (page - 1) * limit;

    const where: any = { vendorId, isActive: true };

    const services = await prisma.service.findMany({
      where,
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
        },
        addons: {
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        media: {
          where: { type: 'IMAGE' },
          take: 1
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.service.count({ where });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor services' });
  }
});

// ==================== VENDOR SERVICE MANAGEMENT ====================

// Get vendor services
router.get('/vendor/my-services', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = { vendorId: req.user.vendorId };
    if (status) where.isActive = status === 'active';

    const services = await prisma.service.findMany({
      where,
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
        },
        addons: {
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        media: {
          where: { type: 'IMAGE' },
          take: 1
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.service.count({ where });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor services' });
  }
});

// Create new service
router.post('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      categoryId,
      isActive = true,
      addons = [],
      media
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify category exists
    const category = await prisma.serviceCategoryModel.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : 60,
        isActive,
        vendorId: req.user.vendorId
      }
    });

    // Create category mapping
    await prisma.serviceCategoryMap.create({
      data: {
        serviceId: service.id,
        categoryId: categoryId
      }
    });

    // Add addons if provided
    if (addons && addons.length > 0) {
      await prisma.serviceAddon.createMany({
        data: addons.map((addonId: string) => ({
          serviceId: service.id,
          addonId
        }))
      });
    }

    // Add media if provided
    if (media && media.length > 0) {
      await prisma.media.createMany({
        data: media.map((item: any) => ({
          serviceId: service.id,
          type: item.type || 'IMAGE',
          url: item.url,
          alt: item.alt || name
        }))
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...service,
        category: {
          id: category.id,
          name: category.name
        }
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

// Update service
router.put('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      duration,
      categoryId,
      isActive,
      addons
    } = req.body;

    // Verify service belongs to vendor
    const existingService = await prisma.service.findFirst({
      where: { id, vendorId: req.user.vendorId }
    });

    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        isActive
      }
    });

    // Update category mapping if categoryId is provided
    if (categoryId) {
      // Verify category exists
      const category = await prisma.serviceCategoryModel.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category ID' });
      }

      // Remove existing category mappings
      await prisma.serviceCategoryMap.deleteMany({
        where: { serviceId: id }
      });

      // Add new category mapping
      await prisma.serviceCategoryMap.create({
        data: {
          serviceId: id,
          categoryId: categoryId
        }
      });
    }

    // Update addons if provided
    if (addons !== undefined) {
      // Remove existing addons
      await prisma.serviceAddon.deleteMany({
        where: { serviceId: id }
      });

      // Add new addons
      if (addons && addons.length > 0) {
        await prisma.serviceAddon.createMany({
          data: addons.map((addonId: string) => ({
            serviceId: id,
            addonId
          }))
        });
      }
    }

    // Get the updated service with category information
    const serviceWithCategory = await prisma.service.findUnique({
      where: { id },
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
      }
    });

    res.json({
      success: true,
      data: {
        ...updatedService,
        category: serviceWithCategory?.categories[0]?.category || null
      }
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// Delete service
router.delete('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify service belongs to vendor
    const service = await prisma.service.findFirst({
      where: { id, vendorId: req.user.vendorId }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Soft delete by setting isActive to false
    await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

// ==================== ADMIN SERVICE MANAGEMENT ====================

// Get all services (Admin only)
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    const vendorId = req.query.vendorId as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.categoryId = category;
    if (vendorId) where.vendorId = vendorId;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const services = await prisma.service.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.service.count({ where });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Update service status (Admin only)
router.patch('/admin/:id/status', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Update service status
    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: isActive ? 'SERVICE_ACTIVATED' : 'SERVICE_DEACTIVATED',
        entityType: 'SERVICE',
        entityId: id,
        userId: req.user.id,
        details: JSON.stringify({
          serviceName: service.name,
          vendorName: service.vendor.shopName,
          reason: reason || 'Admin action',
          previousStatus: !isActive,
          newStatus: isActive
        })
      }
    });

    res.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ success: false, message: 'Failed to update service status' });
  }
});

// ==================== SERVICE ADDONS ====================

// Get service addons
router.get('/:id/addons', async (req, res) => {
  try {
    const { id } = req.params;

    const addons = await prisma.serviceAddon.findMany({
      where: { serviceId: id },
      include: {
        addon: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: addons.map(item => item.addon)
    });
  } catch (error) {
    console.error('Error fetching service addons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service addons' });
  }
});

// Add addon to service
router.post('/:id/addons', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const { addonId } = req.body;

    // Verify service belongs to vendor
    const service = await prisma.service.findFirst({
      where: { id, vendorId: req.user.vendorId }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if addon already exists
    const existingAddon = await prisma.serviceAddon.findFirst({
      where: { serviceId: id, addonId }
    });

    if (existingAddon) {
      return res.status(400).json({ success: false, message: 'Addon already exists for this service' });
    }

    // Add addon to service
    const serviceAddon = await prisma.serviceAddon.create({
      data: {
        serviceId: id,
        addonId
      },
      include: {
        addon: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: serviceAddon
    });
  } catch (error) {
    console.error('Error adding addon:', error);
    res.status(500).json({ success: false, message: 'Failed to add addon' });
  }
});

// Remove addon from service
router.delete('/:id/addons/:addonId', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id, addonId } = req.params;

    // Verify service belongs to vendor
    const service = await prisma.service.findFirst({
      where: { id, vendorId: req.user.vendorId }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Remove addon from service
    await prisma.serviceAddon.delete({
      where: { serviceId: id, addonId }
    });

    res.json({
      success: true,
      message: 'Addon removed successfully'
    });
  } catch (error) {
    console.error('Error removing addon:', error);
    res.status(500).json({ success: false, message: 'Failed to remove addon' });
  }
});

// ==================== SERVICE REVIEWS ====================

// Get service reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: { serviceId: id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.review.count({ where: { serviceId: id } });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Add service review
router.post('/:id/reviews', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if customer has already reviewed this service
    const existingReview = await prisma.review.findFirst({
      where: { serviceId: id, customerId: req.user.id }
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this service' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        serviceId: id,
        customerId: req.user.id,
        rating: parseInt(rating),
        comment
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Update service rating
    const serviceReviews = await prisma.review.findMany({
      where: { serviceId: id },
      select: { rating: true }
    });

    const avgRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

    await prisma.service.update({
      where: { id },
      data: {
        rating: avgRating,
        totalReviews: serviceReviews.length
      }
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
});

export default router;
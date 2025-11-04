import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Public: Get products (minimal fields, schema-safe)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || 1));
    const limit = parseInt(String(req.query.limit || 20));
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });

    const total = await prisma.product.count({ where: { isActive: true } });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Public: Get single product (minimal fields)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Public: Product categories (placeholder to avoid schema mismatch)
router.get('/categories/all', async (_req, res) => {
  res.json({ success: true, data: [] });
});

export default router;

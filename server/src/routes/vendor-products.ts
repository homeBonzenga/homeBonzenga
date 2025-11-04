import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all products for a vendor
router.get('/:vendorId/products', authenticate, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;
    console.log(`📥 GET /api/vendor/${userId}/products - Fetching products`);

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${products.length} products`);
    res.json({ products });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new product
router.post('/:vendorId/products', authenticate, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;
    const { name, category, price, stock, sku, description } = req.body;
    console.log(`📥 POST /api/vendor/${userId}/products - Creating product`);

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        sku: sku || null,
        description: description || null,
        isActive: true,
        rating: 0,
        totalSales: 0
      }
    });

    console.log(`✅ Product created: ${product.id}`);
    res.status(201).json({ product });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product
router.put('/:vendorId/products/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, category, price, stock, sku, description, isActive } = req.body;
    console.log(`📥 PUT /api/vendor/.../products/${productId} - Updating product`);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        sku: sku || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    console.log(`✅ Product updated: ${product.id}`);
    res.json({ product });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete product
router.delete('/:vendorId/products/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`📥 DELETE /api/vendor/.../products/${productId} - Deleting product`);

    await prisma.product.delete({
      where: { id: productId }
    });

    console.log(`✅ Product deleted: ${productId}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle product status
router.patch('/:vendorId/products/:productId/toggle', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`📥 PATCH /api/vendor/.../products/${productId}/toggle - Toggling product status`);

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive }
    });

    console.log(`✅ Product status toggled: ${updatedProduct.id} - ${updatedProduct.isActive ? 'Active' : 'Inactive'}`);
    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('❌ Error toggling product status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single product
router.get('/:vendorId/products/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`📥 GET /api/vendor/.../products/${productId} - Fetching product`);

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log(`✅ Product found: ${product.id}`);
    res.json({ product });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

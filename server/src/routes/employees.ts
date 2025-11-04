import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all employees for a vendor
router.get('/:vendorId/employees', authenticate, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;
    console.log(`📥 GET /api/vendor/${userId}/employees - Fetching employees`);

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const employees = await prisma.employee.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${employees.length} employees`);
    res.json({ employees });
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new employee
router.post('/:vendorId/employees', authenticate, async (req, res) => {
  try {
    const { vendorId: userId } = req.params;
    const { name, role, email, phone, experience, specialization } = req.body;
    console.log(`📥 POST /api/vendor/${userId}/employees - Creating employee`);

    // Find the vendor record for this user
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const employee = await prisma.employee.create({
      data: {
        vendorId: vendor.id,
        name,
        role,
        email,
        phone,
        experience: parseInt(experience) || 0,
        specialization: specialization || null,
        status: 'ACTIVE',
        rating: 0,
        totalBookings: 0
      }
    });

    console.log(`✅ Employee created: ${employee.id}`);
    res.status(201).json({ employee });
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update employee
router.put('/:vendorId/employees/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, role, email, phone, experience, specialization, status } = req.body;
    console.log(`📥 PUT /api/vendor/.../employees/${employeeId} - Updating employee`);

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name,
        role,
        email,
        phone,
        experience: parseInt(experience) || 0,
        specialization: specialization || null,
        status: status || 'ACTIVE'
      }
    });

    console.log(`✅ Employee updated: ${employee.id}`);
    res.json({ employee });
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete employee
router.delete('/:vendorId/employees/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`📥 DELETE /api/vendor/.../employees/${employeeId} - Deleting employee`);

    await prisma.employee.delete({
      where: { id: employeeId }
    });

    console.log(`✅ Employee deleted: ${employeeId}`);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single employee
router.get('/:vendorId/employees/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`📥 GET /api/vendor/.../employees/${employeeId} - Fetching employee`);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log(`✅ Employee found: ${employee.id}`);
    res.json({ employee });
  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

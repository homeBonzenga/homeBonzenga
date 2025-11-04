import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminManager() {
  try {
    console.log('🌱 Seeding admin and manager users...');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const managerPasswordHash = await bcrypt.hash('manager123', 12);

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@homebonzenga.com' },
      update: {
        password: adminPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        firstName: 'System',
        lastName: 'Admin',
      },
      create: {
        email: 'admin@homebonzenga.com',
        password: adminPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        firstName: 'System',
        lastName: 'Admin',
      },
    });

    console.log('✅ Admin user created/updated:', admin.email);

    // Create or update manager user
    const manager = await prisma.user.upsert({
      where: { email: 'manager@homebonzenga.com' },
      update: {
        password: managerPasswordHash,
        role: 'MANAGER',
        status: 'ACTIVE',
        firstName: 'System',
        lastName: 'Manager',
      },
      create: {
        email: 'manager@homebonzenga.com',
        password: managerPasswordHash,
        role: 'MANAGER',
        status: 'ACTIVE',
        firstName: 'System',
        lastName: 'Manager',
      },
    });

    console.log('✅ Manager user created/updated:', manager.email);
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@homebonzenga.com / admin123');
    console.log('   Manager: manager@homebonzenga.com / manager123');
  } catch (error) {
    console.error('❌ Error seeding admin/manager users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminManager()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });


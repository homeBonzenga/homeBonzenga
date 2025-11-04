import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMissingVendors() {
  try {
    console.log('🔍 Checking for users with VENDOR role without vendor records...');

    // Find all users with VENDOR role
    const vendorUsers = await prisma.user.findMany({
      where: {
        role: 'VENDOR'
      },
      include: {
        vendor: true
      }
    });

    console.log(`📊 Found ${vendorUsers.length} users with VENDOR role`);

    // Filter users without vendor records
    const usersWithoutVendor = vendorUsers.filter(user => !user.vendor);

    if (usersWithoutVendor.length === 0) {
      console.log('✅ All vendor users have vendor records!');
      return;
    }

    console.log(`⚠️  Found ${usersWithoutVendor.length} vendor users without vendor records`);
    console.log('Creating vendor records...\n');

    // Create vendor records for users without them
    for (const user of usersWithoutVendor) {
      console.log(`Creating vendor record for ${user.email} (${user.id})`);
      
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          shopName: `${user.firstName} ${user.lastName}'s Shop`,
          description: 'Please update your shop description',
          address: '123 Main Street',
          city: 'City',
          state: 'State',
          zipCode: '00000',
          latitude: 0,
          longitude: 0,
          status: 'PENDING'
        }
      });

      console.log(`✅ Created vendor record ${vendor.id} for user ${user.email}\n`);
    }

    console.log('🎉 All done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingVendors();

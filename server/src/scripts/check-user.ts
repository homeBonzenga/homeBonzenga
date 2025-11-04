import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const userId = 'a52fca3b-bd41-459f-9693-ecc49fa6c3dc';
  
  try {
    console.log(`🔍 Checking user: ${userId}\n`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: true }
    });

    if (!user) {
      console.log('❌ User not found in database!');
      console.log('\nThis user ID came from Supabase auth, but no user record exists.');
      console.log('You need to create the user record first.');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    
    if (user.vendor) {
      console.log('\n✅ Vendor record exists:');
      console.log(`   Vendor ID: ${user.vendor.id}`);
      console.log(`   Shop Name: ${user.vendor.shopName}`);
      console.log(`   Status: ${user.vendor.status}`);
    } else {
      console.log('\n❌ No vendor record found for this user');
      console.log('   Creating vendor record now...\n');
      
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
      
      console.log('✅ Vendor record created:');
      console.log(`   Vendor ID: ${vendor.id}`);
      console.log(`   Shop Name: ${vendor.shopName}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

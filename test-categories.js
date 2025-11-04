const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCategories() {
  try {
    console.log('🧪 Testing category system...');

    // 1. Check if categories exist
    const categories = await prisma.serviceCategoryModel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    console.log(`\n📋 Available categories (${categories.length}):`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.description}`);
    });

    // 2. Check services and their categories
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        categories: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        },
        vendor: {
          select: {
            shopName: true,
            status: true
          }
        }
      }
    });

    console.log(`\n🔍 Services with categories (${services.length}):`);
    services.forEach(service => {
      const categoryNames = service.categories.map(scm => scm.category.name);
      console.log(`   - "${service.name}" by ${service.vendor.shopName} (${service.vendor.status})`);
      console.log(`     Categories: ${categoryNames.length > 0 ? categoryNames.join(', ') : 'None'}`);
    });

    // 3. Test the grouped endpoint logic
    const categoryMap = {};
    services.forEach(service => {
      if (service.categories && service.categories.length > 0) {
        const categoryName = service.categories[0].category.name;
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = new Set();
        }
        categoryMap[categoryName].add(service.name);
      } else {
        if (!categoryMap['Other']) {
          categoryMap['Other'] = new Set();
        }
        categoryMap['Other'].add(service.name);
      }
    });

    console.log(`\n📊 Grouped services by category:`);
    Object.entries(categoryMap).forEach(([category, servicesSet]) => {
      console.log(`   ${category}: ${servicesSet.size} services`);
      Array.from(servicesSet).forEach(serviceName => {
        console.log(`     - ${serviceName}`);
      });
    });

    console.log('\n✅ Category system test completed!');
  } catch (error) {
    console.error('❌ Error testing categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategories();

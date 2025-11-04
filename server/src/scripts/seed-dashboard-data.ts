import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDashboardData() {
  try {
    console.log('🌱 Seeding dashboard data...');

    // Create mock users
    const mockUsers = [
      {
        email: 'customer1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K5K' // hashed 'password123'
      },
      {
        email: 'customer2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K5K'
      },
    ];

    const createdUsers = [];
    for (const userData of mockUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
      createdUsers.push(user);
    }

    // Create mock vendors
    const mockVendors = [
      {
        userId: createdUsers[0].id,
        shopName: 'Elegant Beauty Salon',
        description: 'Premium beauty services in the heart of the city',
        status: 'APPROVED',
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      {
        userId: createdUsers[1].id,
        shopName: 'Glamour Studio',
        description: 'Modern beauty and wellness center',
        status: 'PENDING',
        latitude: 40.7589,
        longitude: -73.9851,
        address: '456 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10013'
      }
    ];

    const createdVendors = [];
    for (const vendorData of mockVendors) {
      const vendor = await prisma.vendor.upsert({
        where: { userId: vendorData.userId },
        update: vendorData,
        create: vendorData
      });
      createdVendors.push(vendor);
    }

    // Create mock services
    const mockServices = [
      {
        vendorId: createdVendors[0].id,
        name: 'Hair Cut & Style',
        description: 'Professional hair cutting and styling',
        duration: 60,
        price: 50.00
      },
      {
        vendorId: createdVendors[0].id,
        name: 'Facial Treatment',
        description: 'Deep cleansing facial treatment',
        duration: 90,
        price: 80.00
      },
      {
        vendorId: createdVendors[1].id,
        name: 'Manicure & Pedicure',
        description: 'Complete nail care service',
        duration: 120,
        price: 60.00
      },
      {
        vendorId: createdVendors[1].id,
        name: 'Makeup Application',
        description: 'Professional makeup for special occasions',
        duration: 90,
        price: 100.00
      }
    ];

    const createdServices = [];
    for (const serviceData of mockServices) {
      const service = await prisma.service.upsert({
        where: { 
          vendorId_name: {
            vendorId: serviceData.vendorId,
            name: serviceData.name
          }
        },
        update: serviceData,
        create: serviceData
      });
      createdServices.push(service);
    }

    // Create mock addresses
    const mockAddresses = [
      {
        userId: createdUsers[0].id,
        type: 'HOME',
        name: 'Home Address',
        street: '789 Oak Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        latitude: 40.7505,
        longitude: -73.9934,
        isDefault: true
      },
      {
        userId: createdUsers[1].id,
        type: 'HOME',
        name: 'Home Address',
        street: '321 Pine St',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        latitude: 40.7614,
        longitude: -73.9776,
        isDefault: true
      }
    ];

    const createdAddresses = [];
    for (const addressData of mockAddresses) {
      const address = await prisma.address.upsert({
        where: {
          userId_type_name: {
            userId: addressData.userId,
            type: addressData.type,
            name: addressData.name
          }
        },
        update: addressData,
        create: addressData
      });
      createdAddresses.push(address);
    }

    // Create mock bookings
    const mockBookings = [
      {
        customerId: createdUsers[0].id,
        vendorId: createdVendors[0].id,
        addressId: createdAddresses[0].id,
        status: 'CONFIRMED',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        scheduledTime: '14:00',
        duration: 60,
        subtotal: 50.00,
        total: 50.00
      },
      {
        customerId: createdUsers[1].id,
        vendorId: createdVendors[1].id,
        addressId: createdAddresses[1].id,
        status: 'COMPLETED',
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        scheduledTime: '10:00',
        duration: 120,
        subtotal: 60.00,
        total: 60.00
      },
      {
        customerId: createdUsers[0].id,
        vendorId: createdVendors[0].id,
        addressId: createdAddresses[0].id,
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        scheduledTime: '16:00',
        duration: 90,
        subtotal: 80.00,
        total: 80.00
      }
    ];

    const createdBookings = [];
    for (const bookingData of mockBookings) {
      const booking = await prisma.booking.create({
        data: bookingData
      });
      createdBookings.push(booking);
    }

    // Create mock booking items
    const mockBookingItems = [
      {
        bookingId: createdBookings[0].id,
        serviceId: createdServices[0].id,
        quantity: 1,
        price: 50.00
      },
      {
        bookingId: createdBookings[1].id,
        serviceId: createdServices[2].id,
        quantity: 1,
        price: 60.00
      },
      {
        bookingId: createdBookings[2].id,
        serviceId: createdServices[1].id,
        quantity: 1,
        price: 80.00
      }
    ];

    for (const itemData of mockBookingItems) {
      await prisma.bookingItem.create({
        data: itemData
      });
    }

    // Create mock payments
    const mockPayments = [
      {
        bookingId: createdBookings[0].id,
        userId: createdUsers[0].id,
        amount: 50.00,
        method: 'CARD',
        status: 'COMPLETED'
      },
      {
        bookingId: createdBookings[1].id,
        userId: createdUsers[1].id,
        amount: 60.00,
        method: 'CARD',
        status: 'COMPLETED'
      },
      {
        bookingId: createdBookings[2].id,
        userId: createdUsers[0].id,
        amount: 80.00,
        method: 'CARD',
        status: 'PENDING'
      }
    ];

    for (const paymentData of mockPayments) {
      await prisma.payment.create({
        data: paymentData
      });
    }

    console.log('✅ Dashboard data seeded successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdVendors.length} vendors`);
    console.log(`   - ${createdServices.length} services`);
    console.log(`   - ${createdAddresses.length} addresses`);
    console.log(`   - ${createdBookings.length} bookings`);
    console.log(`   - ${mockBookingItems.length} booking items`);
    console.log(`   - ${mockPayments.length} payments`);

  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDashboardData();

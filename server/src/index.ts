// Load environment variables first
require('dotenv').config();
// Load configuration
require('../config.js');

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://localhost:5173',
  'http://localhost:8081'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins in development
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', true);

app.use(express.json());

// JWT utilities
const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const secret: Secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';
  const expiresIn: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  const refreshExpiresIn: SignOptions['expiresIn'] = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as SignOptions['expiresIn'];

  const accessToken = jwt.sign(payload, secret, { expiresIn });
  const refreshToken = jwt.sign(payload, secret, { expiresIn: refreshExpiresIn });

  return { accessToken, refreshToken };
};

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

// Note: Login endpoint is now handled by authRoutes at /api/auth/login
// This provides role-based authentication with logging and rate limiting

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role: role || 'CUSTOMER',
        status: 'ACTIVE',
        password: hashedPassword
      },
      include: {
        vendor: true
      }
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    console.log(`User registered: ${user.email}`);

    res.status(201).json({
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import routes
import dashboardRoutes from './routes/dashboard';
import vendorRoutes from './routes/vendors';
import bookingRoutes from './routes/bookings';
import productsRoutes from './routes/products';
import vendorApiRoutes from './routes/vendor';
import authRoutes from './routes/auth';
import managerRoutes from './routes/manager';
import managerBookingsRoutes from './routes/manager-bookings';
import vendorBookingsRoutes from './routes/vendor-bookings';
import adminRoutes from './routes/admin';
import customerRoutes from './routes/customer';
import { verifyEmailTransport } from './lib/emailService';
// Note: services routes has TypeScript errors, adding inline endpoints below

// Use routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/vendor', vendorApiRoutes);
app.use('/api/vendor/bookings', vendorBookingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/manager/bookings', managerBookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Services endpoints (inline to avoid TypeScript errors in services.ts)
app.get('/api/services/debug/all', async (req, res) => {
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

    const approvedVendorServices = allServices.filter((s: any) => s.vendor.status === 'APPROVED');

    res.json({
      success: true,
      data: {
        totalServices: allServices.length,
        approvedVendorServices: approvedVendorServices.length,
        services: allServices.map((s: any) => ({
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

app.get('/api/services/unique/grouped', async (req, res) => {
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

// Detailed unique services (public) - includes name, description, price, duration
app.get('/api/services/unique/detailed', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        vendor: { status: 'APPROVED' }
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true
      },
      orderBy: { name: 'asc' }
    });

    const uniqueByName = new Map<string, any>();
    for (const s of services) {
      if (!uniqueByName.has(s.name)) uniqueByName.set(s.name, s);
    }

    const result = Array.from(uniqueByName.values());
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching detailed unique services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auth server running with database' });
});

// Sync Supabase user to local database
app.post('/api/auth/sync-user', async (req, res) => {
  try {
    const { id, email, firstName, lastName, phone, role } = req.body;

    console.log(`📥 Syncing user from Supabase: ${email} (${id})`);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (user) {
      console.log(`✅ User already exists in database`);
      return res.json({ user, vendor: user.vendor, synced: false });
    }

    // Create user in local database
    user = await prisma.user.create({
      data: {
        id,
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        phone: phone || null,
        role: role || 'CUSTOMER',
        status: 'ACTIVE',
        password: 'supabase-auth' // Placeholder since auth is handled by Supabase
      },
      include: {
        vendor: true
      }
    });

    console.log(`✅ User created in local database`);

    // If user is a vendor, create vendor record
    let vendor = null;
    if (user && user.role === 'VENDOR') {
      vendor = await prisma.vendor.create({
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
      console.log(`✅ Vendor record created: ${vendor.id}`);
      
      // Refresh user with vendor
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { vendor: true }
      });
    }

    res.json({ user, vendor, synced: true });
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Initialize database
async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Create database tables if they don't exist
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(`✅ Database connected successfully`);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't exit - server can still start and handle errors gracefully
  }
  
  // Verify email transport (non-blocking)
  verifyEmailTransport().catch(err => {
    console.warn('⚠️  Email service not available (non-critical):', err.message);
  });
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🌐 Also allowing all localhost origins in development`);
  console.log(`📝 Login credentials:`);
  console.log(`   Admin: admin@homebonzenga.com / admin123`);
  console.log(`   Manager: manager@homebonzenga.com / manager123`);
  console.log(`\n📍 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n💡 To test connection, visit: http://localhost:${PORT}/api/health`);
});

export default app;
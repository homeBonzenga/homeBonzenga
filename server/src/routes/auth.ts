import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVendorSignupNotificationToManagers } from '../lib/emailService';
import { rateLimitMiddleware } from '../lib/rateLimiter';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get client IP and user agent
const getClientInfo = (req: express.Request) => {
  const ip = req.ip || 
    req.socket.remoteAddress || 
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
    'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return { ip, userAgent };
};

// Helper function to log access attempt
const logAccessAttempt = async (
  userId: string | null,
  emailAttempted: string | null,
  roleAttempted: string | null,
  success: boolean,
  method: 'email_password' | 'google',
  ipAddress: string | null,
  userAgent: string | null
) => {
  try {
    await prisma.accessLog.create({
      data: {
        userId: userId || undefined,
        emailAttempted,
        roleAttempted,
        success,
        method,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log access attempt:', error);
    // Don't throw - logging failures shouldn't break auth flow
  }
};

// Generate JWT tokens
const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'access' as const,
  };

  const secret: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  const accessToken = jwt.sign(payload, secret, { expiresIn });
  const refreshToken = jwt.sign(payload, secret, { expiresIn: refreshExpiresIn });

  return { accessToken, refreshToken };
};

// Register vendor
router.post('/register-vendor', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      shopName,
      description,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: 'VENDOR'
      }
    });

    // Create vendor profile (align with schema requirements)
    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        shopName,
        description,
        address,
        city,
        state,
        zipCode,
        latitude: typeof latitude === 'number' ? latitude : 0,
        longitude: typeof longitude === 'number' ? longitude : 0,
        status: 'PENDING'
      }
    });

    // Send notification email to managers (non-blocking)
    sendVendorSignupNotificationToManagers({
      shopName,
      ownerName: `${firstName} ${lastName}`,
      email,
      phone,
      address: `${address}, ${city}, ${state} ${zipCode}`
    }).catch(err => {
      console.error('Failed to send manager notification email:', err);
      // Don't block the registration flow if email fails
    });

    res.status(201).json({
      message: 'Vendor registration successful. Your application is pending manager approval.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
        status: vendor.status
      }
    });
  } catch (error) {
    console.error('Error registering vendor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Static admin and manager credentials
const STATIC_USERS = {
  'admin@homebonzenga.com': {
    id: 'admin-static-id',
    email: 'admin@homebonzenga.com',
    firstName: 'System',
    lastName: 'Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: 'admin123', // Plain text for static comparison
  },
  'manager@homebonzenga.com': {
    id: 'manager-static-id',
    email: 'manager@homebonzenga.com',
    firstName: 'System',
    lastName: 'Manager',
    role: 'MANAGER',
    status: 'ACTIVE',
    password: 'manager123', // Plain text for static comparison
  },
};

// Login endpoint with role-based authentication
router.post('/login', rateLimitMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { ip, userAgent } = getClientInfo(req);
    const rateLimitInfo = (req as any).rateLimitInfo;

    // Validate inputs
    if (!email || !password) {
      await logAccessAttempt(
        null,
        email || null,
        null,
        false,
        'email_password',
        ip,
        userAgent
      );
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase();

    // Check static admin/manager credentials first
    const staticUser = STATIC_USERS[emailLower as keyof typeof STATIC_USERS];
    
    if (staticUser) {
      // Check if password matches static user
      if (password === staticUser.password) {
        // Success - decrement rate limit counter
        if (rateLimitInfo?.decrement) {
          rateLimitInfo.decrement();
        }

        // Generate tokens
        const tokens = generateTokens(staticUser);

        // Log successful attempt
        await logAccessAttempt(
          staticUser.id,
          emailLower,
          staticUser.role,
          true,
          'email_password',
          ip,
          userAgent
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = staticUser;

        // Determine redirect path based on role
        const redirectPath = staticUser.role === 'ADMIN' ? '/admin' : '/manager';

        return res.json({
          user: userWithoutPassword,
          ...tokens,
          redirectPath,
        });
      } else {
        // Wrong password for static user
        await logAccessAttempt(
          staticUser.id,
          emailLower,
          staticUser.role,
          false,
          'email_password',
          ip,
          userAgent
        );
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // If not a static user, check database
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    // Log attempt (before checking password to avoid timing attacks)
    if (!user) {
      await logAccessAttempt(
        null,
        emailLower,
        null,
        false,
        'email_password',
        ip,
        userAgent
      );
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if role allows email/password login
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      await logAccessAttempt(
        user.id,
        emailLower,
        user.role,
        false,
        'email_password',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Please sign in with Google' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await logAccessAttempt(
        user.id,
        emailLower,
        user.role,
        false,
        'email_password',
        ip,
        userAgent
      );
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      await logAccessAttempt(
        user.id,
        emailLower,
        user.role,
        false,
        'email_password',
        ip,
        userAgent
      );
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Success - decrement rate limit counter
    if (rateLimitInfo?.decrement) {
      rateLimitInfo.decrement();
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Log successful attempt
    await logAccessAttempt(
      user.id,
      emailLower,
      user.role,
      true,
      'email_password',
      ip,
      userAgent
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    // Determine redirect path based on role
    const redirectPath = user.role === 'ADMIN' ? '/admin' : '/manager';

    res.json({
      user: userWithoutPassword,
      ...tokens,
      redirectPath,
    });
  } catch (error) {
    console.error('Login error:', error);
    const { ip, userAgent } = getClientInfo(req);
    await logAccessAttempt(
      null,
      req.body.email || null,
      null,
      false,
      'email_password',
      ip,
      userAgent
    );
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Log Google OAuth login (called from frontend after successful OAuth)
router.post('/log-google-auth', async (req, res) => {
  try {
    const { userId, email, role, success, ipAddress, userAgent } = req.body;
    
    await logAccessAttempt(
      userId || null,
      email || null,
      role || null,
      success !== false, // Default to true if not specified
      'google',
      ipAddress || null,
      userAgent || null
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging Google auth:', error);
    // Don't fail the request if logging fails
    res.json({ success: true });
  }
});

// Register customer (user with CUSTOMER role)
router.post('/register-customer', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: 'CUSTOMER'
      }
    });

    res.status(201).json({
      message: 'Customer registration successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      profile: { role: 'CUSTOMER' }
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
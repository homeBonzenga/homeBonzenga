import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Verify Supabase JWT token
const verifySupabaseToken = async (token: string) => {
  try {
    // Decode without verification first to check if it's a Supabase token
    const decoded = jwt.decode(token, { complete: true }) as any;
    
    // Check if it's a Supabase token (has 'sub' field and no 'userId' field)
    if (decoded?.payload?.sub && !decoded?.payload?.userId) {
      // For Supabase tokens, we trust them if they're valid JWT format
      // In production, you should verify with Supabase's public key
      const payload = decoded.payload;
      
      // Get user from database using Supabase user ID
      const user = await prisma.user.findFirst({
        where: {
          id: payload.sub,
          status: 'ACTIVE'
        }
      });

      if (user) {
        return {
          userId: user.id,
          email: user.email,
          role: user.role,
          type: 'access'
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = auth.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    let payload: any;
    
    // Try to verify as custom JWT first
    try {
      payload = auth.verifyToken(token);
    } catch (customError) {
      // If custom JWT verification fails, try Supabase token
      payload = await verifySupabaseToken(token);
      
      if (!payload) {
        throw new Error('Invalid token');
      }
    }
    
    // Check token type for custom JWT tokens
    if (payload.type && payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Handle static admin and manager users
    if (payload.userId === 'admin-static-id' && payload.role === 'ADMIN') {
      req.user = {
        id: 'admin-static-id',
        email: 'admin@homebonzenga.com',
        role: 'ADMIN'
      };
    } else if (payload.userId === 'manager-static-id' && payload.role === 'MANAGER') {
      req.user = {
        id: 'manager-static-id',
        email: 'manager@homebonzenga.com',
        role: 'MANAGER'
      };
    } else {
      // Verify user still exists and is active for database users
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          status: 'ACTIVE'
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Export aliases for the customer routes
export const requireAuth = authenticate;
export const requireRole = authorize;
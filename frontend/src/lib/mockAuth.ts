// Mock authentication system for development when Supabase is not configured
import { User } from './supabaseAuth';

export interface MockAuthResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Mock users for testing
const mockUsers: Record<string, User> = {
  'manager@test.com': {
    id: 'mock-manager-1',
    email: 'manager@test.com',
    firstName: 'John',
    lastName: 'Manager',
    role: 'MANAGER',
    status: 'ACTIVE',
    phone: '+1234567890',
    name: 'John Manager'
  },
  'admin@test.com': {
    id: 'mock-admin-1',
    email: 'admin@test.com',
    firstName: 'Jane',
    lastName: 'Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+1234567891',
    name: 'Jane Admin'
  },
  'vendor@test.com': {
    id: 'mock-vendor-1',
    email: 'vendor@test.com',
    firstName: 'Bob',
    lastName: 'Vendor',
    role: 'VENDOR',
    status: 'ACTIVE',
    phone: '+1234567892',
    name: 'Bob Vendor',
    vendor: {
      id: 'vendor-1',
      shopname: 'Bob\'s Beauty Salon',
      status: 'APPROVED'
    }
  },
  'customer@test.com': {
    id: 'mock-customer-1',
    email: 'customer@test.com',
    firstName: 'Alice',
    lastName: 'Customer',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    phone: '+1234567893',
    name: 'Alice Customer'
  }
};

// Mock session storage
let currentUser: User | null = null;
let currentSession: any = null;

export class MockAuthService {
  async signIn(email: string, password: string): Promise<MockAuthResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers[email.toLowerCase()];
    if (user && password === 'password') {
      currentUser = user;
      currentSession = {
        access_token: 'mock-token',
        user: { id: user.id, email: user.email }
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('mock-user', JSON.stringify(user));
      localStorage.setItem('mock-session', JSON.stringify(currentSession));
      
      return {
        success: true,
        data: {
          user,
          session: currentSession
        }
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  async signOut(): Promise<MockAuthResult> {
    currentUser = null;
    currentSession = null;
    localStorage.removeItem('mock-user');
    localStorage.removeItem('mock-session');
    
    return { success: true };
  }

  async getCurrentUser(): Promise<MockAuthResult> {
    // Check localStorage first
    if (!currentUser) {
      const storedUser = localStorage.getItem('mock-user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    }
    
    return {
      success: true,
      data: currentUser
    };
  }

  async getCurrentSession(): Promise<MockAuthResult> {
    // Check localStorage first
    if (!currentSession) {
      const storedSession = localStorage.getItem('mock-session');
      if (storedSession) {
        currentSession = JSON.parse(storedSession);
      }
    }
    
    return {
      success: true,
      data: currentSession
    };
  }

  async signUp(data: any): Promise<MockAuthResult> {
    return {
      success: false,
      error: 'Mock signup not implemented'
    };
  }

  async signInWithGoogle(): Promise<MockAuthResult> {
    return {
      success: false,
      error: 'Mock Google signin not implemented'
    };
  }

  async updateProfile(userId: string, updates: any): Promise<MockAuthResult> {
    return {
      success: false,
      error: 'Mock profile update not implemented'
    };
  }

  async resetPassword(email: string): Promise<MockAuthResult> {
    return {
      success: false,
      error: 'Mock password reset not implemented'
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Mock auth state change listener
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
}

export const mockAuth = new MockAuthService();
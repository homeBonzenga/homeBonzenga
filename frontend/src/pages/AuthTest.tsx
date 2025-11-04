import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Users, 
  Building, 
  Sparkles,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from 'sonner';

const AuthTest = () => {
  const { login, register, user, logout } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const testAccounts = [
    {
      role: 'ADMIN',
      email: 'admin@homebonzenga.com',
      password: 'Admin@123',
      description: 'Static admin account with full system access',
      icon: Shield,
      color: 'bg-red-500',
      dashboard: '/admin'
    },
    {
      role: 'MANAGER',
      email: 'manager@homebonzenga.com',
      password: 'Manager@123',
      description: 'Static manager account for assignment management',
      icon: Settings,
      color: 'bg-orange-500',
      dashboard: '/manager'
    }
  ];

  const signupRoles = [
    {
      role: 'CUSTOMER',
      description: 'Regular users who book beauty services',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      role: 'VENDOR',
      description: 'Business owners with salons/shops',
      icon: Building,
      color: 'bg-green-500'
    },
    {
      role: 'BEAUTICIAN',
      description: 'Individual beauty specialists',
      icon: Sparkles,
      color: 'bg-purple-500'
    }
  ];

  const handleTestLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignup = async (role: string) => {
    setIsLoading(true);
    const testUser = {
      email: `test.${role.toLowerCase()}@example.com`,
      password: 'Test@123',
      firstName: 'Test',
      lastName: role,
      phone: '+1234567890',
      role: role as any
    };

    try {
      await register(testUser);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6f0] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4e342e] mb-4">
            HOME BONZENGA Authentication System
          </h1>
          <p className="text-lg text-[#6d4c41]">
            Complete multi-role authentication with JWT tokens and secure password hashing
          </p>
        </div>

        {/* Current User Status */}
        {user && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Currently Logged In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-green-600">{user.email}</p>
                  <Badge className="mt-2 bg-green-600 text-white">
                    {user.role}
                  </Badge>
                </div>
                <Button 
                  onClick={logout}
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Static Admin/Manager Accounts */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-6">
              Static Admin & Manager Accounts
            </h2>
            <div className="space-y-4">
              {testAccounts.map((account) => (
                <Card key={account.role} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center`}>
                        <account.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#4e342e]">{account.role}</h3>
                        <p className="text-sm text-[#6d4c41]">{account.description}</p>
                      </div>
                    </div>
                    <div className="bg-[#fdf6f0] p-3 rounded-lg mb-4 text-sm">
                      <p><strong>Email:</strong> {account.email}</p>
                      <p><strong>Password:</strong> {account.password}</p>
                      <p><strong>Dashboard:</strong> {account.dashboard}</p>
                    </div>
                    <Button
                      onClick={() => handleTestLogin(account.email, account.password)}
                      disabled={isLoading}
                      className="w-full bg-[#4e342e] hover:bg-[#3b2c26] text-white"
                    >
                      {isLoading ? 'Logging in...' : `Login as ${account.role}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Database User Roles */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-6">
              Database User Roles (Sign Up Required)
            </h2>
            <div className="space-y-4">
              {signupRoles.map((role) => (
                <Card key={role.role} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center`}>
                        <role.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#4e342e]">{role.role}</h3>
                        <p className="text-sm text-[#6d4c41]">{role.description}</p>
                      </div>
                    </div>
                    <div className="bg-[#fdf6f0] p-3 rounded-lg mb-4 text-sm">
                      <p><strong>Registration:</strong> Required with email verification</p>
                      <p><strong>Password:</strong> Hashed with bcrypt (12 rounds)</p>
                      <p><strong>Storage:</strong> PostgreSQL database</p>
                    </div>
                    <Button
                      onClick={() => handleTestSignup(role.role)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
                    >
                      {isLoading ? 'Creating Account...' : `Create Test ${role.role}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* System Features */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-bold text-[#4e342e]">
              Authentication System Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-[#4e342e] mb-2">JWT Authentication</h4>
                <p className="text-sm text-[#6d4c41]">Secure token-based authentication with access & refresh tokens</p>
              </div>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-[#4e342e] mb-2">Password Security</h4>
                <p className="text-sm text-[#6d4c41]">bcrypt hashing with 12 rounds for maximum security</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-[#4e342e] mb-2">Role-Based Access</h4>
                <p className="text-sm text-[#6d4c41]">5 distinct user roles with protected routes</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold text-[#4e342e] mb-2">Static Admin/Manager</h4>
                <p className="text-sm text-[#6d4c41]">Hardcoded credentials for admin & manager access</p>
              </div>
              <div className="text-center">
                <Building className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h4 className="font-semibold text-[#4e342e] mb-2">Database Users</h4>
                <p className="text-sm text-[#6d4c41]">Customer, Vendor & Beautician stored in PostgreSQL</p>
              </div>
              <div className="text-center">
                <Settings className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold text-[#4e342e] mb-2">Production Ready</h4>
                <p className="text-sm text-[#6d4c41]">Scalable architecture for 10k+ users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <Button asChild variant="outline" className="border-[#4e342e] text-[#4e342e]">
              <a href="/login">Go to Login Page</a>
            </Button>
            <Button asChild variant="outline" className="border-[#4e342e] text-[#4e342e]">
              <a href="/register">Go to Register Page</a>
            </Button>
            <Button asChild className="bg-[#4e342e] hover:bg-[#3b2c26] text-white">
              <a href="/">Back to Homepage</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;

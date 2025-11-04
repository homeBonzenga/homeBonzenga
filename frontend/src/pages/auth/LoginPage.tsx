import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, handleSignup, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle navigation after successful login
  useEffect(() => {
    if (user) {
      // Navigation is handled by AuthContext after successful login
      // No need for duplicate toast here as AuthContext already shows success message
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "MANAGER") {
        navigate("/manager");
      } else if (user.role === "VENDOR") {
        navigate("/vendor");
      } else {
        navigate("/customer");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Use Supabase auth login directly (no backend server needed)
      await login(data.email, data.password);
      // Navigation is handled by AuthContext and useEffect above
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Error handling is done in the AuthContext login function
      // No need to show error here as it's already handled
    } finally {
      setIsLoading(false);
    }
  };

const handleGoogleLogin = async () => {
  setIsLoading(true);
  try {
    await handleSignup('google');
    //await loginWithGoogle();
  } catch (error: unknown) {
    console.error('Google login error:', error);
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-[#f8d7da]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Home Bonzenga Logo"
                className="h-12 w-12 rounded-full object-cover border-2 border-[#f8d7da] shadow-md"
              />
              <span className="text-2xl font-serif font-bold text-[#4e342e]">HOME BONZENGA</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-[#6d4c41] hover:text-[#4e342e] font-medium transition-colors">
                Home
              </Link>
              <Link to="/register" className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#4e342e] mb-4">Welcome Back</h1>
          </div>

          {/* Login Form */}
          <Card className="border-0 bg-white shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#fdf6f0] to-[#f8e8e0] p-8">
              <CardTitle className="text-2xl font-serif font-bold text-[#4e342e] text-center">Sign In to Your Account</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.login.enterEmail')}
                          {...field}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.login.enterPassword')}
                            {...field}
                            className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#4e342e] to-[#6d4c41] hover:from-[#3b2c26] hover:to-[#5a3520] text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>


                  {/* Google Login Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-3 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </Form>

              <div className="mt-8 text-center">
                <p className="text-base text-[#6d4c41]">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-[#4e342e] hover:text-[#3b2c26] transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

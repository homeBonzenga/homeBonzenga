import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [status, setStatus] = useState('Processing OAuth callback...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔍 Starting OAuth callback processing...');
        setStatus('Finishing sign in...');
        
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔍 Supabase config:', { url: supabaseUrl?.substring(0, 30), hasKey: !!supabaseKey });
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
          throw new Error('Supabase not configured. Please set up your environment variables.');
        }
        
        console.log('🔍 Calling handleOAuthCallback...');
        // Use auth helper to finalize OAuth, ensure user profile exists
        const result = await supabaseAuth.handleOAuthCallback();
        console.log('🔍 Callback result:', result);
        
        if (!result.success) {
          const message = ('error' in result && result.error) ? result.error : 'Failed to complete OAuth';
          console.error('❌ Callback failed:', message);
          throw new Error(message);
        }

        if ('data' in result && result.data && result.data.session && result.data.user) {
          console.log('✅ User authenticated:', result.data.user);
          setStatus('Login successful! Redirecting...');
          toast.success("Login successful!");

          // Log successful Google OAuth attempt
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            await fetch(`${API_URL}/auth/log-google-auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: result.data.user.id,
                email: result.data.user.email,
                role: result.data.user.role,
                success: true,
                ipAddress: null, // Will be captured server-side
                userAgent: navigator.userAgent,
              }),
            }).catch(err => {
              console.warn('Failed to log Google auth (non-critical):', err);
            });
          } catch (logError) {
            console.warn('Failed to log Google auth (non-critical):', logError);
          }

          // Determine dashboard path based on role
          let dashboardPath = '/customer';
          const userRole = result.data.user.role || 'CUSTOMER';
          switch (userRole) {
            case 'ADMIN':
              dashboardPath = '/admin';
              break;
            case 'MANAGER':
              dashboardPath = '/manager';
              break;
            case 'VENDOR':
              dashboardPath = '/vendor';
              break;
            case 'CUSTOMER':
            default:
              dashboardPath = '/customer';
              break;
          }
          
          console.log('🔍 Redirecting to:', dashboardPath);
          navigate(dashboardPath, { replace: true });
        } else {
          console.error('❌ No session or user in result');
          
          // Log failed Google OAuth attempt
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            await fetch(`${API_URL}/auth/log-google-auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: null,
                email: null,
                role: null,
                success: false,
                ipAddress: null,
                userAgent: navigator.userAgent,
              }),
            }).catch(() => {});
          } catch (logError) {
            // Ignore logging errors
          }
          
          throw new Error('No active session found. Please try logging in again.');
        }
      } catch (error: any) {
        console.error('❌ OAuth callback error:', error);
        const errorMessage = error.message || 'An unexpected error occurred';
        setError(errorMessage);
        toast.error(`Login failed: ${errorMessage}`);
        
        // Wait a bit before redirecting to show the error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  const getDashboardPath = (userRole?: string) => {
    const role = userRole || user?.role;
    if (!role) return '/';
    
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'MANAGER':
        return '/manager';
      case 'VENDOR':
        return '/vendor';
      case 'CUSTOMER':
      default:
        return '/customer';
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-foreground mb-2">{status}</p>
            <p className="text-sm text-muted-foreground">Please wait while we complete your login...</p>
          </>
        ) : (
          <>
            <div className="rounded-full h-32 w-32 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-red-600 mb-2">Login Failed</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabaseAuth, User, RegisterData } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabase";
import { mockAuth } from "@/lib/mockAuth";
import { supabaseConfig } from "@/config/supabase";

interface VendorData {
  id: string;
  shopName: string;
  status: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  vendor: VendorData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  handleSignup: (provider: 'google' | 'email', email?: string, password?: string, userData?: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  redirectToDashboard: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshVendorData: () => Promise<void>;
}

export const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Choose auth service based on configuration
  const authService = supabaseConfig.isConfigured ? supabaseAuth : mockAuth;

  // Fetch vendor data for vendor users
  const fetchVendorData = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/vendor/${userId}/profile`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setVendor({
            id: data.id,
            shopName: data.shopName,
            status: data.status,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            description: data.description
          });
        }
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    }
  };

  // Sync user to local database (non-blocking, fails gracefully)
  // NOTE: This is optional and only runs if the backend server is available
  // Since we're using Supabase as the primary database, this sync is disabled by default
  const syncUserToLocalDB = async (user: User) => {
    // Skip sync by default - only enable if explicitly configured
    // This prevents unnecessary connection attempts and warnings
    // Set REACT_APP_ENABLE_LOCAL_SYNC=true in .env to enable local DB sync
    const shouldSync = process.env.REACT_APP_ENABLE_LOCAL_SYNC === 'true';
    
    if (!shouldSync) {
      // Silently skip if sync is disabled (default behavior)
      return;
    }
    
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3 second timeout
      
      const response = await fetch(`${BACKEND_URL}/api/auth/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User synced to local database:', data.synced ? 'created' : 'already exists');
      } else {
        // Only log if it's not a connection error (those are expected)
        if (response.status !== 0) {
          console.debug('Local database sync returned status:', response.status);
        }
      }
    } catch (error) {
      // Fail silently - this is non-critical since Supabase is the primary database
      // Only log to debug level to avoid console noise
      if (process.env.NODE_ENV === 'development') {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          // Connection refused - expected if backend is not running
          console.debug('Local database sync unavailable (backend server not running - this is OK if using Supabase only)');
        } else if (error.name === 'AbortError') {
          console.debug('Local database sync timed out');
        } else {
          console.debug('Local database sync error (non-critical):', error);
        }
      }
    }
  };

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 10000); // 10 second timeout
        });

        // FIRST check for valid Supabase session (for Supabase auth)
        if (supabaseConfig.isConfigured) {
          const sessionPromise = authService.getCurrentSession();
          const sessionResult = await Promise.race([sessionPromise, timeoutPromise]).catch(() => ({ success: false, data: null })) as any;

          if (sessionResult?.success && 'data' in sessionResult && sessionResult.data) {
            // Valid Supabase session exists, proceed with user fetch
            try {
              const accessToken = sessionResult.data?.access_token;
              if (accessToken) {
                localStorage.setItem('token', accessToken);
              }
            } catch (e) {
              // non-fatal
            }
            
            const userPromise = authService.getCurrentUser();
            const userResult = await Promise.race([userPromise, timeoutPromise]).catch(err => {
              console.warn('User fetch timeout or error:', err);
              return { success: true, data: null };
            }) as any;
            
            if (userResult?.success && 'data' in userResult && userResult.data) {
              const userData = userResult.data as User;
              setUser(userData);
              
              // If user is a vendor, fetch vendor data
              if (userData.role === 'VENDOR' && userData.id) {
                fetchVendorData(userData.id);
              }
              
              // Sync user to local database (don't wait for this, doesn't block login)
              syncUserToLocalDB(userData).catch(() => {
                // Error already logged in syncUserToLocalDB
              });
              
              setIsLoading(false);
              return; // Exit early if we have valid session
            }
          }
        }

        // If no valid Supabase session, check localStorage ONLY for mock auth or backend login
        // But only if we're using mock auth or if there's no Supabase configured
        if (!supabaseConfig.isConfigured) {
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
          
          if (storedUser && storedToken) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setIsLoading(false);
              
              // If user is a vendor, fetch vendor data
              if (userData.role === 'VENDOR' && userData.id) {
                fetchVendorData(userData.id).catch(() => {});
              }
              return; // Exit early if we have user from localStorage (mock auth only)
            } catch (e) {
              console.warn('Failed to parse stored user data:', e);
              localStorage.removeItem('user');
            }
          }
        } else {
          // Supabase is configured but no valid session found - clear localStorage to prevent stale data
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.warn('Error getting initial session (non-critical):', error);
        // Clear user state on error
        setUser(null);
        try { 
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } catch {}
      } finally {
        // Always clear loading state
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen to auth state changes with error handling (only for Supabase)
    let subscription: any = null;
    if (supabaseConfig.isConfigured) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // Reduce noisy logs and avoid printing sensitive tokens
          if (import.meta.env.DEV) {
            console.log('Auth state changed:', event);
          }
          
          try {
            if (event === 'SIGNED_IN' && session) {
              // store token for backend API
              try { localStorage.setItem('token', session.access_token); } catch {}
              try {
                const userResult = await authService.getCurrentUser();
                if (userResult.success && 'data' in userResult && userResult.data) {
                  setUser(userResult.data);
                  
                  // If user is a vendor, fetch vendor data
                  if (userResult.data.role === 'VENDOR' && userResult.data.id) {
                    fetchVendorData(userResult.data.id);
                  }
                  
                  // Sync user to local database on sign in (don't wait)
                  syncUserToLocalDB(userResult.data).catch(() => {
                    // Error already logged in syncUserToLocalDB
                  });
                }
              } catch (fetchError) {
                console.warn('Failed to fetch user on sign in:', fetchError);
                // Don't block sign in, but log the error
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setVendor(null);
              try { localStorage.removeItem('token'); } catch {}
            } else if (event === 'TOKEN_REFRESHED' && session) {
              // Optionally refresh user data when token is refreshed
              try { localStorage.setItem('token', session.access_token); } catch {}
              try {
                const userResult = await authService.getCurrentUser();
                if (userResult.success && 'data' in userResult && userResult.data) {
                  setUser(userResult.data);
                }
              } catch (fetchError) {
                console.warn('Failed to refresh user data:', fetchError);
                // Don't block token refresh, just log
              }
            }
          } catch (error) {
            console.warn('Error handling auth state change:', error);
            // On error, clear user state to prevent stuck loading
            if (event === 'SIGNED_OUT' || !session) {
              setUser(null);
            }
          } finally {
            // Always clear loading state
            setIsLoading(false);
          }
        }
      );
      subscription = sub;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(email, password);
      
      if (!result.success) {
        const errorMessage = 'error' in result ? result.error : "Login failed";
        // Show user-friendly error message
        if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (errorMessage.includes('Email not confirmed')) {
          toast.error('Please confirm your email address before logging in.');
        } else {
          toast.error(errorMessage);
        }
        throw new Error(errorMessage);
      }

      if ('data' in result && result.data) {
        const userData = result.data.user;
        const session = result.data.session;
        
        // Store session token for API requests
        if (session?.access_token) {
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('accessToken', session.access_token);
          if (session.refresh_token) {
            localStorage.setItem('refreshToken', session.refresh_token);
          }
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success("Login successful");
        
        // If user is a vendor, fetch vendor data (non-blocking)
        if (userData.role === 'VENDOR' && userData.id) {
          fetchVendorData(userData.id).catch(() => {
            // Non-critical, don't block login
          });
        }
        
        // Sync to local DB (non-blocking, fails gracefully)
        syncUserToLocalDB(userData).catch(() => {
          // Non-critical, don't block login
        });
        
        // Redirect to appropriate dashboard
        const dashboardPath = getDashboardPath(userData.role);
        navigate(dashboardPath, { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseAuth.signInWithGoogle();
      
      if (!result.success) {
        const errorMessage = 'error' in result ? result.error : "Google login failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Google OAuth will redirect to the callback URL
      // The actual login handling will be done in the callback
    } catch (err: any) {
      console.error('Google login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuth.signUp(data);
      
      if (!result.success) {
        const errorMessage = 'error' in result ? result.error : "Registration failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Check if email confirmation is required
      if ('data' in result && result.data) {
        if (result.data.session) {
          setUser(result.data.user);
          toast.success("Registration successful");
          const dashboardPath = getDashboardPath(result.data.user.role);
          navigate(dashboardPath);
        } else {
          toast.success("Registration successful! Please check your email to confirm your account.");
          navigate('/login');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (provider: 'google' | 'email', email?: string, password?: string, userData?: RegisterData) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        // Handle Google OAuth signup
        const result = await supabaseAuth.signInWithGoogle();
        
        if (!result.success) {
          const errorMessage = 'error' in result ? result.error : "Google signup failed";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        // Google OAuth will redirect to the callback URL
        // The actual signup handling will be done in the callback
        toast.success("Redirecting to Google...");
      } else {
        // Handle email/password signup
        if (!email || !password || !userData) {
          throw new Error("Email, password, and user data are required for email signup");
        }

        const result = await supabaseAuth.signUp(userData);
        
        if (!result.success) {
          const errorMessage = 'error' in result ? result.error : "Registration failed";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        // Check if email confirmation is required
        if ('data' in result && result.data) {
          if (result.data.session) {
            setUser(result.data.user);
            toast.success("Registration successful");
            const dashboardPath = getDashboardPath(result.data.user.role);
            navigate(dashboardPath);
          } else {
            toast.success("Registration successful! Please check your email to confirm your account.");
            navigate('/login');
          }
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // First, sign out from Supabase to clear session and cookies
      if (supabaseConfig.isConfigured) {
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (supabaseError) {
          console.warn('Supabase signOut error (non-critical):', supabaseError);
          // Continue with logout even if Supabase signOut fails
        }
      }
      
      // Also call the auth service signOut for mock auth fallback
      try {
        await authService.signOut();
      } catch (authError) {
        console.warn('Auth service signOut error (non-critical):', authError);
        // Continue with logout even if auth service signOut fails
      }

      // Clear all auth-related data from localStorage
      // Remove all possible auth-related keys
      const authKeys = ['user', 'accessToken', 'refreshToken', 'token', 'mock-user', 'mock-session'];
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors when removing items
        }
      });

      // Clear all sessionStorage items (Supabase may store session data here)
      try {
        sessionStorage.clear();
      } catch (e) {
        // Ignore errors
      }

      // Clear state
      setUser(null);
      setVendor(null);
      
      // Show success message
      toast.success("Logged out successfully");
      
      // Force a full page reload to ensure all state, cookies, and cached data is cleared
      // This is the most reliable way to ensure complete logout
      // Small delay to allow toast to display
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    } catch (err: any) {
      console.error('Logout error:', err);
      // Clear everything even if logout fails
      setUser(null);
      setVendor(null);
      
      const authKeys = ['user', 'accessToken', 'refreshToken', 'token', 'mock-user', 'mock-session'];
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors
        }
      });
      
      try {
        sessionStorage.clear();
      } catch (e) {
        // Ignore errors
      }
      
      // Show error message but still logout
      toast.error("Logout completed with warnings");
      
      // Force reload even on error to ensure clean state
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    } finally {
      // Note: setIsLoading won't execute after window.location.href, but that's fine
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      // First check localStorage for user data (from backend login)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          return;
        } catch (e) {
          console.warn('Failed to parse stored user:', e);
        }
      }
      
      // Fallback to Supabase auth service
      const userResult = await authService.getCurrentUser();
      if (userResult.success && 'data' in userResult && userResult.data) {
        setUser(userResult.data);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('Refresh token error:', err);
      // Don't clear user if stored in localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setUser(null);
      }
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    try {
      const result = await supabaseAuth.updateProfile(user.id, updates);
      
      if (!result.success) {
        const errorMessage = 'error' in result ? result.error : "Profile update failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if ('data' in result && result.data) {
        setUser(result.data);
        toast.success("Profile updated successfully");
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuth.resetPassword(email);
      
      if (!result.success) {
        const errorMessage = 'error' in result ? result.error : "Password reset failed";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      console.error('Password reset error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (userRole?: string) => {
    // Normalize role to uppercase to handle case variations
    const role = (userRole || user?.role || '').toUpperCase();
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

  const redirectToDashboard = () => {
    const dashboardPath = getDashboardPath();
    navigate(dashboardPath);
  };

  const refreshVendorData = async () => {
    if (user?.role === 'VENDOR' && user?.id) {
      await fetchVendorData(user.id);
    }
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        vendor,
        isLoading,
        login,
        loginWithGoogle,
        register,
        handleSignup,
        logout,
        refreshToken,
        redirectToDashboard,
        updateProfile,
        resetPassword,
        refreshVendorData,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = (): AuthContextType => {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    // During SSR or initial render, context might not be available yet
    // Return a safe default instead of throwing to prevent app crashes
    console.warn("useSupabaseAuth called outside SupabaseAuthProvider, returning default values");
    return {
      user: null,
      vendor: null,
      isLoading: true,
      login: async () => { throw new Error("Auth provider not available"); },
      loginWithGoogle: async () => { throw new Error("Auth provider not available"); },
      register: async () => { throw new Error("Auth provider not available"); },
      handleSignup: async () => { throw new Error("Auth provider not available"); },
      logout: async () => { throw new Error("Auth provider not available"); },
      refreshToken: async () => { throw new Error("Auth provider not available"); },
      redirectToDashboard: () => {},
      updateProfile: async () => { throw new Error("Auth provider not available"); },
      resetPassword: async () => { throw new Error("Auth provider not available"); },
      refreshVendorData: async () => {},
    };
  }
  return ctx;
};

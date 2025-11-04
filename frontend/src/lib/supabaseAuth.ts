import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase'
import { supabaseConfig } from '@/config/supabase'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER"
  status: string
  avatar?: string
  phone?: string
  vendor?: {
    id: string
    shopName: string
    shopname: string // legacy support
    description?: string
    status: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
  name?: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}

export class SupabaseAuthService {
  // Sign up new user with email and password (exact specification)
  async signUpWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase signup error:', error.message)
        throw error
      }
      
      return data
    } catch (error: any) {
      throw error
    }
  }

  // Create user profile in database
  // Uses upsert to handle race conditions where database trigger might create user simultaneously
  async createUserProfile(userId: string, userData: RegisterData) {
    try {
      // First check if user already exists (trigger might have created it)
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (existingUser) {
        // User already exists, return it
        return handleSupabaseSuccess(this.mapDatabaseUserToUser(existingUser));
      }

      // Use upsert to handle duplicate key errors gracefully
      // This will insert if not exists, or update if exists (though update is unlikely)
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: userData.role || 'CUSTOMER',
          status: 'ACTIVE',
          password: '' // We don't store password in public table, Supabase Auth handles it
        }, {
          onConflict: 'id' // Use id as conflict resolution key
        })
        .select()
        .single()

      if (error) {
        // If upsert fails, try fetching again (trigger might have created it)
        const retryResult = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (retryResult.data) {
          return handleSupabaseSuccess(this.mapDatabaseUserToUser(retryResult.data));
        }
        throw error;
      }

      return handleSupabaseSuccess(this.mapDatabaseUserToUser(data))
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Sign up new user (with additional data)
  async signUp(data: RegisterData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            role: data.role || 'CUSTOMER'
          }
        }
      })

      if (authError) {
        console.error('Supabase signup error:', authError.message)
        throw authError
      }

      // The database trigger automatically creates the user profile
      // No manual creation needed
      return handleSupabaseSuccess(authData)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      // Log the attempt for debugging (remove in production)
      if (import.meta.env.DEV) {
        console.log('🔐 Attempting login for:', email);
        console.log('🔐 Supabase URL:', supabaseConfig.url?.substring(0, 30) + '...');
        console.log('🔐 Supabase configured:', supabaseConfig.isConfigured);
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(), // Remove any whitespace
        password: password // Password as-is
      })

      if (authError) {
        // Log the full error for debugging
        console.error('❌ Supabase Auth Error:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });

        // Provide more specific error messages
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('Invalid credentials') ||
            authError.status === 400) {
          throw new Error('Invalid email or password. Please check your credentials.')
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in.')
        } else {
          throw authError
        }
      }

      if (!authData.user || !authData.session) {
        throw new Error('Failed to sign in')
      }

      // Get user profile from public.users table
      // Retry logic to handle race conditions with trigger
      let userData = null;
      let userError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase
          .from('users')
          .select(`
            *,
            vendor:vendors(id, shopname, status)
          `)
          .eq('id', authData.user.id)
          .maybeSingle();
        
        userData = result.data;
        userError = result.error;
        
        if (userData || (userError && userError.code !== 'PGRST116')) break;
        
        // Wait before retrying (trigger might still be running)
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', userError);
        throw userError;
      }

      // Get metadata once (used in multiple places)
      const metadata = authData.user.user_metadata || {};
      const rawMetadata = authData.user.raw_user_meta_data || {};

      // If profile doesn't exist, try to create it from auth metadata
      // Use upsert to handle race conditions (trigger might create user simultaneously)
      if (!userData) {
        console.warn('User profile not found, attempting to create from auth metadata...');
        
        // First, try one more time to fetch (trigger might have just created it)
        await new Promise(resolve => setTimeout(resolve, 300));
        const finalFetchResult = await supabase
          .from('users')
          .select(`
            *,
            vendor:vendors(id, shopname, status)
          `)
          .eq('id', authData.user.id)
          .maybeSingle();
        
        if (finalFetchResult.data) {
          userData = finalFetchResult.data;
          console.log('✅ User profile found after retry (created by trigger)');
        } else {
          // Only try to create if user really doesn't exist
          try {
            const upsertResult = await supabase
              .from('users')
              .upsert({
                id: authData.user.id,
                email: authData.user.email || '',
                first_name: metadata.first_name || rawMetadata.first_name || 'User',
                last_name: metadata.last_name || rawMetadata.last_name || '',
                role: (metadata.role || rawMetadata.role || 'CUSTOMER').toUpperCase(),
                status: 'ACTIVE'
              }, {
                onConflict: 'id' // Use id as conflict resolution key
              })
              .select(`
                *,
                vendor:vendors(id, shopname, status)
              `)
              .maybeSingle(); // Use maybeSingle to avoid errors if upsert fails
            
            if (upsertResult.data) {
              userData = upsertResult.data;
              console.log('✅ User profile created successfully');
            } else if (upsertResult.error) {
              // Handle 409 Conflict error - user was created by trigger
              if (upsertResult.error.code === '23505' || upsertResult.error.message?.includes('duplicate') || upsertResult.error.status === 409) {
                console.log('⚠️ User already exists (likely created by trigger), fetching...');
                // Fetch the user that was created
                const conflictFetchResult = await supabase
                  .from('users')
                  .select(`
                    *,
                    vendor:vendors(id, shopname, status)
                  `)
                  .eq('id', authData.user.id)
                  .maybeSingle();
                
                if (conflictFetchResult.data) {
                  userData = conflictFetchResult.data;
                  console.log('✅ User profile fetched after conflict');
                } else {
                  console.error('Failed to fetch user after conflict:', conflictFetchResult.error);
                }
              } else {
                console.error('Failed to create user profile:', upsertResult.error);
              }
            }
          } catch (upsertError: any) {
            // Handle any other errors during upsert
            console.error('Upsert error caught:', upsertError);
            // Try one final fetch
            const lastFetchResult = await supabase
              .from('users')
              .select(`
                *,
                vendor:vendors(id, shopname, status)
              `)
              .eq('id', authData.user.id)
              .maybeSingle();
            
            if (lastFetchResult.data) {
              userData = lastFetchResult.data;
            }
          }
        }
      }

      // If we have userData, return it
      if (userData) {
        return handleSupabaseSuccess({
          user: this.mapDatabaseUserToUser(userData),
          session: authData.session
        });
      }

      // Final fallback - return user from auth metadata if all else fails
      console.warn('⚠️ Using fallback user from auth metadata');
      const fallbackUser: User = {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName: metadata.first_name || rawMetadata.first_name || 'User',
        lastName: metadata.last_name || rawMetadata.last_name || '',
        role: (metadata.role || rawMetadata.role || 'CUSTOMER').toUpperCase() as "ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER",
        status: 'ACTIVE'
      };
      
      return handleSupabaseSuccess({
        user: fallbackUser,
        session: authData.session
      });
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      return handleSupabaseSuccess(null)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User fetch timeout')), 10000); // Increased to 10 seconds
      });
      
      const userPromise = supabase.auth.getUser();
      const { data: { user: authUser }, error: authError } = await Promise.race([userPromise, timeoutPromise]);
      
      if (authError) {
        console.warn('Auth error (not critical):', authError.message);
        // Don't throw, just return null to allow fallback to mock auth
        return handleSupabaseSuccess(null)
      }

      if (!authUser) {
        console.log('No authenticated user found');
        return handleSupabaseSuccess(null)
      }

      // Get user profile from public.users table with timeout
      try {
        const profilePromise = supabase
          .from('users')
          .select(`
            *,
            vendor:vendors(id, shopname, status)
          `)
          .eq('id', authUser.id)
          .maybeSingle();
          
        const { data: userData, error: userError } = await Promise.race([profilePromise, timeoutPromise]);

        if (userError) {
          console.warn('User profile fetch error:', userError.message);
          // Fallback: return user from auth metadata
          const metadata = authUser.user_metadata || {};
          const rawMetadata = authUser.raw_user_meta_data || {};
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: metadata.first_name || rawMetadata.first_name || 'User',
            lastName: metadata.last_name || rawMetadata.last_name || '',
            role: (metadata.role || rawMetadata.role || 'CUSTOMER').toUpperCase() as "ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER",
            status: 'ACTIVE'
          };
          return handleSupabaseSuccess(fallbackUser)
        }

        if (!userData) {
          console.log('No user data found in database');
          // Fallback: return user from auth metadata
          const metadata = authUser.user_metadata || {};
          const rawMetadata = authUser.raw_user_meta_data || {};
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: metadata.first_name || rawMetadata.first_name || 'User',
            lastName: metadata.last_name || rawMetadata.last_name || '',
            role: (metadata.role || rawMetadata.role || 'CUSTOMER').toUpperCase() as "ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER",
            status: 'ACTIVE'
          };
          return handleSupabaseSuccess(fallbackUser)
        }

        return handleSupabaseSuccess(this.mapDatabaseUserToUser(userData))
      } catch (profileError) {
        console.warn('Profile fetch failed, using fallback:', profileError);
        // Fallback: return user from auth metadata
        const fallbackUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          firstName: authUser.user_metadata?.first_name || 'User',
          lastName: authUser.user_metadata?.last_name || '',
          role: authUser.user_metadata?.role || 'CUSTOMER',
          status: 'ACTIVE'
        };
        return handleSupabaseSuccess(fallbackUser)
      }
    } catch (error: any) {
      // Log error but don't crash the app
      console.warn('getCurrentUser error (non-critical):', error.message);
      return handleSupabaseSuccess(null)
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const attemptGet = async (timeoutMs: number) => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), timeoutMs)
        })
        return Promise.race([supabase.auth.getSession(), timeoutPromise]) as Promise<any>
      }

      // Retry a few times to allow session propagation after OAuth
      const maxRetries = 5
      for (let i = 0; i < maxRetries; i++) {
        try {
          const { data: { session }, error } = await attemptGet(3000)
          if (error) {
            // If we got an SDK error, only throw on the last attempt
            if (i === maxRetries - 1) throw error
          }
          if (session) {
            return handleSupabaseSuccess(session)
          }
        } catch (e) {
          // swallow timeout during retries
          if (i === maxRetries - 1) {
            // graceful: no session yet
            return handleSupabaseSuccess(null)
          }
        }
        // wait before next try
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Fallback: no session yet
      return handleSupabaseSuccess(null)
    } catch (error: any) {
      // Be graceful; treat as no active session rather than erroring loudly
      console.warn('getCurrentSession warning:', error?.message || error)
      return handleSupabaseSuccess(null)
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          avatar: updates.avatar
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return handleSupabaseSuccess(this.mapDatabaseUserToUser(data))
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        throw error
      }

      return handleSupabaseSuccess(data)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback() {
    try {
      // Wait for session to be fully available to avoid race conditions
      const waitForSession = async (retries = 5, delayMs = 1000): Promise<NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']> | null> => {
        for (let i = 0; i < retries; i++) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) {
            // If Supabase throws here, don't immediately fail; retry a few times
            console.warn(`Session fetch attempt ${i + 1} failed:`, sessionError.message)
            await new Promise(resolve => setTimeout(resolve, delayMs))
            continue
          }
          if (sessionData.session) return sessionData.session
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
        return null
      }

      const session = await waitForSession()
      if (!session) {
        throw new Error('No active session found. Please try logging in again.')
      }

      // Get user profile from public.users table
      // Retry a few times in case the trigger is still running
      let userData = null
      let userError = null
      
      for (let attempt = 0; attempt < 5; attempt++) {
        const result = await supabase
          .from('users')
          .select(`
            *,
            vendor:vendors(id, shopname, status)
          `)
          .eq('id', session.user.id)
          .maybeSingle()
        
        userData = result.data
        userError = result.error
        
        if (userData) break
        if (userError && userError.code !== 'PGRST116') break // PGRST116 = not found, which is OK to retry
        
        // Wait before retrying (longer wait on later attempts)
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
      }

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', userError)
        throw new Error(`Failed to fetch user profile: ${userError.message}`)
      }

      if (!userData) {
        // Try to manually create the user profile as a fallback
        console.warn('User profile not found, attempting to create from auth metadata...')
        
        const authUser = session.user
        const metadata = authUser.user_metadata || {}
        
        // Extract name from Google OAuth metadata
        const firstName = metadata.given_name || metadata.first_name || 
          (metadata.name ? metadata.name.split(' ')[0] : 'User')
        const lastName = metadata.family_name || metadata.last_name || 
          (metadata.name && metadata.name.split(' ').length > 1 
            ? metadata.name.substring(firstName.length + 1) 
            : '')
        
        // Try to upsert the user profile (database trigger might have already created it)
        // Use upsert to handle race conditions gracefully
        const upsertResult = await supabase
          .from('users')
          .upsert({
            id: authUser.id,
            email: authUser.email || '',
            first_name: firstName,
            last_name: lastName,
            role: metadata.role || 'CUSTOMER',
            status: 'ACTIVE',
            avatar: metadata.picture || metadata.avatar || null
          }, {
            onConflict: 'id' // Use id as conflict resolution key
          })
          .select(`
            *,
            vendor:vendors(id, shopname, status)
          `)
          .single()
        
        if (upsertResult.error) {
          // If upsert fails, try fetching again (trigger might have created it)
          console.warn('Upsert failed, trying to fetch existing user:', upsertResult.error.message);
          const retryResult = await supabase
            .from('users')
            .select(`
              *,
              vendor:vendors(id, shopname, status)
            `)
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (retryResult.data) {
            userData = retryResult.data;
          } else {
            // If still no user, throw error
            console.error('Failed to create/fetch user profile:', upsertResult.error);
            throw new Error(
              'User profile was not created automatically. ' +
              'Please ensure the database trigger `handle_new_user()` is installed and working. ' +
              `Error: ${upsertResult.error.message}`
            );
          }
        } else {
          userData = upsertResult.data;
        }
      }

      return handleSupabaseSuccess({
        user: this.mapDatabaseUserToUser(userData),
        session
      })
    } catch (error: any) {
      console.error('OAuth callback error:', error)
      return handleSupabaseError(error)
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        throw error
      }

      return handleSupabaseSuccess(null)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return handleSupabaseSuccess(null)
    } catch (error: any) {
      return handleSupabaseError(error)
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Helper method to map database user to User interface
  private mapDatabaseUserToUser(dbUser: any): User {
    // Normalize role to uppercase to ensure consistency
    const normalizeRole = (role: string | null | undefined): "ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER" => {
      if (!role) return 'CUSTOMER';
      const upperRole = role.toUpperCase();
      if (upperRole === 'ADMIN' || upperRole === 'MANAGER' || upperRole === 'VENDOR' || upperRole === 'CUSTOMER') {
        return upperRole as "ADMIN" | "MANAGER" | "VENDOR" | "CUSTOMER";
      }
      return 'CUSTOMER'; // Default fallback
    };

    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name || dbUser.firstName,
      lastName: dbUser.last_name || dbUser.lastName,
      role: normalizeRole(dbUser.role),
      status: dbUser.status,
      avatar: dbUser.avatar,
      phone: dbUser.phone,
      vendor: dbUser.vendor ? {
        id: dbUser.vendor.id,
        shopname: dbUser.vendor.shopname,
        status: dbUser.vendor.status
      } : undefined,
      name: `${dbUser.first_name || dbUser.firstName} ${dbUser.last_name || dbUser.lastName}`
    }
  }
}

// Export singleton instance
export const supabaseAuth = new SupabaseAuthService()

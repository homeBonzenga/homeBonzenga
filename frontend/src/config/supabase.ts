// Supabase Configuration with proper error handling
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

// Get environment variables with validation
const getSupabaseConfig = (): SupabaseConfig => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isConfigured = !!(url && anonKey);
  
  if (!isConfigured) {
    console.error('🚨 Supabase Configuration Missing!');
    console.error('Please set the following environment variables:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_ANON_KEY');
    console.error('');
    console.error('Create a .env.local file in the frontend directory with:');
    console.error('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
    console.error('VITE_SUPABASE_ANON_KEY=your-anon-key');
  }
  
  return {
    url: url || '',
    anonKey: anonKey || '',
    isConfigured
  };
};

export const supabaseConfig = getSupabaseConfig();

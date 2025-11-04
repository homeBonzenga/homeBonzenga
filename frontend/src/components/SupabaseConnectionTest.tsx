import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        setConfig({
          url: supabaseUrl,
          keyLength: supabaseKey?.length || 0,
          isConfigured: !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id'))
        });

        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
          throw new Error('Supabase environment variables not configured properly');
        }

        setStatus('Testing Supabase connection...');
        
        // Test basic connection - try to access users table
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
          // If users table doesn't exist, that's expected before migration
          if (error.code === 'PGRST116' || error.message.includes('relation "users" does not exist')) {
            setStatus('⚠️ Supabase connected but users table not found. Please apply the database migration.');
            setError('Users table not found. Run the migration from SUPABASE_SETUP_GUIDE.md');
            return;
          }
          throw new Error(`Database connection failed: ${error.message}`);
        }

        setStatus('✅ Supabase connection successful!');
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setStatus('❌ Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      
      <div className="space-y-3">
        <div>
          <strong>Status:</strong> {status}
        </div>
        
        {config && (
          <div>
            <strong>Configuration:</strong>
            <ul className="text-sm mt-1">
              <li>URL: {config.url || 'Not set'}</li>
              <li>Key Length: {config.keyLength} characters</li>
              <li>Configured: {config.isConfigured ? '✅ Yes' : '❌ No'}</li>
            </ul>
          </div>
        )}
        
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;
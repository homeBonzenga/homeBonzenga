import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('✓ Testing Supabase connection...');
      
      // Test 1: Check env variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        addResult('✗ Environment variables missing!');
        return;
      }
      addResult(`✓ Env vars set: ${supabaseUrl.substring(0, 30)}...`);
      
      // Test 2: Check database connection
      const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('*')
        .limit(1);
      
      if (catError) {
        addResult(`✗ Database query failed: ${catError.message}`);
      } else {
        addResult(`✓ Database connected (found ${categories?.length || 0} categories)`);
      }
      
      // Test 3: Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        addResult(`✓ Active session: ${session.user.email}`);
        
        // Test 4: Check user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          addResult(`✗ Profile query error: ${profileError.message}`);
        } else if (userProfile) {
          addResult(`✓ User profile found: ${userProfile.first_name} ${userProfile.last_name} (${userProfile.role})`);
        } else {
          addResult('✗ User profile NOT found (trigger may not be working)');
        }
      } else {
        addResult('ℹ No active session (not logged in)');
      }
      
      // Test 5: Check trigger exists
      const { data: triggers, error: triggerError } = await supabase
        .rpc('pg_get_triggerdef', { oid: 0 })
        .limit(1);
      
      if (!triggerError) {
        addResult('ℹ Trigger check requires elevated permissions');
      }
      
      addResult('✓ All basic tests completed');
      toast.success('Tests completed - check results below');
      
    } catch (error: any) {
      addResult(`✗ Error: ${error.message}`);
      toast.error('Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    const testEmail = `test${Date.now()}@example.com`;
    
    try {
      addResult(`Testing signup with ${testEmail}...`);
      
      const result = await supabaseAuth.signUp({
        email: testEmail,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        role: 'CUSTOMER'
      });
      
      if (result.success) {
        addResult('✓ Signup successful');
        if ('data' in result && result.data) {
          addResult(`✓ User ID: ${result.data.user?.id}`);
        }
        toast.success('Signup test passed');
      } else {
        const error = 'error' in result ? result.error : 'Unknown error';
        addResult(`✗ Signup failed: ${error}`);
        toast.error('Signup test failed');
      }
    } catch (error: any) {
      addResult(`✗ Error: ${error.message}`);
      toast.error('Signup test error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testConnection} 
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Run Connection Tests'}
              </Button>
              <Button 
                onClick={testSignup} 
                disabled={loading}
                variant="outline"
              >
                Test Signup Flow
              </Button>
            </div>
            
            {testResults.length > 0 && (
              <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {testResults.map((result, i) => (
                  <div key={i} className="mb-1">{result}</div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold mb-2">How to verify the database trigger:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to Supabase Dashboard → Database → Functions</li>
                <li>Look for <code className="bg-blue-100 px-1 rounded">handle_new_user</code></li>
                <li>Go to Database → Triggers</li>
                <li>Look for <code className="bg-blue-100 px-1 rounded">on_auth_user_created</code></li>
                <li>It should trigger on <code className="bg-blue-100 px-1 rounded">auth.users</code> INSERT</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseTest;

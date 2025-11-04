import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const OAuthTest = () => {
  const [testResult, setTestResult] = useState<string>('');

  const testConfiguration = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    let result = 'Configuration Test Results:\n\n';
    
    // Test 1: Environment Variables
    result += '1. Environment Variables:\n';
    result += `   URL: ${supabaseUrl || 'NOT SET'}\n`;
    result += `   Key Length: ${supabaseKey?.length || 0} characters\n`;
    result += `   Is Configured: ${supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id') ? '✅ YES' : '❌ NO'}\n\n`;
    
    // Test 2: Supabase Client
    result += '2. Supabase Client:\n';
    result += `   Client Created: ${supabase ? '✅ YES' : '❌ NO'}\n`;
    result += `   Auth Available: ${supabase?.auth ? '✅ YES' : '❌ NO'}\n\n`;
    
    // Test 3: OAuth URL Generation
    result += '3. OAuth URL Test:\n';
    try {
      const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3003%2Fauth%2Fcallback`;
      result += `   Generated URL: ${oauthUrl}\n`;
      result += `   Contains Placeholder: ${oauthUrl.includes('your-project-id') ? '❌ YES' : '✅ NO'}\n`;
    } catch (error) {
      result += `   Error: ${error}\n`;
    }
    
    setTestResult(result);
  };

  const testOAuthFlow = async () => {
    try {
      setTestResult('Testing OAuth flow...\n\n');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3003/auth/callback'
        }
      });
      
      if (error) {
        setTestResult(prev => prev + `OAuth Error: ${error.message}\n`);
      } else {
        setTestResult(prev => prev + 'OAuth initiated successfully!\n');
        setTestResult(prev => prev + 'You should be redirected to Google...\n');
      }
    } catch (error: any) {
      setTestResult(prev => prev + `Test Error: ${error.message}\n`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">OAuth Configuration Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testConfiguration}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Configuration
          </button>
          
          <button
            onClick={testOAuthFlow}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test OAuth Flow
          </button>
        </div>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {testResult}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">Quick Checklist:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>✅ .env file exists in frontend directory</li>
          <li>✅ VITE_SUPABASE_URL has real project ID (not "your-project-id")</li>
          <li>✅ VITE_SUPABASE_ANON_KEY has real key (not "your-anon-key")</li>
          <li>✅ Supabase redirect URL set to: http://localhost:3003/auth/callback</li>
          <li>✅ Google OAuth provider enabled in Supabase</li>
          <li>✅ Dev server restarted after .env changes</li>
        </ul>
      </div>
    </div>
  );
};

export default OAuthTest;

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseConfig } from '@/config/supabase';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

const SupabaseConfigStatus: React.FC = () => {
  if (supabaseConfig.isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Supabase is properly configured and ready to use.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Supabase Configuration Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          To use Supabase features, you need to configure your environment variables.
        </p>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-orange-800">Steps to fix:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
            <li>Create a <code className="bg-orange-100 px-1 rounded">.env.local</code> file in the frontend directory</li>
            <li>Add your Supabase credentials:</li>
          </ol>
          
          <div className="bg-orange-100 p-3 rounded-md font-mono text-xs">
            <div>VITE_SUPABASE_URL=https://your-project-id.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
          </div>
          
          <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700" start={3}>
            <li>Restart your development server</li>
            <li>Get your credentials from your Supabase dashboard</li>
          </ol>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Supabase Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://supabase.com/docs/guides/getting-started/tutorials/with-react', '_blank')}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Setup Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConfigStatus;

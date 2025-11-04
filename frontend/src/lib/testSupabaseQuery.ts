// Test script to debug Supabase query issues
// Run this in browser console: import('./lib/testSupabaseQuery').then(m => m.testQuery())

import { supabase } from './supabase';

export async function testQuery() {
  console.log('🧪 Testing Supabase query...');
  
  try {
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }
    
    console.log('✅ Auth user:', user.email, user.id);
    
    // Test 1: Simple query without join
    console.log('\n📝 Test 1: Simple query (no join)');
    const { data: userData1, error: error1 } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    console.log('Result:', userData1);
    console.log('Error:', error1);
    
    // Test 2: Query with vendor join
    console.log('\n📝 Test 2: Query with vendor join');
    const { data: userData2, error: error2 } = await supabase
      .from('users')
      .select(`
        *,
        vendor:vendors(id, shopname, status)
      `)
      .eq('id', user.id)
      .maybeSingle();
    
    console.log('Result:', userData2);
    console.log('Error:', error2);
    
    console.log('\n✅ Tests complete!');
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseQuery = testQuery;
  console.log('💡 Run testSupabaseQuery() in console to test queries');
}

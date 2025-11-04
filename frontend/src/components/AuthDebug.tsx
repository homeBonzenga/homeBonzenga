import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const AuthDebug: React.FC = () => {
  const { user, isLoading } = useSupabaseAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug:</strong></div>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>User: {user ? `${user.firstName} (${user.role})` : 'null'}</div>
      <div>User ID: {user?.id || 'null'}</div>
      <div>localStorage: {localStorage.getItem('user') ? 'exists' : 'empty'}</div>
    </div>
  );
};

export default AuthDebug;




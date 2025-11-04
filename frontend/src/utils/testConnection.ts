// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Backend connection test:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Test if backend is reachable
export const isBackendReachable = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Even if we get a 401 (unauthorized), the server is reachable
    return response.status !== 0;
  } catch (error) {
    console.error('Backend not reachable:', error);
    return false;
  }
};

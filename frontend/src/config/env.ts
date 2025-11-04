// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string = '') => {
  return `${config.apiUrl}${endpoint}`;
};

// Helper function to check if we're in development
export const isDev = () => config.isDevelopment;

// Helper function to check if we're in production
export const isProd = () => config.isProduction;

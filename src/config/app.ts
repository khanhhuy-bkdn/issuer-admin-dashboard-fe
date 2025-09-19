// Environment type
export type Environment = 'dev' | 'test' | 'prod';

// Get environment from env vars
export const getCurrentEnv = (): Environment => {
  const env = process.env.NEXT_PUBLIC_ENV as Environment;
  if (!env || !['dev', 'test', 'prod'].includes(env)) {
    console.warn('Invalid or missing NEXT_PUBLIC_ENV, defaulting to "test"');
    return 'test';
  }
  return env;
};

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1/',
  endpoints: {
    issuers: 'issuer',
  }
};

// Contract Configuration
export const CONTRACT_CONFIG = {
  dev: {
    issuerRegistry: (process.env.NEXT_PUBLIC_DEV_ISSUER_REGISTRY || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`,
    chainId: parseInt(process.env.NEXT_PUBLIC_DEV_CHAIN_ID || '31337')
  },
  test: {
    issuerRegistry: (process.env.NEXT_PUBLIC_TEST_ISSUER_REGISTRY || '0x46B53a66D5bF97734DF5c41603557f30AB8Aa612') as `0x${string}`,
    chainId: parseInt(process.env.NEXT_PUBLIC_TEST_CHAIN_ID || '7080969')
  },
  prod: {
    issuerRegistry: (process.env.NEXT_PUBLIC_PROD_ISSUER_REGISTRY || '0x1234567890123456789012345678901234567890') as `0x${string}`,
    chainId: parseInt(process.env.NEXT_PUBLIC_PROD_CHAIN_ID || '42161')
  }
};

// Current environment and contract
export const CURRENT_ENV = getCurrentEnv();
export const CURRENT_CONTRACT = CONTRACT_CONFIG[CURRENT_ENV];

// Admin role hash
export const ADMIN_ROLE = (process.env.NEXT_PUBLIC_ADMIN_ROLE || '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`;

// App Configuration
export const APP_CONFIG = {
  environment: CURRENT_ENV,
  api: API_CONFIG,
  contract: CURRENT_CONTRACT,
  adminRole: ADMIN_ROLE,

  // Feature flags based on environment
  features: {
    debugMode: CURRENT_ENV === 'dev',
    analytics: CURRENT_ENV === 'prod',
    testMode: CURRENT_ENV === 'test'
  }
};

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

export const isProduction = (): boolean => CURRENT_ENV === 'prod';
export const isDevelopment = (): boolean => CURRENT_ENV === 'dev';
export const isTest = (): boolean => CURRENT_ENV === 'test';

// Export for backward compatibility
export const CONTRACT_ADDRESSES = CONTRACT_CONFIG;

// Validation function
export const validateConfig = (): boolean => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_ENV',
    'NEXT_PUBLIC_API_BASE_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }

  return true;
};

// Initialize config validation
if (typeof window === 'undefined') {
  // Only validate on server side to avoid hydration issues
  validateConfig();
}
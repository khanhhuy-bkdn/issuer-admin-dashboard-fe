export const CONTRACT_ADDRESSES = {
  // Development network (localhost)
  dev: {
    issuerRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
    chainId: 31337
  },
  // Testnet (Humanity Testnet)
  test: {
    issuerRegistry: '0x46B53a66D5bF97734DF5c41603557f30AB8Aa612' as `0x${string}`,
    chainId: 7080969
  },
  // Production (Arbitrum One)
  prod: {
    issuerRegistry: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    chainId: 42161
  }
};

// Current environment
export const CURRENT_ENV = 'test' as keyof typeof CONTRACT_ADDRESSES;

export const CURRENT_CONTRACT = CONTRACT_ADDRESSES[CURRENT_ENV];

// Admin role hash (DEFAULT_ADMIN_ROLE = 0x00)
export const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
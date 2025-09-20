import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, humanity } from 'wagmi/chains';
import { defineChain } from 'viem';
import { CURRENT_ENV, CONTRACT_CONFIG } from './app';
import type { Chain } from 'viem';

// Define Humanity Testnet chain
const humanityTestnet = defineChain({
  id: CONTRACT_CONFIG.test.chainId,
  name: 'Humanity Testnet',
  network: 'humanity-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Humanity',
    symbol: 'HMT',
  },
  rpcUrls: {
    default: {
      http: ['https://humanity-testnet.g.alchemy.com/public'],
    },
    public: {
      http: ['https://humanity-testnet.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.humanity.org' },
  },
});

// Define chains based on environment
const getChains = (): readonly [Chain, ...Chain[]] => {
  switch (CURRENT_ENV) {
    case 'prod':
      return [humanity] as const;
    case 'test':
      return [humanityTestnet] as const;
    case 'dev':
    default:
      return [hardhat, humanityTestnet] as const; // Include testnet for dev
  }
};

export const config = getDefaultConfig({
  appName: 'Admin Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: getChains(),
  ssr: true,
});

export const supportedChains = getChains();
export { getChains };
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem']
};

export default nextConfig;

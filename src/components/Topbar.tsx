'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Topbar() {
  const { address, isConnected } = useAccount();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
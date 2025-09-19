'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CURRENT_CONTRACT, ADMIN_ROLE } from '@/config/contracts';
import { supportedChains } from '@/config/wagmi';
import IssuerRegistryABI from '@/contracts/IssuerRegistry.json';

export interface AdminGuardState {
  isConnected: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  address?: string;
  error?: string;
}

export interface AdminGuardActions {
  checkAdminRole: () => void;
}

export function useAdminGuard(): AdminGuardState & AdminGuardActions {
  const { address, isConnected, chain } = useAccount();

  // Check if user has admin role
  const { data: hasAdminRole, isLoading, error } = useReadContract({
    address: CURRENT_CONTRACT.issuerRegistry,
    abi: IssuerRegistryABI.abi,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, address],
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Check if user has owner role
  const { data: ownerAddress, isLoading: isOwnerLoading, error: ownerError } = useReadContract({
    address: CURRENT_CONTRACT.issuerRegistry,
    abi: IssuerRegistryABI.abi,
    functionName: 'owner',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Check if on correct network
  const isCorrectNetwork = chain && supportedChains.some(c => c.id === chain.id);

  const checkAdminRole = () => {
    // This function can be used to manually trigger a recheck if needed
    // The useReadContract hook will automatically refetch when dependencies change
  };

  console.log("address", address?.toString())

  // Check if user is admin (either has admin role or is the owner matching ADMIN_WALLET)
  const isOwner = address?.toLowerCase() === ownerAddress?.toString().toLowerCase();
  const isAdminUser = hasAdminRole || isOwner;

  return {
    isConnected,
    isAdmin: Boolean(isAdminUser && isCorrectNetwork),
    isLoading: isLoading || isOwnerLoading,
    address,
    error: error?.message || ownerError?.message || (!isCorrectNetwork && isConnected ? 'Please switch to the correct network' : undefined),
    checkAdminRole,
  };
}
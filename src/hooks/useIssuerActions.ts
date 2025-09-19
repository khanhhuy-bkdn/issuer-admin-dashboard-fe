'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CURRENT_CONTRACT, ADMIN_ROLE } from '@/config/app';
import IssuerRegistryContract from '@/contracts/IssuerRegistry.json';
const { abi: IssuerRegistryABI } = IssuerRegistryContract;
import { IssuerActionState, IssuerAction } from '@/types/issuer';
import { logError } from '@/utils/errorHandling';
import { toast } from 'react-hot-toast';

export function useIssuerActions() {
  const { address, isConnected } = useAccount();
  const [actionState, setActionState] = useState<IssuerActionState>({
    isLoading: false,
    error: null,
  });
  const [currentAction, setCurrentAction] = useState<IssuerAction>(null);

  // Contract write hook
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check admin role
  const { data: isAdmin } = useReadContract({
    address: CURRENT_CONTRACT.issuerRegistry,
    abi: IssuerRegistryABI,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, address],
    query: {
      enabled: !!address && isConnected,
    },
  });

  const canPerformActions = isConnected && isAdmin;

  const approveIssuer = async (issuerAddress: string, approveFixedFee: boolean) => {
    if (!canPerformActions) {
      console.error('Access Denied: You need admin rights to approve issuers');
      toast.error('Access Denied: You need admin rights to approve issuers');
      return;
    }

    let toastId: string | undefined;

    try {
      setCurrentAction('approve');
      setActionState({ isLoading: true, error: null });

      toastId = toast.loading('Approving issuer...');
      console.log('Approving issuer:', issuerAddress);

      await writeContract({
        address: CURRENT_CONTRACT.issuerRegistry,
        abi: IssuerRegistryABI,
        functionName: 'approveIssuer',
        args: [issuerAddress as `0x${string}`, approveFixedFee],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Issuer approval failed:', error);
      logError(error, 'Issuer approval');
      if (toastId) {
        toast.error('Issuer approval failed', { id: toastId });
      }
      setActionState({ isLoading: false, error: 'Failed to approve issuer' });
      setCurrentAction(null);
    }
  };

  const rejectIssuer = async (issuerAddress: `0x${string}`) => {
    if (!canPerformActions) {
      console.error('Access Denied: You need admin rights to reject issuers');
      toast.error('Access Denied: You need admin rights to reject issuers');
      return;
    }

    let toastId: string | undefined;

    try {
      setCurrentAction('reject');
      setActionState({ isLoading: true, error: null });

      toastId = toast.loading('Rejecting issue...');
      console.log('Rejecting issuer:', issuerAddress);

      await writeContract({
        address: CURRENT_CONTRACT.issuerRegistry,
        abi: IssuerRegistryABI,
        functionName: 'rejectIssuer',
        args: [issuerAddress],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Issuer rejection failed:', error);
      logError(error, 'Issuer rejection');
      if (toastId) {
        toast.error('Issuer rejection failed', { id: toastId });
      }
      setActionState({ isLoading: false, error: 'Failed to reject issuer' });
      setCurrentAction(null);
    }
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && currentAction && hash) {
      const actionText = currentAction === 'approve' ? 'approve' : currentAction === 'reject' ? 'reject' : 'revoke';
      const successMessage = `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} issuer successfully!`;
      
      console.log(`Issuer ${actionText} confirmed. Transaction hash:`, hash);
      toast.success(successMessage);
      toast.success(`Transaction Hash: ${hash}`, {
        duration: 8000,
        style: {
          fontSize: '12px',
          wordBreak: 'break-all'
        }
      });
      
      setActionState({ isLoading: false, error: null, txHash: hash });
      setCurrentAction(null);
    }
  }, [isConfirmed, currentAction, hash]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError && currentAction) {
      const actionText = currentAction === 'approve' ? 'approve' : currentAction === 'reject' ? 'reject' : 'revoke';
      const errorMessage = `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} issuer failed!`;
      
      console.error(`Issuer ${actionText} failed:`, writeError);
      logError(writeError, `Issuer ${actionText}`);
      toast.error(errorMessage);
      
      setActionState({ isLoading: false, error: 'Transaction failed' });
      setCurrentAction(null);
    }
  }, [writeError, currentAction]);

  const isLoading = isPending || isConfirming || actionState.isLoading;

  const revokeIssuer = async (issuerAddress: `0x${string}`) => {
    if (!canPerformActions) {
      console.error('Access Denied: You need admin rights to revoke issuers');
      toast.error('Access Denied: You need admin rights to revoke issuers');
      return;
    }

    let toastId: string | undefined;

    try {
      setCurrentAction('revoke');
      setActionState({ isLoading: true, error: null });

      toastId = toast.loading('Revoking issuer...');
      console.log('Revoking issuer:', issuerAddress);

      await writeContract({
        address: CURRENT_CONTRACT.issuerRegistry,
        abi: IssuerRegistryABI,
        functionName: 'revokeIssuer',
        args: [issuerAddress],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Issuer revocation failed:', error);
      logError(error, 'Issuer revocation');
      if (toastId) {
        toast.error('Issuer revocation failed', { id: toastId });
      }
      setActionState({ isLoading: false, error: 'Failed to revoke issuer' });
      setCurrentAction(null);
    }
  };

  return {
    approveIssuer,
    rejectIssuer,
    revokeIssuer,
    isLoading,
    error: actionState.error,
    canPerformActions,
    isAdmin,
    currentAction,
    txHash: actionState.txHash,
  };
}
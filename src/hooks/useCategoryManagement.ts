'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CURRENT_CONTRACT } from '@/config/contracts';
import IssuerRegistryABI from '@/contracts/IssuerRegistry.json';
import { useCategoryData } from './useCategoryData';
import { toast } from 'react-hot-toast';
import { logError } from '@/utils/errorHandling';

export interface CategoryInfo {
    name: string;
    minimumStake: string;
    baseFee: string;
    isActive: boolean;
}

export interface CategoryWithHash extends CategoryInfo {
    hash: string;
}

export function useCategoryManagement() {
    const { address } = useAccount();
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [currentAction, setCurrentAction] = useState<string | null>(null);

    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Get all category hashes
    const { data: categoryHashes, refetch: refetchHashes, error: contractError, isLoading: isContractLoading } = useReadContract({
        address: CURRENT_CONTRACT.issuerRegistry as `0x${string}`,
        abi: IssuerRegistryABI.abi,
        functionName: 'getAllCategories',
        query: {
            enabled: true, // Always enabled since it's a view function
        }
    });

    // Use useCategoryData to get category details from blockchain
    const { categoriesMap, isLoading: isCategoryDataLoading, error, refetch: refetchCategoryData } = useCategoryData(
        (categoryHashes as string[]) || []
    );

    // Transform categories data
    const categories = useMemo<CategoryWithHash[]>(() => {
        if (!categoryHashes || !Array.isArray(categoryHashes)) {
            return [];
        }

        const result = (categoryHashes as string[]).map((hash) => {
            const categoryData = categoriesMap[hash];
            if (!categoryData) {
                return {
                    hash,
                    name: 'Loading...',
                    minimumStake: '0',
                    baseFee: '0',
                    isActive: false
                };
            }

            return {
                hash,
                name: categoryData.name,
                minimumStake: formatEther(categoryData.minimumStake),
                baseFee: formatEther(categoryData.baseFee),
                isActive: categoryData.active
            };
        });

        console.log('Final categories result:', result);
        return result;
    }, [categoryHashes, categoriesMap, isCategoryDataLoading, error]);

    const isLoading = isCategoryDataLoading;

    // Update last refresh when data changes
    useEffect(() => {
        if (!isLoading && categories.length > 0) {
            setLastRefresh(new Date());
        }
    }, [isLoading, categories.length]);

    // Handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && currentAction && hash) {
            const actionText = currentAction === 'add' ? 'added' : currentAction === 'update' ? 'updated' : 'removed';
            const successMessage = `Category ${actionText} successfully!`;

            console.log(`Category ${actionText} confirmed. Transaction hash:`, hash);
            toast.success(successMessage);
            toast.success(`Transaction Hash: ${hash}`, {
                duration: 8000,
                style: {
                    fontSize: '12px',
                    wordBreak: 'break-all'
                }
            });

            // Refresh data after successful transaction
            const refreshData = async () => {
                await refetchHashes();
                if (refetchCategoryData) {
                    await refetchCategoryData();
                }
            };
            refreshData();
            setCurrentAction(null);
        }
    }, [isConfirmed, currentAction, hash, refetchHashes, refetchCategoryData]);

    // Handle transaction errors
    useEffect(() => {
        if (writeError && currentAction) {
            const actionText = currentAction === 'add' ? 'add' : currentAction === 'update' ? 'update' : 'remove';
            const errorMessage = `Failed to ${actionText} category!`;

            console.error(`Category ${actionText} failed:`, writeError);
            logError(writeError, `Category ${actionText}`);
            toast.error(errorMessage);

            setCurrentAction(null);
        }
    }, [writeError, currentAction]);

    // Add category
    const addCategory = useCallback(async (name: string, minimumStake: string, baseFee: string) => {
        if (!address) {
            console.error('Wallet not connected');
            toast.error('Please connect your wallet to perform this action');
            return;
        }

        // Validation checks
        if (!name.trim()) {
            toast.error('Category name cannot be empty');
            return;
        }

        if (parseFloat(minimumStake) < 0) {
            toast.error('Minimum stake must be greater than or equal to 0');
            return;
        }

        if (parseFloat(baseFee) < 0) {
            toast.error('Base fee must be greater than or equal to 0');
            return;
        }

        let toastId: string | undefined;

        try {
            setCurrentAction('add');
            toastId = toast.loading('Adding category...');
            console.log('Adding category:', name);

            await writeContract({
                address: CURRENT_CONTRACT.issuerRegistry as `0x${string}`,
                abi: IssuerRegistryABI.abi,
                functionName: 'addCategory',
                args: [name, parseEther(minimumStake), parseEther(baseFee)],
            });
        } catch (err: unknown) {
            console.error('Error adding category:', err);
            logError(err, 'Add category');
            if (toastId) {
                toast.error('Failed to add category', { id: toastId });
            }
            setCurrentAction(null);
            throw err;
        }
    }, [address, writeContract]);

    // Update category
    const updateCategory = useCallback(async (categoryName: string, minimumStake: string, baseFee: string) => {
        if (!address) {
            console.error('Wallet not connected');
            toast.error('Please connect your wallet to perform this action');
            return;
        }

        // Validation checks
        if (!categoryName.trim()) {
            toast.error('Category name cannot be empty');
            return;
        }

        if (parseFloat(minimumStake) < 0) {
            toast.error('Minimum stake must be greater than or equal to 0');
            return;
        }

        if (parseFloat(baseFee) < 0) {
            toast.error('Base fee must be greater than or equal to 0');
            return;
        }

        let toastId: string | undefined;

        try {
            setCurrentAction('update');
            toastId = toast.loading('Updating category...');
            console.log('Updating category:', categoryName);

            await writeContract({
                address: CURRENT_CONTRACT.issuerRegistry as `0x${string}`,
                abi: IssuerRegistryABI.abi,
                functionName: 'updateCategory',
                args: [categoryName, parseEther(minimumStake), parseEther(baseFee)],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error updating category:', err);
            logError(err, 'Update category');
            if (toastId) {
                toast.error('Failed to update category', { id: toastId });
            }
            setCurrentAction(null);
            throw err;
        }
    }, [address, writeContract]);

    // Remove category
    const removeCategory = useCallback(async (categoryHash: string) => {
        if (!address) {
            console.error('Wallet not connected');
            toast.error('Please connect your wallet to perform this action');
            return;
        }

        // Validation checks
        if (!categoryHash.trim()) {
            toast.error('Invalid category hash');
            return;
        }

        let toastId: string | undefined;

        try {
            setCurrentAction('remove');
            toastId = toast.loading('Removing category...');
            console.log('Removing category:', categoryHash);

            await writeContract({
                address: CURRENT_CONTRACT.issuerRegistry as `0x${string}`,
                abi: IssuerRegistryABI.abi,
                functionName: 'removeCategory',
                args: [categoryHash],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error removing category:', err);
            logError(err, 'Remove category');
            if (toastId) {
                toast.error('Failed to remove category', { id: toastId });
            }
            setCurrentAction(null);
            throw err;
        }
    }, [address, writeContract]);

    // Manual refresh
    const refresh = useCallback(async () => {
        await refetchHashes();
        if (refetchCategoryData) {
            await refetchCategoryData();
        }
        setLastRefresh(new Date());
    }, [refetchHashes, refetchCategoryData]);

    return {
        categories,
        isLoading,
        error,
        lastRefresh,
        isActionLoading: isWritePending || isConfirming,
        txHash: hash,
        addCategory,
        updateCategory,
        removeCategory,
        refresh
    };
}
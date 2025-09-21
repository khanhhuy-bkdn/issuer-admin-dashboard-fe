'use client';

import { useReadContracts } from 'wagmi';
import type { Abi } from 'viem';
import { CURRENT_CONTRACT } from '@/config/app';
import IssuerRegistryABI from '@/contracts/IssuerRegistry.json';
import { useMemo } from 'react';

interface Category {
  name: string;
  minimumStake: bigint;
  baseFee: bigint;
  active: boolean;
}

export function useCategoryData(categoryHashes: string[]) {
  const uniqueHashes = useMemo(
    () => Array.from(new Set(categoryHashes.filter(Boolean))),
    [categoryHashes]
  );

  const { data, isLoading, error } = useReadContracts({
    contracts: uniqueHashes.map((hash) => ({
      address: CURRENT_CONTRACT.issuerRegistry as `0x${string}`,
      abi: IssuerRegistryABI.abi as Abi,
      functionName: 'categories',
      args: [hash],
    })),
  });

  const categoriesMap = useMemo<Record<string, Category>>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map: Record<string, Category> = {};
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((item: any, idx: number) => {
        const result = item?.result as readonly [string, bigint, bigint, boolean] | undefined;
        if (result) {
          map[uniqueHashes[idx]] = {
            name: result[0],
            minimumStake: result[1],
            baseFee: result[2],
            active: result[3],
          };
        }
      });
    }

    return map;
  }, [data, uniqueHashes]);

  return { categoriesMap, isLoading, error };
}

export function getCategoryString(requestedCategories: string): string {
  if (!requestedCategories) return '';

  try {
    // Nếu requestedCategories là một JSON string chứa array của category hashes
    const categories = JSON.parse(requestedCategories);
    if (Array.isArray(categories)) {
      return categories.join(', ');
    }
    return requestedCategories;
  } catch {
    // Nếu không phải JSON, trả về string gốc
    return requestedCategories;
  }
}
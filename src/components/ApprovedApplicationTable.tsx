'use client';

import { API_CONFIG, getApiUrl } from '@/config/app';
import { useCategoryData } from '@/hooks/useCategoryData';
import { useIssuerActions } from '@/hooks/useIssuerActions';
import { formatTokenAmount } from '@/utils/formatters';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface ApprovedIssuer {
    address: string;
    name: string;
    requestedCategories: string[];
    proposedFixedFee: string;
    publicKey: string;
    stakeAmount: string;
    status: string;
    submittedAt: string;
    updatedAt: string;
    txHash: string;
    blockNumber: string;
    feePerCategory: string;
    registrationTime: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        issuers: ApprovedIssuer[];
        total: number;
        limit: number;
        offset: number;
    };
    meta: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export default function ApprovedIssuersTable() {
    const [issuers, setIssuers] = useState<ApprovedIssuer[]>([]);
    const [searchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const { revokeIssuer, isLoading: actionLoading, txHash } = useIssuerActions();



    // Fetch pending issuers from API
    const fetchIssuers = useCallback(async (page: number = 0, search: string = '') => {
        try {
            setIsLoading(true);
            setError(null);

            const offset = page * limit;
            const queryParams = new URLSearchParams({
                status: 'approved',
                limit: limit.toString(),
                offset: offset.toString(),
                ...(search && { search })
            });

            const response = await fetch(`${getApiUrl(API_CONFIG.endpoints.issuers)}?${queryParams}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.success) {
                setIssuers(data.data.issuers);
                setTotal(data.meta.total);
                setHasMore(data.meta.hasMore);
                setLastRefresh(new Date());
            } else {
                throw new Error('API returned unsuccessful response');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch issuers');
            console.error('Error fetching issuers:', err);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial load
    useEffect(() => {
        fetchIssuers(currentPage, searchTerm);
    }, [fetchIssuers, currentPage, searchTerm]);

    // Auto-refresh setup
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchIssuers(currentPage, searchTerm);
            }, 30000); // Refresh every 30 seconds
            setRefreshInterval(interval);

            return () => {
                if (interval) clearInterval(interval);
            };
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
    }, [autoRefresh, currentPage, searchTerm, fetchIssuers, refreshInterval]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(0); // Reset to first page when searching
            fetchIssuers(0, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchIssuers]);

    const allCategoryHashes = useMemo(() => {
        const hashes: string[] = [];
        for (const app of issuers) {
            try {
                const parsed = app.requestedCategories;
                hashes.push(...parsed);
            } catch {
                // ignore invalid JSON
            }
        }
        return Array.from(new Set(hashes));
    }, [issuers]);

    const { categoriesMap } = useCategoryData(allCategoryHashes);

    const handleRevoke = async (address: string) => {
        try {
            await revokeIssuer(address as `0x${string}`);

            // Show success message
            console.log('Issuer revoked successfully');

            // Refresh issuers after action
            await fetchIssuers(currentPage, searchTerm);
        } catch (error) {
            console.error('Error revoking issuer:', error);
            // Still refresh to get latest state
            await fetchIssuers(currentPage, searchTerm);
        }
    };

    const handleRefresh = () => {
        fetchIssuers(currentPage, searchTerm);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading issuers</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Approved issuers</h2>
                        <div className="text-sm text-gray-600 mt-1">
                            <p>Showing {issuers.length} of {total} issuers</p>
                            {lastRefresh && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last updated: {lastRefresh.toLocaleTimeString()}
                                    {autoRefresh && <span className="ml-2 text-green-600">• Auto-refresh ON</span>}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Auto-refresh toggle */}
                        <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Auto-refresh (30s)</span>
                            </label>
                        </div>

                        {/* Manual refresh button */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-md transition-colors"
                            title="Refresh data"
                        >
                            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                Categories
                            </th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                Fee Per Category
                            </th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                Registration Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Stake Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {issuers.map((issuer) => {
                            // Parse requestedCategories JSON string to get array of category hashes
                            let categoriesLabel = 'No categories';
                            try {
                                const categoryHashes = issuer.requestedCategories || [];
                                const categoryNames = (categoryHashes ?? [])
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map((h: any) => {
                                        const cat = categoriesMap[h];
                                        if (!cat) return null;
                                        return `${cat.name} - Base Fee: ${formatTokenAmount(cat.baseFee?.toString())} ETH`;
                                    })
                                    .filter(Boolean);
                                categoriesLabel = categoryNames.length
                                    ? categoryNames.join(', ')
                                    : 'No categories';
                            } catch {
                                categoriesLabel = issuer.requestedCategories.length
                                    ? issuer.requestedCategories.join(', ')
                                    : 'No categories';
                            }
                            const submittedDate = new Date(issuer.submittedAt).toLocaleDateString();
                            const registrationDate = issuer.registrationTime ? new Date(Number(issuer.registrationTime) * 1000).toLocaleDateString() : 'N/A';

                            return (
                                <tr key={issuer.address} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center space-x-2">
                                            <div className="font-mono">
                                                {issuer.address.slice(0, 6)}...{issuer.address.slice(-4)}
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(issuer.address)}
                                                className="text-gray-400 hover:text-gray-600 text-xs"
                                                title="Copy address"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {issuer.name}
                                    </td>
                                    <td className="px-2 py-4 text-xs text-gray-900">
                                        <div
                                            className="truncate cursor-help"
                                            title={categoriesLabel || 'No categories'}
                                        >
                                            {categoriesLabel ? (
                                                <span className="text-blue-600">
                                                    {categoriesLabel.length > 50 ? `${categoriesLabel.substring(0, 50)}...` : categoriesLabel}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatTokenAmount(issuer.feePerCategory)} ETH
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {registrationDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatTokenAmount(issuer.stakeAmount)} ETH
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {issuer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {submittedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleRevoke(issuer.address)}
                                                disabled={actionLoading}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? 'Processing...' : 'Revoke'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {issuers.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No issuers found matching your search.' : 'No issuers found.'}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {total > limit && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, total)} of {total} results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0 || isLoading}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-2 text-sm font-medium text-gray-700">
                                Page {currentPage + 1} of {Math.ceil(total / limit)}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!hasMore || isLoading}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Hash Display */}
            {txHash && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Transaction Successful</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-700">Transaction Hash:</span>
                        <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-800 font-mono break-all">
                            {txHash}
                        </code>
                        <button
                            onClick={() => navigator.clipboard.writeText(txHash)}
                            className="text-green-600 hover:text-green-800 text-sm underline"
                            title="Copy to clipboard"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
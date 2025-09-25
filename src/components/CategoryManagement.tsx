'use client';

import { useCategoryManagement, CategoryWithHash } from '@/hooks/useCategoryManagement';
import { useCallback, useEffect, useState } from 'react';

interface CategoryFormData {
    name: string;
    minimumStake: string;
    baseFee: string;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    category?: CategoryWithHash;
    isLoading: boolean;
    title: string;
}

function CategoryModal({ isOpen, onClose, onSubmit, category, isLoading, title }: CategoryModalProps) {
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        minimumStake: '',
        baseFee: ''
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                minimumStake: category.minimumStake,
                baseFee: category.baseFee
            });
        } else {
            setFormData({
                name: '',
                minimumStake: '',
                baseFee: ''
            });
        }
    }, [category, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={!!category} // Disable name editing for updates
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Stake (ETH)
                            </label>
                            <input
                                type="number"
                                step="0.000000000000000001"
                                value={formData.minimumStake}
                                onChange={(e) => setFormData({ ...formData, minimumStake: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Base Fee (ETH)
                            </label>
                            <input
                                type="number"
                                step="0.000000000000000001"
                                value={formData.baseFee}
                                onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (category ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    category: CategoryWithHash | null;
    isLoading: boolean;
}

function ConfirmModal({ isOpen, onClose, onConfirm, category, isLoading }: ConfirmModalProps) {
    if (!isOpen || !category) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Confirm Removal</h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to remove the category &quot;{category.name}&quot;? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Removing...' : 'Remove'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CategoryManagement() {
    const {
        categories,
        isLoading,
        error,
        lastRefresh,
        isActionLoading,
        txHash,
        addCategory,
        updateCategory,
        removeCategory,
        refresh
    } = useCategoryManagement();

    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryWithHash | null>(null);

    // Auto-refresh setup
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                refresh();
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
    }, [autoRefresh, refresh]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    const handleAddCategory = useCallback(async (data: CategoryFormData) => {
        try {
            await addCategory(data.name, data.minimumStake, data.baseFee);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding category:', error);
        }
    }, [addCategory]);

    const handleUpdateCategory = useCallback(async (data: CategoryFormData) => {
        if (!selectedCategory) return;

        try {
            await updateCategory(selectedCategory.name, data.minimumStake, data.baseFee);
            setShowEditModal(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    }, [updateCategory, selectedCategory]);

    const handleRemoveCategory = useCallback(async () => {
        if (!selectedCategory) return;

        try {
            await removeCategory(selectedCategory.name);
            setShowConfirmModal(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error removing category:', error);
        }
    }, [removeCategory, selectedCategory]);

    const openEditModal = (category: CategoryWithHash) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const openConfirmModal = (category: CategoryWithHash) => {
        setSelectedCategory(category);
        setShowConfirmModal(true);
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Categories</h3>
                    <p className="text-gray-600 mb-4">{error?.message || 'Unknown error'}</p>
                    <button
                        onClick={refresh}
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
                        <h2 className="text-lg font-medium text-gray-900">Category Management</h2>
                        <div className="text-sm text-gray-600 mt-1">
                            <p>Showing {categories.length} categories</p>
                            {lastRefresh && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last updated: {lastRefresh.toLocaleTimeString()}
                                    {autoRefresh && <span className="ml-2 text-green-600">• Auto-refresh ON</span>}
                                </p>
                            )}
                            {txHash && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
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
                            onClick={refresh}
                            disabled={isLoading}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-md transition-colors"
                            title="Refresh data"
                        >
                            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                        </button>

                        {/* Add category button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Add Category
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hash
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Minimum Stake
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Base Fee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.hash} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center space-x-2">
                                        <div className="font-mono">
                                            {category.hash.slice(0, 10)}...{category.hash.slice(-8)}
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(category.hash)}
                                            className="text-gray-400 hover:text-gray-600 text-xs"
                                            title="Copy hash"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {(category.minimumStake)} ETH
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {(category.baseFee)} ETH
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <div className="relative group">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                disabled={isActionLoading || category.name === 'CUSTOM'}
                                                className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed ${category.name === 'CUSTOM'
                                                        ? 'bg-gray-400 opacity-50'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                    } ${isActionLoading ? 'opacity-50' : ''}`}
                                            >
                                                Edit
                                            </button>
                                            {category.name === 'CUSTOM' && (
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                    CUSTOM is in onboarding flow and cannot be edited or deleted
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <button
                                                onClick={() => openConfirmModal(category)}
                                                disabled={isActionLoading || category.name === 'CUSTOM'}
                                                className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:cursor-not-allowed ${category.name === 'CUSTOM'
                                                        ? 'bg-gray-400 opacity-50'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                    } ${isActionLoading ? 'opacity-50' : ''}`}
                                            >
                                                Remove
                                            </button>
                                            {category.name === 'CUSTOM' && (
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                    CUSTOM is in onboarding flow and cannot be edited or deleted
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {categories.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        No categories found.
                    </div>
                )}
            </div>

            {/* Modals */}
            <CategoryModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddCategory}
                isLoading={isActionLoading}
                title="Add New Category"
            />

            <CategoryModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleUpdateCategory}
                category={selectedCategory || undefined}
                isLoading={isActionLoading}
                title="Edit Category"
            />

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedCategory(null);
                }}
                onConfirm={handleRemoveCategory}
                category={selectedCategory}
                isLoading={isActionLoading}
            />

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
'use client';

import Topbar from '@/components/Topbar';
import CategoryManagement from '@/components/CategoryManagement';
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function CategoriesPage() {
    const { isAdmin, isLoading } = useAdminGuard();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Topbar />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Topbar />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="text-center">
                            <div className="text-red-600 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage issuer categories, including adding new categories, updating existing ones, and removing categories.
                    </p>
                </div>
                <CategoryManagement />
            </main>
        </div>
    );
}
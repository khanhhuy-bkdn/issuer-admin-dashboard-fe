'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname()

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <Link
              href="/"
              className={`text-lg font-medium hover:underline ${pathname === '/' ? 'text-green-600 underline' : 'font-medium text-gray-900'}`}
            >
              Pending Issuers
            </Link>
            <Link
              href="/list-approved"
              className={`text-lg font-medium hover:underline ${pathname === '/list-approved' ? 'text-green-600 underline' : 'font-medium text-gray-900'}`}
            >
              Approved Issuers
            </Link>
            <Link
              href="/categories"
              className={`text-lg font-medium hover:underline ${pathname === '/categories' ? 'text-green-600 underline' : 'font-medium text-gray-900'}`}
            >
              Categories
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useIssuerActions } from '@/hooks/useIssuerActions';
import { useAdminGuard } from '@/hooks/useAdminGuard';

interface IssuerCardProps {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  categories: string[];
  proposedFixedFee: string;
  timestamp: number;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export default function IssuerCard({
  id,
  name,
  address,
  status,
  categories,
  proposedFixedFee,
  timestamp,
  onStatusChange
}: IssuerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [approveFixedFee, setApproveFixedFee] = useState(false);
  const { approveIssuer, rejectIssuer, revokeIssuer, isLoading } = useIssuerActions();
  const { isAdmin, isConnected } = useAdminGuard();

  const handleApprove = async () => {
    try {
      await approveIssuer(address as `0x${string}`, approveFixedFee);
      onStatusChange?.(id, 'approved');
      setApproveFixedFee(false); // Reset checkbox after approval
    } catch (error) {
      console.error('Failed to approve issuer:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectIssuer(address as `0x${string}`);
      onStatusChange?.(id, 'rejected');
    } catch (error) {
      console.error('Failed to reject issuer:', error);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeIssuer(address as `0x${string}`);
      onStatusChange?.(id, 'revoked');
    } catch (error) {
      console.error('Failed to revoke issuer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canPerformActions = isConnected && isAdmin && !isLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span>
                <span className="font-mono ml-1">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Applied:</span>
                <span className="ml-1">{formatDate(timestamp)}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Proposed Fee:</span>
                <span className="ml-1">{proposedFixedFee} ETH</span>
              </p>
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Full Address:</span> <span className="font-mono">{address}</span></p>
              <p><span className="font-medium">Application ID:</span> {id}</p>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`approve-fixed-fee-card-${id}`}
                  checked={approveFixedFee}
                  onChange={(e) => setApproveFixedFee(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`approve-fixed-fee-card-${id}`} className="text-sm text-gray-600">
                  Approve Fixed Fee
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={!canPerformActions}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!canPerformActions ? 'Connect wallet and ensure admin rights' : ''}
                >
                  {isLoading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={!canPerformActions}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!canPerformActions ? 'Connect wallet and ensure admin rights' : ''}
                >
                  {isLoading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleRevoke}
              disabled={!canPerformActions}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!canPerformActions ? 'Connect wallet and ensure admin rights' : ''}
            >
              {isLoading ? 'Processing...' : 'Revoke Access'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
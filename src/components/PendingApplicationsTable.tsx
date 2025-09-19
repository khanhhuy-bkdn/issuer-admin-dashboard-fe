'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CURRENT_CONTRACT } from '@/config/contracts';
import { useIssuerActions } from '@/hooks/useIssuerActions';
import IssuerRegistryABI from '@/contracts/IssuerRegistry.json';

interface PendingApplication {
  id: string;
  applicantAddress: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  proposedFixedFee: string;
  categories: string[];
  publicKey: string;
  provider: string;
}

export default function PendingApplicationsTable() {
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [approveFixedFeeMap, setApproveFixedFeeMap] = useState<Record<string, boolean>>({});
  
  const { approveIssuer, rejectIssuer, revokeIssuer, isLoading: actionLoading, txHash } = useIssuerActions();

  // Get pending applications count
  const { data: pendingCount } = useReadContract({
    address: CURRENT_CONTRACT.issuerRegistry,
    abi: IssuerRegistryABI.abi,
    functionName: 'getPendingApplicationsCount',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockApplications: PendingApplication[] = [
      {
        id: '1',
        applicantAddress: '0x1234567890123456789012345678901234567890',
        name: 'Acme Corp',
        status: 'pending',
        timestamp: Date.now() - 86400000,
        proposedFixedFee: '100',
        categories: ['Technology', 'Finance'],
        publicKey: '0xabcdef...',
        provider: 'Acme Provider'
      },
      {
        id: '2',
        applicantAddress: '0x2345678901234567890123456789012345678901',
        name: 'Beta LLC',
        status: 'pending',
        timestamp: Date.now() - 172800000,
        proposedFixedFee: '150',
        categories: ['Healthcare'],
        publicKey: '0x123456...',
        provider: 'Beta Provider'
      }
    ];
    
    setApplications(mockApplications);
    setIsLoading(false);
  }, []);

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicantAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (address: string) => {
    const approveFixedFee = approveFixedFeeMap[address] || false;
    await approveIssuer(address as `0x${string}`, approveFixedFee);
    // Refresh applications after action
    setApplications(prev => prev.filter(app => app.applicantAddress !== address));
    // Clear the checkbox state
    setApproveFixedFeeMap(prev => {
      const newMap = { ...prev };
      delete newMap[address];
      return newMap;
    });
  };

  const handleReject = async (address: string) => {
    await rejectIssuer(address as `0x${string}`);
    // Refresh applications after action
    setApplications(prev => prev.filter(app => app.applicantAddress !== address));
  };

  const handleRevoke = async (address: string) => {
    await revokeIssuer(address as `0x${string}`);
    // Refresh applications after action
    setApplications(prev => prev.filter(app => app.applicantAddress !== address));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Pending Applications</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee
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
            {filteredApplications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-mono">
                    {application.applicantAddress.slice(0, 6)}...{application.applicantAddress.slice(-4)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {application.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {application.proposedFixedFee} ETH
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {application.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`approve-fixed-fee-${application.id}`}
                        checked={approveFixedFeeMap[application.applicantAddress] || false}
                        onChange={(e) => setApproveFixedFeeMap(prev => ({
                          ...prev,
                          [application.applicantAddress]: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`approve-fixed-fee-${application.id}`} className="text-xs text-gray-600">
                        Approve Fixed Fee
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(application.applicantAddress)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                       <button
                         onClick={() => handleReject(application.applicantAddress)}
                         disabled={actionLoading}
                         className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {actionLoading ? 'Processing...' : 'Reject'}
                       </button>
                       <button
                         onClick={() => handleRevoke(application.applicantAddress)}
                         disabled={actionLoading}
                         className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {actionLoading ? 'Processing...' : 'Revoke'}
                       </button>
                     </div>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No pending applications found.
          </div>
        )}
      </div>
      
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
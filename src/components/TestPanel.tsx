'use client';

import { useState } from 'react';
import { useIssuerActions } from '@/hooks/useIssuerActions';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useAccount } from 'wagmi';

export default function TestPanel() {
  const [testAddress, setTestAddress] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const { approveIssuer, rejectIssuer, revokeIssuer, isLoading } = useIssuerActions();
  const { isAdmin, isConnected, address } = useAdminGuard();
  const { chain } = useAccount();

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testApprove = async () => {
    if (!testAddress) {
      addTestResult('❌ Please enter a test address');
      return;
    }

    try {
      addTestResult(`🔄 Testing approve for address: ${testAddress}`);
      await approveIssuer(testAddress as `0x${string}`, false);
      addTestResult(`✅ Successfully approved issuer: ${testAddress}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      addTestResult(`❌ Failed to approve issuer: ${error.message || error}`);
    }
  };

  const testReject = async () => {
    if (!testAddress) {
      addTestResult('❌ Please enter a test address');
      return;
    }

    try {
      addTestResult(`🔄 Testing reject for address: ${testAddress}`);
      await rejectIssuer(testAddress as `0x${string}`);
      addTestResult(`✅ Successfully rejected issuer: ${testAddress}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      addTestResult(`❌ Failed to reject issuer: ${error.message || error}`);
    }
  };

  const testRevoke = async () => {
    if (!testAddress) {
      addTestResult('❌ Please enter a test address');
      return;
    }

    try {
      addTestResult(`🔄 Testing revoke for address: ${testAddress}`);
      await revokeIssuer(testAddress as `0x${string}`);
      addTestResult(`✅ Successfully revoked issuer: ${testAddress}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      addTestResult(`❌ Failed to revoke issuer: ${error.message || error}`);
    }
  };

  const testConnectionStatus = () => {
    addTestResult(`🔍 Connection Status:`);
    addTestResult(`  - Wallet Connected: ${isConnected ? '✅' : '❌'}`);
    addTestResult(`  - Admin Rights: ${isAdmin ? '✅' : '❌'}`);
    addTestResult(`  - Current Address: ${address || 'Not connected'}`);
    addTestResult(`  - Current Chain: ${chain?.name || 'Unknown'} (ID: ${chain?.id || 'N/A'})`);
  };

  const canPerformActions = isConnected && isAdmin && !isLoading;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Contract Testing Panel</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? (isAdmin ? 'Admin Connected' : 'Connected (No Admin)') : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Test Address Input */}
          <div>
            <label htmlFor="testAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Test Address (0x...)
            </label>
            <input
              type="text"
              id="testAddress"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="0x1234567890123456789012345678901234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={testApprove}
              disabled={!canPerformActions}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Testing...' : 'Test Approve'}
            </button>

            <button
              onClick={testReject}
              disabled={!canPerformActions}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Testing...' : 'Test Reject'}
            </button>

            <button
              onClick={testRevoke}
              disabled={!canPerformActions}
              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Testing...' : 'Test Revoke'}
            </button>

            <button
              onClick={testConnectionStatus}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Check Status
            </button>
          </div>

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear Results
              </button>
            </div>

            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No test results yet. Run a test to see results here.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono text-gray-800 break-all">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Testing Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter a valid Ethereum address in the test address field</li>
              <li>• Ensure your wallet is connected and you have admin rights</li>
              <li>• Use Check Status to verify your connection and permissions</li>
              <li>• Test approve/reject/revoke functions with different addresses</li>
              <li>• Monitor the test results for success/failure messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface QuickBooksConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const QuickBooksConnect: React.FC<QuickBooksConnectProps> = ({ onConnect, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_QUICKBOOKS_CLIENT_ID;
  const redirectUri = `${window.location.origin}/quickbooks/callback`;
  const scope = 'com.intuit.quickbooks.accounting';

  useEffect(() => {
    // Check if we have a valid QuickBooks token in storage
    const token = localStorage.getItem('quickbooks_token');
    if (token) {
      try {
        const tokenData = JSON.parse(token);
        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt > new Date()) {
          setIsConnected(true);
        } else {
          localStorage.removeItem('quickbooks_token');
        }
      } catch (err) {
        localStorage.removeItem('quickbooks_token');
      }
    }
  }, []);

  const handleConnect = () => {
    if (!clientId) {
      setError('QuickBooks client ID is not configured');
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Construct the QuickBooks authorization URL
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${Math.random().toString(36).substring(7)}`;

    // Open the QuickBooks authorization window
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    try {
      // Call your backend to revoke the token
      const response = await fetch('/api/quickbooks/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect from QuickBooks');
      }

      // Clear local storage and update state
      localStorage.removeItem('quickbooks_token');
      setIsConnected(false);
      onDisconnect?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-4">
            <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              QuickBooks Integration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your QuickBooks account to sync invoices and payments
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
        }`}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center"
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Your QuickBooks account is connected</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200 flex items-center justify-center"
            >
              <Link2 className="h-5 w-5 mr-2" />
              Disconnect Account
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <Link2 className="h-5 w-5 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect QuickBooks'}
          </button>
        )}
      </div>

      {isConnected && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Sync Settings
          </h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Automatically sync new invoices
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Sync payment status updates
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickBooksConnect;
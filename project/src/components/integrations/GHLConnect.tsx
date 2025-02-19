import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ghlService } from '../../services/ghl';

const GHLConnect: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const isConnected = ghlService.isConnected();

  const handleConnect = () => {
    try {
      const authUrl = ghlService.getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate connection');
    }
  };

  const handleDisconnect = () => {
    try {
      ghlService.disconnect();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-4">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Local Lead Connector
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your Local Lead Connector account to sync contacts and conversations
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

      {isConnected ? (
        <>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Your Local Lead Connector account is connected</span>
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
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
        >
          <Link2 className="h-5 w-5 mr-2" />
          Connect Local Lead Connector
        </button>
      )}
    </div>
  );
};

export default GHLConnect;
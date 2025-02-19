import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ghlService } from '../../services/ghl';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const GHLSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [locationId, setLocationId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'success' | 'failed' | 'syncing' | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadSettings();
  }, [currentUser, navigate]);

  const loadSettings = async () => {
    try {
      if (!currentUser?.id) {
        console.warn('No user ID available for loading GHL settings');
        return;
      }

      // Use maybeSingle() instead of single() to handle no rows gracefully
      const { data: settings, error } = await supabase
        .from('ghl_settings')
        .select('*')
        .eq('created_by', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (settings) {
        setIsConnected(true);
        setLastSync(settings.last_sync);
        setSyncStatus(settings.sync_status);
      } else {
        setIsConnected(false);
        setLastSync(null);
        setSyncStatus(null);
      }
    } catch (error) {
      console.error('Error loading GHL settings:', error);
      setError('Failed to load GHL settings. Please try again.');
    }
  };

  const handleConnect = async () => {
    if (!currentUser?.id) {
      setError('You must be logged in to connect GHL');
      navigate('/login');
      return;
    }

    if (!accessToken) {
      setError('Please enter your Location Access Token');
      return;
    }

    if (!locationId) {
      setError('Please enter your Location ID');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await ghlService.connect(accessToken, locationId);
      setIsConnected(true);
      await handleSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to GHL');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!currentUser?.id) {
      setError('You must be logged in to disconnect GHL');
      navigate('/login');
      return;
    }

    try {
      await ghlService.disconnect();
      setIsConnected(false);
      setAccessToken('');
      setLocationId('');
      setLastSync(null);
      setSyncStatus(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
      setError('Failed to disconnect from GHL');
    }
  };

  const handleSync = async () => {
    if (!currentUser?.id) {
      setError('You must be logged in to sync contacts');
      navigate('/login');
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSyncStatus('syncing');

    try {
      const { error } = await supabase.rpc('sync_ghl_contacts', {
        access_token: accessToken,
        location_id: locationId
      });

      if (error) throw error;

      setSyncStatus('success');
      setLastSync(new Date().toISOString());
    } catch (err) {
      setSyncStatus('failed');
      setError(err instanceof Error ? err.message : 'Failed to sync contacts');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to manage your GHL integration.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-4">
            <Link2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              GoHighLevel Integration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your GHL location to sync contacts and conversations
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
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span>Your GHL location is connected</span>
            </div>
            {lastSync && (
              <div className="flex items-center">
                <span className="mr-2">Last synced: {new Date(lastSync).toLocaleString()}</span>
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'success' ? 'bg-green-500' :
                  syncStatus === 'failed' ? 'bg-red-500' :
                  syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-500'
                }`} />
              </div>
            )}
          </div>

          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Contacts'}
            </button>
            
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 flex items-center justify-center"
            >
              <Link2 className="h-5 w-5 mr-2" />
              Disconnect Account
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your GHL Location Access Token"
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You can find your Location Access Token in your GHL Location Settings under Private Integrations
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location ID
            </label>
            <input
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="Enter your GHL Location ID"
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your Location ID can be found in the URL when viewing your location in GHL
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="h-5 w-5 mr-2" />
                Connect GHL Account
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default GHLSettings;
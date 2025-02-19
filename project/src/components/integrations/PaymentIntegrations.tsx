import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

const PaymentIntegrations: React.FC = () => {
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const paymentServices = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept credit card payments and manage subscriptions',
      icon: CreditCard
    },
    {
      id: 'square',
      name: 'Square',
      description: 'Process in-person and online payments',
      icon: CreditCard
    }
  ];

  const handleConnect = async (serviceId: string) => {
    try {
      // In a real app, this would initiate OAuth flow
      setConnectedServices(prev => new Set([...prev, serviceId]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    try {
      // In a real app, this would revoke access tokens
      setConnectedServices(prev => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center"
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </motion.div>
      )}

      {paymentServices.map((service) => (
        <div
          key={service.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-4">
                <service.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectedServices.has(service.id)
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
            }`}>
              {connectedServices.has(service.id) ? 'Connected' : 'Not Connected'}
            </div>
          </div>

          {connectedServices.has(service.id) ? (
            <>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Your {service.name} account is connected</span>
              </div>
              <button
                onClick={() => handleDisconnect(service.id)}
                className="w-full px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200 flex items-center justify-center"
              >
                <Link2 className="h-5 w-5 mr-2" />
                Disconnect {service.name}
              </button>
            </>
          ) : (
            <button
              onClick={() => handleConnect(service.id)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
            >
              <Link2 className="h-5 w-5 mr-2" />
              Connect {service.name}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentIntegrations;
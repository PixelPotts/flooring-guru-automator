import React from 'react';
import { motion } from 'framer-motion';
import QuickBooksConnect from './integrations/QuickBooksConnect';
import PaymentIntegrations from './integrations/PaymentIntegrations';
import EmailIntegrations from './integrations/EmailIntegrations';
import CalendarIntegrations from './integrations/CalendarIntegrations';
import StorageIntegrations from './integrations/StorageIntegrations';
import MessagingIntegrations from './integrations/MessagingIntegrations';
import LeadIntegrations from './integrations/LeadIntegrations';
import ReviewIntegrations from './integrations/ReviewIntegrations';
import GHLConnect from './integrations/GHLConnect';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              CRM & Lead Management
            </h2>
            <div className="space-y-4">
              <GHLConnect />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Accounting & Payments
            </h2>
            <div className="space-y-4">
              <QuickBooksConnect />
              <PaymentIntegrations />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Lead Generation
            </h2>
            <LeadIntegrations />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Marketing & Communication
            </h2>
            <div className="space-y-4">
              <EmailIntegrations />
              <MessagingIntegrations />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calendar & Scheduling
            </h2>
            <CalendarIntegrations />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Document Storage
            </h2>
            <StorageIntegrations />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reviews & Reputation
            </h2>
            <ReviewIntegrations />
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
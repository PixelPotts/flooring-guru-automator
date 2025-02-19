import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, FileText, Wallet } from 'lucide-react';
import type { Payment } from '../../types/payment';

interface PaymentsListProps {
  payments: Payment[];
  onViewDetails: (payment: Payment) => void;
}

const PaymentsList: React.FC<PaymentsListProps> = ({ payments, onViewDetails }) => {
  const getPaymentIcon = (method: Payment['method']) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'check':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'cash':
        return <Wallet className="h-5 w-5 text-amber-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {payments.map((payment, index) => (
        <motion.div
          key={payment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewDetails(payment)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {getPaymentIcon(payment.method)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${payment.amount.toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(payment.date).toLocaleDateString()} - {payment.method.replace('_', ' ')}
                  {payment.checkNumber && ` #${payment.checkNumber}`}
                  {payment.cardLast4 && ` ending in ${payment.cardLast4}`}
                </div>
              </div>
            </div>
            {payment.reference && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Ref: {payment.reference}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PaymentsList;
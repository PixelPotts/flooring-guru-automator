import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileText, Wallet, DollarSign, Calendar, Clock } from 'lucide-react';
import type { Payment } from '../../types/payment';

interface PaymentDetailsProps {
  payment: Payment;
  onClose: () => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, onClose }) => {
  const getPaymentIcon = (method: Payment['method']) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-6 w-6 text-blue-500" />;
      case 'check':
        return <FileText className="h-6 w-6 text-green-500" />;
      case 'cash':
        return <Wallet className="h-6 w-6 text-amber-500" />;
      default:
        return <DollarSign className="h-6 w-6 text-gray-500" />;
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {getPaymentIcon(payment.method)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Payment Details
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {payment.method.replace('_', ' ')} Payment
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              ${payment.amount.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(payment.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {(payment.checkNumber || payment.cardLast4) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              {payment.method === 'check' ? (
                <FileText className="h-5 w-5 text-gray-400" />
              ) : (
                <CreditCard className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {payment.method === 'check' ? 'Check Number' : 'Card Details'}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {payment.checkNumber || `**** **** **** ${payment.cardLast4}`}
            </span>
          </div>
        )}

        {payment.reference && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Reference</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {payment.reference}
            </span>
          </div>
        )}

        {payment.notes && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</span>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{payment.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentDetails;
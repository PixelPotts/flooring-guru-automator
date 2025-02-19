import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, DollarSign, Calendar, Edit, Trash, Clock } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import PaymentModal from '../payments/PaymentModal';

interface InvoiceCardProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onPaymentComplete: (invoiceId: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onEdit,
  onDelete,
  onPaymentComplete
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handlePaymentComplete = () => {
    onPaymentComplete(invoice.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, translateY: -5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invoice #{invoice.id}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.clientName}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${invoice.total.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${invoice.balance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(invoice)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(invoice.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash className="h-5 w-5" />
              </motion.button>
            </div>
            {invoice.balance > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Process Payment
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

export default InvoiceCard;
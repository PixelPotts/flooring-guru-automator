import React, { useState } from 'react';
import { Plus, Search, Filter, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Payment, PaymentFormData } from '../types/payment';
import PaymentsList from './payments/PaymentsList';
import PaymentForm from './payments/PaymentForm';
import PaymentDetails from './payments/PaymentDetails';
import { processPayment } from '../services/payments/paymentProcessor';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>('all');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total amount whenever payments change
  React.useEffect(() => {
    const total = payments.reduce((sum, payment) => 
      payment.status === 'completed' ? sum + payment.amount : sum, 0
    );
    setTotalAmount(total);
  }, [payments]);

  const handleAddPayment = async (paymentData: PaymentFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!paymentData.clientId) {
        throw new Error('Please select a client');
      }

      const newPayment = await processPayment(paymentData, paymentData.clientId);
      setPayments([...payments, newPayment]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Payments</h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4 mr-1" />
            Total Received: ${totalAmount.toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Payment
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Payment['status'] | 'all')}
          className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}
          <PaymentForm
            onSubmit={handleAddPayment}
            onCancel={() => setShowForm(false)}
            isProcessing={isProcessing}
          />
        </motion.div>
      ) : selectedPayment ? (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      ) : (
        <PaymentsList
          payments={filteredPayments}
          onViewDetails={setSelectedPayment}
        />
      )}
    </div>
  );
};

export default Payments;
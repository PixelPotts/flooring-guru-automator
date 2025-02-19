import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileText, Wallet, DollarSign, Users, Loader } from 'lucide-react';
import type { PaymentFormData } from '../../types/payment';
import { useClients } from '../../context/ClientContext';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PaymentFormData>;
  isProcessing?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isProcessing = false
}) => {
  const { clients } = useClients();
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: initialData?.amount || '',
    method: initialData?.method || 'credit_card',
    clientId: initialData?.clientId || '',
    reference: initialData?.reference || '',
    checkNumber: initialData?.checkNumber || '',
    cardLast4: initialData?.cardLast4 || '',
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Client
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="pl-10 w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
            { id: 'check', label: 'Check', icon: FileText },
            { id: 'cash', label: 'Cash', icon: Wallet },
            { id: 'bank_transfer', label: 'Bank Transfer', icon: DollarSign }
          ].map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setFormData({ ...formData, method: method.id as PaymentFormData['method'] })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.method === method.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <method.icon className={`h-6 w-6 mx-auto mb-2 ${
                formData.method === method.id
                  ? 'text-blue-500'
                  : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                formData.method === method.id
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {method.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="pl-10 w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          />
        </div>
      </div>

      {formData.method === 'credit_card' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last 4 Digits
          </label>
          <input
            type="text"
            maxLength={4}
            pattern="\d{4}"
            value={formData.cardLast4}
            onChange={(e) => setFormData({ ...formData, cardLast4: e.target.value })}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          />
        </div>
      )}

      {formData.method === 'check' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Check Number
          </label>
          <input
            type="text"
            value={formData.checkNumber}
            onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reference (Optional)
        </label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isProcessing ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            'Submit Payment'
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
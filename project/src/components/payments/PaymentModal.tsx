import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Invoice } from '../../types/invoice';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentComplete: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'check'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCardPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Create a payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: invoice.balance * 100, // Convert to cents
          currency: 'usd',
          invoiceId: invoice.id,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment with Stripe.js
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // In a real implementation, you would use Stripe Elements here
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2024,
            cvc: '123',
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onPaymentComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOrCheckPayment = () => {
    // In a real app, you would record the cash/check payment in your system
    onPaymentComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Process Payment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Payment Amount
            </h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ${invoice.balance.toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                } flex flex-col items-center space-y-2`}
              >
                <CreditCard className={`h-6 w-6 ${
                  paymentMethod === 'card'
                    ? 'text-blue-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className={`text-sm ${
                  paymentMethod === 'card'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>Card</span>
              </button>

              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-lg border ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                } flex flex-col items-center space-y-2`}
              >
                <DollarSign className={`h-6 w-6 ${
                  paymentMethod === 'cash'
                    ? 'text-blue-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className={`text-sm ${
                  paymentMethod === 'cash'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>Cash</span>
              </button>

              <button
                onClick={() => setPaymentMethod('check')}
                className={`p-4 rounded-lg border ${
                  paymentMethod === 'check'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                } flex flex-col items-center space-y-2`}
              >
                <svg
                  className={`h-6 w-6 ${
                    paymentMethod === 'check'
                      ? 'text-blue-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className={`text-sm ${
                  paymentMethod === 'check'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>Check</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={paymentMethod === 'card' ? handleCardPayment : handleCashOrCheckPayment}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              `Process ${paymentMethod === 'card' ? 'Card' : paymentMethod === 'cash' ? 'Cash' : 'Check'} Payment`
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
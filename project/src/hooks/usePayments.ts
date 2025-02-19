import { useState, useCallback } from 'react';
import { Payment, PaymentFormData } from '../types/payment';
import { processPayment } from '../services/payments/paymentProcessor';
import { useToast } from './useToast';

export const usePayments = (clientId: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handlePayment = useCallback(async (paymentData: PaymentFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      const payment = await processPayment(paymentData, clientId);
      
      showToast({
        title: 'Payment Successful',
        message: `Payment of $${payment.amount} has been processed`,
        type: 'success'
      });

      return payment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      
      showToast({
        title: 'Payment Failed',
        message: errorMessage,
        type: 'error'
      });

      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [clientId, showToast]);

  return {
    processPayment: handlePayment,
    isProcessing,
    error
  };
};
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentFormData } from '../../types/payment';
import { validatePayment } from './paymentValidation';
import { syncPaymentToClient } from './paymentSync';
import { supabase } from '../../config/firebase';
import { PaymentProcessingError } from './paymentErrors';

export const processPayment = async (
  paymentData: PaymentFormData,
  clientId: string
): Promise<Payment> => {
  try {
    // Validate payment data
    const validationResult = validatePayment(paymentData);
    if (!validationResult.isValid) {
      throw new PaymentProcessingError(validationResult.errors.join(', '));
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Create payment record
    const payment: Payment = {
      id: uuidv4(),
      clientId,
      amount: Number(paymentData.amount),
      method: paymentData.method,
      status: 'pending',
      date: new Date().toISOString(),
      reference: paymentData.reference,
      checkNumber: paymentData.checkNumber,
      cardLast4: paymentData.cardLast4,
      notes: paymentData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Start a Supabase transaction using RPC
    const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
      payment_data: {
        ...payment,
        created_by: user.id
      }
    });

    if (rpcError) throw rpcError;

    // Sync payment to client and update related records
    await syncPaymentToClient(payment);

    return {
      ...payment,
      status: 'completed'
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    throw new PaymentProcessingError(
      error instanceof Error ? error.message : 'Failed to process payment'
    );
  }
};
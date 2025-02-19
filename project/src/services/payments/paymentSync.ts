import { Payment } from '../../types/payment';
import { supabase } from '../../config/firebase';
import { PaymentSyncError } from './paymentErrors';

export const syncPaymentToClient = async (payment: Payment): Promise<void> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Call Supabase RPC function to handle payment sync
    const { error: syncError } = await supabase.rpc('sync_payment_to_client', {
      payment_data: {
        ...payment,
        created_by: user.id
      }
    });

    if (syncError) throw syncError;

  } catch (error) {
    console.error('Payment sync error:', error);
    throw new PaymentSyncError(
      error instanceof Error ? error.message : 'Failed to sync payment'
    );
  }
};
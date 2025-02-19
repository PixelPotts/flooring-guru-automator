export type PaymentMethod = 'credit_card' | 'check' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  reference?: string;
  checkNumber?: string;
  cardLast4?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFormData {
  amount: number | string;
  method: PaymentMethod;
  reference?: string;
  checkNumber?: string;
  cardLast4?: string;
  notes?: string;
}
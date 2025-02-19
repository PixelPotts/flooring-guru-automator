export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'material' | 'labor';
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'credit_card' | 'cash' | 'check' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  estimateId?: string;
  projectId?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payments: Payment[];
  notes?: string;
}
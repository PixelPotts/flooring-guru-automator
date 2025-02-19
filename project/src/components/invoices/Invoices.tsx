import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Invoice } from '../../types/invoice';
import InvoiceCard from './InvoiceCard';
import InvoiceModal from './InvoiceModal';
import { useClients } from '../../context/ClientContext';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Invoice['status'] | 'all'>('all');
  const { clients } = useClients();

  const handleAddInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = {
      ...invoice,
      id: (invoices.length + 1).toString()
    };
    setInvoices([...invoices, newInvoice]);
    setIsModalOpen(false);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const handlePaymentComplete = (invoiceId: string) => {
    setInvoices(invoices.map(invoice => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'paid',
          balance: 0,
          payments: [
            ...invoice.payments,
            {
              id: (invoice.payments.length + 1).toString(),
              amount: invoice.balance,
              date: new Date().toISOString().split('T')[0],
              method: 'credit_card',
              status: 'completed'
            }
          ]
        };
      }
      return invoice;
    }));
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     invoice.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === 'all' || invoice.status === filterStatus)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Invoice['status'] | 'all')}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onEdit={(inv) => {
              setEditingInvoice(inv);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteInvoice}
            onPaymentComplete={handlePaymentComplete}
          />
        ))}
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={editingInvoice ? handleUpdateInvoice : handleAddInvoice}
        invoice={editingInvoice}
        clients={clients}
      />
    </motion.div>
  );
};

export default Invoices;
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Estimate } from '../../types/estimate';
import EstimateModal from './EstimateModal';
import EstimateCard from './EstimateCard';
import { useClients } from '../../context/ClientContext';
import { useLocation } from 'react-router-dom';

const Estimates: React.FC = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Estimate['status']>('all');
  const { clients } = useClients();

  // Handle AI-generated estimate
  useEffect(() => {
    if (location.state?.newEstimate) {
      setEditingEstimate(null);
      setIsModalOpen(true);
      
      // Clear the location state to prevent reopening
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddEstimate = (estimate: Omit<Estimate, 'id'>) => {
    const newEstimate = {
      ...estimate,
      id: Date.now().toString(),
      status: 'draft'
    };
    setEstimates([...estimates, newEstimate]);
    setIsModalOpen(false);
    setEditingEstimate(null);
  };

  const handleUpdateEstimate = (updatedEstimate: Estimate) => {
    setEstimates(estimates.map(est => 
      est.id === updatedEstimate.id ? updatedEstimate : est
    ));
    setIsModalOpen(false);
    setEditingEstimate(null);
  };

  const handleDeleteEstimate = (id: string) => {
    setEstimates(estimates.filter(est => est.id !== id));
  };

  const handleSaveEstimate = (estimateData: Omit<Estimate, 'id'> | Estimate) => {
    try {
      if ('id' in estimateData) {
        handleUpdateEstimate(estimateData as Estimate);
      } else {
        handleAddEstimate(estimateData);
      }
    } catch (error) {
      console.error('Error saving estimate:', error);
      // Re-throw error to be handled by parent
      throw error;
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || estimate.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredEstimates.reduce((sum, est) => sum + est.total, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Estimates ({filteredEstimates.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Value: ${totalValue.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEstimate(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Estimate
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEstimates.map((estimate) => (
          <EstimateCard
            key={estimate.id}
            estimate={estimate}
            onUpdate={(est) => {
              setEditingEstimate(est);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteEstimate}
          />
        ))}

        {filteredEstimates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery
                ? `No estimates match your search "${searchQuery}"`
                : "No estimates yet"}
            </p>
            <button
              onClick={() => {
                setEditingEstimate(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 inline-block mr-2" />
              Create First Estimate
            </button>
          </div>
        )}
      </div>

      <EstimateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEstimate(null);
        }}
        onSave={handleSaveEstimate}
        estimate={editingEstimate || (location.state?.newEstimate as Estimate)}
        clients={clients}
      />
    </motion.div>
  );
};

export default Estimates;
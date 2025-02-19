import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Estimate } from '../types/estimate';
import { MaterialLineItem, LaborLineItem } from '../types/lineItems';
import EstimateModal from './estimates/EstimateModal';
import EstimateCard from './estimates/EstimateCard';
import { useClients } from '../context/ClientContext';
import { useLocation } from 'react-router-dom';

const Estimates: React.FC = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const { clients } = useClients();

  // Handle AI-generated estimate
  useEffect(() => {
    if (location.state?.newEstimate) {
      setEditingEstimate(null);
      const newEstimate = location.state.newEstimate;
      setIsModalOpen(true);
      
      // Clear the location state to prevent reopening
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddEstimate = (estimate: Omit<Estimate, 'id'>) => {
    const newEstimate = {
      ...estimate,
      id: Date.now().toString()
    };
    setEstimates([...estimates, newEstimate]);
    setIsModalOpen(false);
    setEditingEstimate(null);
    setEditingEstimate(null);
  };

  const handleUpdateEstimate = (updatedEstimate: Estimate) => {
    setEstimates(estimates.map(est => 
      est.id === updatedEstimate.id ? updatedEstimate : est
    ));
    setIsModalOpen(false);
    setEditingEstimate(null);
    setEditingEstimate(null);
  };

  const handleDeleteEstimate = (id: string) => {
    setEstimates(estimates.filter(est => est.id !== id));
  };

  const handleSaveEstimate = (estimateData: Omit<Estimate, 'id'> | Estimate) => {
    if ('id' in estimateData) {
      handleUpdateEstimate(estimateData as Estimate);
    } else {
      handleAddEstimate(estimateData);
    }
  };

  const filteredEstimates = estimates.filter(estimate =>
    estimate.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estimates</h1>
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

      <div className="mb-6 flex gap-4">
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
    </div>
  );
};

export default Estimates;
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Estimate } from '../types/estimate';
import EstimateModal from '../components/estimates/EstimateModal';
import EstimateCard from '../components/estimates/EstimateCard';
import { useClients } from '../context/ClientContext';
import { useLocation } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../lib/supabase';

const Estimates: React.FC = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Estimate['status']>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clients } = useClients();

  useEffect(() => {
    loadEstimates();
  }, []);

  useEffect(() => {
    if (location.state?.newEstimate) {
      setEditingEstimate(null);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEstimates: Estimate[] = (data || []).map(est => ({
        id: est.id,
        clientId: est.client_id,
        clientName: est.client_name,
        status: est.status,
        date: est.date,
        items: est.items || [],
        subtotal: est.subtotal,
        tax: est.tax,
        total: est.total,
        notes: est.notes || '',
        rooms: est.rooms || [],
        roomDimensions: est.room_dimensions || {},
        shareUrl: est.share_url,
        shareToken: est.share_token,
        clientFeedback: est.client_feedback,
        clientViewedAt: est.client_viewed_at,
        clientRespondedAt: est.client_responded_at,
        expiresAt: est.expires_at
      }));

      setEstimates(formattedEstimates);
    } catch (err) {
      console.error('Error loading estimates:', err);
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEstimate = async (estimateData: Omit<Estimate, 'id'> | Estimate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate required fields
      if (!estimateData.clientId || !estimateData.clientName) {
        throw new Error('Client information is required');
      }

      if (!Array.isArray(estimateData.items) || estimateData.items.length === 0) {
        throw new Error('At least one item is required');
      }

      // Convert frontend field names to database format
      const dbEstimate = {
        client_id: estimateData.clientId,
        client_name: estimateData.clientName,
        status: estimateData.status,
        date: estimateData.date,
        items: estimateData.items,
        subtotal: estimateData.subtotal,
        tax: estimateData.tax,
        total: estimateData.total,
        notes: estimateData.notes,
        rooms: estimateData.rooms,
        room_dimensions: estimateData.roomDimensions,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      if ('id' in estimateData) {
        // Update existing estimate
        const { error } = await supabase
          .from('estimates')
          .update(dbEstimate)
          .eq('id', estimateData.id);

        if (error) throw error;

        setEstimates(prev => 
          prev.map(est => est.id === estimateData.id ? estimateData as Estimate : est)
        );
      } else {
        // Create new estimate
        const { data, error } = await supabase
          .from('estimates')
          .insert([{ ...dbEstimate, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('No data returned from insert');

        // Convert back to frontend format
        const newEstimate: Estimate = {
          id: data.id,
          clientId: data.client_id,
          clientName: data.client_name,
          status: data.status,
          date: data.date,
          items: data.items || [],
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          notes: data.notes || '',
          rooms: data.rooms || [],
          roomDimensions: data.room_dimensions || {}
        };

        setEstimates(prev => [newEstimate, ...prev]);
      }

      setIsModalOpen(false);
      setEditingEstimate(null);
    } catch (err) {
      console.error('Error saving estimate:', err);
      throw new Error(handleSupabaseError(err));
    }
  };

  const handleDeleteEstimate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEstimates(prev => prev.filter(est => est.id !== id));
    } catch (err) {
      console.error('Error deleting estimate:', err);
      throw new Error(handleSupabaseError(err));
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || estimate.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredEstimates.reduce((sum, est) => sum + est.total, 0);

  return (
    <div className="p-6">
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={loadEstimates}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
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
      )}

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
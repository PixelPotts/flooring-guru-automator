import React, { createContext, useContext, useState, useEffect } from 'react';
import { Estimate } from '../types/estimate';
import { supabase, retryOperation, handleSupabaseError } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface EstimateContextType {
  estimates: Estimate[];
  loading: boolean;
  error: string | null;
  addEstimate: (estimate: Omit<Estimate, 'id'>) => Promise<void>;
  updateEstimate: (estimate: Estimate) => Promise<void>;
  deleteEstimate: (id: string) => Promise<void>;
  refreshEstimates: () => Promise<void>;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export const useEstimates = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimates must be used within an EstimateProvider');
  }
  return context;
};

export const EstimateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const loadEstimates = async () => {
    if (!currentUser) {
      setEstimates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await retryOperation(() =>
        supabase
          .from('estimates')
          .select('*')
          .eq('created_by', currentUser.id)
          .order('created_at', { ascending: false })
      );

      if (error) throw error;

      // Convert database field names to frontend format
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
      // Set empty array on error to prevent undefined state
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadEstimates();
    } else {
      // Reset state when user logs out
      setEstimates([]);
      setLoading(false);
      setError(null);
    }
  }, [currentUser]);

  const addEstimate = async (estimateData: Omit<Estimate, 'id'>) => {
    try {
      if (!currentUser) throw new Error('Not authenticated');

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
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await retryOperation(() =>
        supabase
          .from('estimates')
          .insert([dbEstimate])
          .select()
          .single()
      );

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
    } catch (err) {
      console.error('Error adding estimate:', err);
      throw err;
    }
  };

  const updateEstimate = async (estimate: Estimate) => {
    try {
      if (!currentUser) throw new Error('Not authenticated');

      // Convert frontend field names to database format
      const dbEstimate = {
        client_id: estimate.clientId,
        client_name: estimate.clientName,
        status: estimate.status,
        date: estimate.date,
        items: estimate.items,
        subtotal: estimate.subtotal,
        tax: estimate.tax,
        total: estimate.total,
        notes: estimate.notes,
        rooms: estimate.rooms,
        room_dimensions: estimate.roomDimensions,
        updated_at: new Date().toISOString()
      };

      const { error } = await retryOperation(() =>
        supabase
          .from('estimates')
          .update(dbEstimate)
          .eq('id', estimate.id)
      );

      if (error) throw error;

      setEstimates(prev => 
        prev.map(est => est.id === estimate.id ? estimate : est)
      );
    } catch (err) {
      console.error('Error updating estimate:', err);
      throw err;
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      if (!currentUser) throw new Error('Not authenticated');

      const { error } = await retryOperation(() =>
        supabase
          .from('estimates')
          .delete()
          .eq('id', id)
      );

      if (error) throw error;

      setEstimates(prev => prev.filter(est => est.id !== id));
    } catch (err) {
      console.error('Error deleting estimate:', err);
      throw err;
    }
  };

  const value = {
    estimates,
    loading,
    error,
    addEstimate,
    updateEstimate,
    deleteEstimate,
    refreshEstimates: loadEstimates
  };

  return (
    <EstimateContext.Provider value={value}>
      {children}
    </EstimateContext.Provider>
  );
};
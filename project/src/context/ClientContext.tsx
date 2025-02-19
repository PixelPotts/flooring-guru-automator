import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '../types/client';
import { supabase, handleSupabaseError, retryOperation } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'> | Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const loadClients = async () => {
    if (!currentUser) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await retryOperation(() =>
        supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (error) throw error;

      // Ensure we always set a valid array
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(handleSupabaseError(err));
      // Set empty array on error to prevent undefined state
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadClients();
    } else {
      // Reset state when user logs out
      setClients([]);
      setLoading(false);
      setError(null);
    }
  }, [currentUser]);

  const addClient = async (client: Omit<Client, 'id'> | Client) => {
    try {
      setError(null);
      
      if (!currentUser) throw new Error('No authenticated user');

      // If the client already has an ID and exists in our list, update instead
      if ('id' in client && clients.some(c => c.id === client.id)) {
        await updateClient(client as Client);
        return;
      }

      // If the client has a GHL contact ID, check if it exists
      if ('ghl_contact_id' in client && client.ghl_contact_id) {
        const existingClient = clients.find(c => c.ghl_contact_id === client.ghl_contact_id);
        if (existingClient) {
          await updateClient({ ...existingClient, ...client } as Client);
          return;
        }
      }

      const { data, error } = await retryOperation(() =>
        supabase
          .from('clients')
          .insert([{
            ...client,
            created_by: currentUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
      );

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      setClients(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding client:', err);
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const updateClient = async (client: Client) => {
    try {
      setError(null);

      const { error } = await retryOperation(() =>
        supabase
          .from('clients')
          .update({
            ...client,
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id)
      );

      if (error) throw error;

      setClients(prev => 
        prev.map(c => c.id === client.id ? client : c)
      );
    } catch (err) {
      console.error('Error updating client:', err);
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setError(null);

      const { error } = await retryOperation(() =>
        supabase
          .from('clients')
          .delete()
          .eq('id', id)
      );

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const value = {
    clients,
    addClient,
    updateClient,
    deleteClient,
    loading,
    error,
    reload: loadClients
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
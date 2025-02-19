import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddClientModal from './clients/AddClientModal';
import ClientCard from './clients/ClientCard';
import { useClients } from '../context/ClientContext';
import { ghlService } from '../services/ghl';
import { supabase } from '../lib/supabase';

interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
}

const Clients: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ghlContacts, setGHLContacts] = useState<GHLContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showGHLResults, setShowGHLResults] = useState(false);
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [isGHLConnected, setIsGHLConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    checkGHLConnection();
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const checkGHLConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('ghl_settings')
        .select('*')
        .eq('created_by', user.id)
        .limit(1)
        .single();

      setIsGHLConnected(!!data);
    } catch (error) {
      console.error('Error checking GHL connection:', error);
      setIsGHLConnected(false);
    }
  };

  const searchGHLContacts = async (query: string) => {
    if (!query || typeof query !== 'string' || !query.trim() || !isGHLConnected) {
      setGHLContacts([]);
      setShowGHLResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const contacts = await ghlService.searchContacts(query.trim());
      if (Array.isArray(contacts)) {
        // Filter out invalid contacts and transform data
        const validContacts = contacts
          .filter(contact => contact && contact.id)
          .map(contact => ({
            id: contact.id,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            email: contact.email || '',
            phone: contact.phone || '',
            address: contact.address || '',
            companyName: contact.companyName || ''
          }));
        
        setGHLContacts(validContacts);
        setShowGHLResults(validContacts.length > 0);
      } else {
        throw new Error('Invalid response format from GHL');
      }
    } catch (error) {
      console.error('Error searching GHL contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search contacts';
      setError(errorMessage);
      setShowGHLResults(false);
      setGHLContacts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => searchGHLContacts(query), 300);
    } else {
      setShowGHLResults(false);
      setGHLContacts([]);
    }
  };

  const handleImportContact = async (contact: GHLContact) => {
    try {
      const { data, error } = await supabase.rpc('import_ghl_contact', {
        contact_data: {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          companyName: contact.companyName
        }
      });

      if (error) throw error;

      if (data) {
        await addClient(data);
      }

      setShowGHLResults(false);
      setSearchQuery('');
      setGHLContacts([]);
      setError(null);
    } catch (error) {
      console.error('Error importing GHL contact:', error);
      setError(error instanceof Error ? error.message : 'Failed to import contact');
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = client.name?.toLowerCase().includes(searchLower) || false;
    const companyMatch = client.company?.toLowerCase().includes(searchLower) || false;
    return nameMatch || companyMatch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Client
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={isGHLConnected ? "Search clients or GHL contacts..." : "Search clients..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <AnimatePresence>
            {showGHLResults && ghlContacts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
              >
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    GHL Contacts
                  </h3>
                </div>
                {ghlContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleImportContact(contact)}
                    className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.companyName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contact.companyName}
                        </p>
                      )}
                      {contact.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.email}
                        </p>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.phone}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={updateClient}
            onDelete={deleteClient}
          />
        ))}
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addClient}
      />
    </div>
  );
};

export default Clients;
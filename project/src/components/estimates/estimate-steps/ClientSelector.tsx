import React from 'react';
import { Client } from '../../../types/client';
import { Mail, Phone, Building2 } from 'lucide-react';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  onClientSelect: (clientId: string, clientName: string) => void;
  onNext: () => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  selectedClientId,
  onClientSelect,
  onNext
}) => {
  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      onClientSelect(client.id, client.name);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Client
      </label>
      <select
        value={selectedClientId}
        onChange={(e) => handleClientChange(e.target.value)}
        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name} {client.company ? `- ${client.company}` : ''}
          </option>
        ))}
      </select>

      {selectedClient && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            {selectedClient.company || 'No Company'}
          </h3>
          <div className="space-y-2">
            {selectedClient.email && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <a href={`mailto:${selectedClient.email}`} className="hover:text-blue-600 truncate">
                  {selectedClient.email}
                </a>
              </div>
            )}
            {selectedClient.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <a href={`tel:${selectedClient.phone}`} className="hover:text-blue-600">
                  {selectedClient.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedClientId}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Next: Add Items
        </button>
      </div>
    </div>
  );
};

export default ClientSelector;
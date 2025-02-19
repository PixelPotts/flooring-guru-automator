import React, { useState } from 'react';
import { MapPin, Phone, Mail, Edit, Trash, Bot, Building2, Calendar, DollarSign, BarChart2, Clock, MessageSquare, FileText, Star, TrendingUp, AlertCircle, Plus, Save, FileSpreadsheet, Send, RefreshCw, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Client } from '../../types/client';
import EditClientModal from './EditClientModal';
import AIAssistant from '../AIAssistant';
import ConversationModal from '../conversations/ConversationModal';
import SMSModal from '../messages/SMSModal';
import { ghlService } from '../../services/ghl';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleCreateEstimate = () => {
    navigate('/estimates', {
      state: {
        newEstimate: {
          clientId: client.id,
          clientName: client.name,
          status: 'draft',
          date: new Date().toISOString().split('T')[0],
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          notes: `Estimate for ${client.name} from ${client.company}\nContact: ${client.phone} / ${client.email}\nAddress: ${client.address}`,
          rooms: client.rooms || []
        }
      }
    });
  };

  const handleSync = async () => {
    if (!client.ghl_contact_id) {
      setSyncError('No GHL contact ID found');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const contacts = await ghlService.searchContacts(client.ghl_contact_id);
      const ghlContact = contacts.find(c => c.id === client.ghl_contact_id);
      
      if (!ghlContact) {
        throw new Error('Contact not found in GHL');
      }

      // Update client with latest GHL data
      const updatedClient = {
        ...client,
        name: `${ghlContact.firstName} ${ghlContact.lastName}`.trim(),
        company: ghlContact.companyName || client.company,
        email: ghlContact.email || client.email,
        phone: ghlContact.phone || client.phone,
        address: ghlContact.address || client.address,
        ghl_data: ghlContact
      };

      await onEdit(updatedClient);
    } catch (error) {
      console.error('Error syncing contact:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to sync contact');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                {client.status === 'Active' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-1 -right-1" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{client.company}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              {client.email && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${client.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${client.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {client.ghl_contact_id && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`p-2 rounded-lg transition-colors ${
                  isSyncing
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30'
                }`}
                title="Sync with GHL"
              >
                <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30"
              title="AI Assistant"
            >
              <Bot className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>

              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                >
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client
                  </button>
                  <button
                    onClick={() => {
                      onDelete(client.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Client
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {syncError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {syncError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                client.type === 'Commercial' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
              }`}>
                {client.type}
              </span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                client.status === 'Active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
        </div>

        {client.rooms && client.rooms.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Room Dimensions</h4>
            <div className="space-y-2">
              {client.rooms.map((room, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {room.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {room.sqft} sq ft
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {room.length}' × {room.width}'
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = `mailto:${client.email}`}
            className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
          >
            <Mail className="h-4 w-4 inline-block mr-2" />
            Email
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = `tel:${client.phone}`}
            className="flex-1 py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
          >
            <Phone className="h-4 w-4 inline-block mr-2" />
            Call
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSMSModalOpen(true)}
            className="flex-1 py-2 px-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium"
          >
            <Send className="h-4 w-4 inline-block mr-2" />
            SMS
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsConversationModalOpen(true)}
            className="flex-1 py-2 px-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4 inline-block mr-2" />
            Chat
          </motion.button>
        </div>

        {/* Create Estimate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateEstimate}
          className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          Create Estimate
        </motion.button>
      </div>

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={onEdit}
        client={client}
      />

      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        client={client}
      />

      <ConversationModal
        isOpen={isConversationModalOpen}
        onClose={() => setIsConversationModalOpen(false)}
        client={client}
      />

      <SMSModal
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
        client={client}
      />
    </motion.div>
  );
};

export default ClientCard;
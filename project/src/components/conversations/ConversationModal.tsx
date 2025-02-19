import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader, AlertCircle } from 'lucide-react';
import { Client } from '../../types/client';
import { Conversation } from '../../types/conversation';
import { ghlConversationsService } from '../../services/ghlConversations';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && client.ghl_contact_id) {
      loadConversations();
    }
  }, [isOpen, client.ghl_contact_id]);

  const loadConversations = async () => {
    if (!client.ghl_contact_id) return;

    setLoading(true);
    setError(null);

    try {
      const results = await ghlConversationsService.searchConversations({
        contactId: client.ghl_contact_id,
        limit: 50
      });
      setConversations(results);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleStarConversation = async (conversation: Conversation) => {
    try {
      const updated = await ghlConversationsService.updateConversation(
        conversation.id,
        { starred: !conversation.starred }
      );
      setConversations(prev =>
        prev.map(conv =>
          conv.id === updated.id ? updated : conv
        )
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {client.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
              onStar={handleStarConversation}
            />
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
                onStar={handleStarConversation}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ConversationModal;
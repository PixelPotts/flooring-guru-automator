import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader, AlertCircle } from 'lucide-react';
import { Client } from '../../types/client';
import { ghlMessagesService } from '../../services/ghlMessages';

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const SMSModal: React.FC<SMSModalProps> = ({ isOpen, onClose, client }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      await ghlMessagesService.sendMessage({
        type: 'SMS',
        contactId: client.ghl_contact_id || '',
        message: message.trim()
      });

      setMessage('');
      onClose();
    } catch (err) {
      console.error('Error sending SMS:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Send SMS
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To: {client.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {message.length}/160 characters
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSending ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send SMS
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SMSModal;
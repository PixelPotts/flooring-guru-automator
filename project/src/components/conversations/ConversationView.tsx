import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, Phone, Mail, MessageCircle, Clock, Loader } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { Message, ghlMessagesService } from '../../services/ghlMessages';
import { formatDistanceToNow } from '../../utils/date';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
  onStar: (conversation: Conversation) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
  onStar
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await ghlMessagesService.getMessages(conversation.id, {
        limit: 50
      });
      setMessages(results);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    try {
      // Upload attachments first if any
      let attachmentUrls: string[] = [];
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const urls = await ghlMessagesService.uploadAttachment(conversation.id, file);
          attachmentUrls = [...attachmentUrls, ...urls];
        }
      }

      // Send message
      await ghlMessagesService.sendMessage({
        type: conversation.type === 'TYPE_EMAIL' ? 'Email' : 'SMS',
        contactId: conversation.contactId,
        message,
        attachments: attachmentUrls
      });

      // Reload messages
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleDownloadRecording = async (messageId: string) => {
    try {
      const blob = await ghlMessagesService.getRecording(messageId, conversation.locationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${messageId}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading recording:', error);
    }
  };

  const handleViewTranscript = async (messageId: string) => {
    try {
      const transcription = await ghlMessagesService.getTranscription(
        messageId,
        conversation.locationId
      );
      // You could show this in a modal or add it to the message display
      console.log('Transcription:', transcription);
    } catch (error) {
      console.error('Error getting transcription:', error);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'TYPE_PHONE':
        return <Phone className="h-5 w-5" />;
      case 'TYPE_EMAIL':
        return <Mail className="h-5 w-5" />;
      case 'TYPE_FB_MESSENGER':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {getMessageIcon(conversation.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {conversation.type.replace('TYPE_', '').replace('_', ' ')}
              </h3>
              {conversation.lastMessageDate && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(conversation.lastMessageDate))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onStar(conversation)}
          className={`p-2 rounded-lg transition-colors ${
            conversation.starred
              ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Star className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <MessageList
            messages={messages}
            onDownloadRecording={handleDownloadRecording}
            onViewTranscript={handleViewTranscript}
          />
        )}
      </div>

      <MessageComposer
        onSend={handleSendMessage}
        messageType={conversation.type === 'TYPE_EMAIL' ? 'Email' : 'SMS'}
      />
    </div>
  );
};

export default ConversationView;
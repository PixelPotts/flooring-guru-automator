import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Clock, Phone, Mail, MessageCircle, AlertCircle } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { formatDistanceToNow } from '../../utils/date';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onStar: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onStar
}) => {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'TYPE_PHONE':
        return <Phone className="h-4 w-4" />;
      case 'TYPE_EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'TYPE_FB_MESSENGER':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-3 rounded-lg ${
            selectedId === conversation.id
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              onClick={() => onSelect(conversation)}
              className="flex-1 flex items-start space-x-3 cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${
                conversation.unreadCount > 0
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {getMessageIcon(conversation.type)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {conversation.type.replace('TYPE_', '').replace('_', ' ')}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                {conversation.lastMessageBody && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                    {conversation.lastMessageBody}
                  </p>
                )}
                {conversation.lastMessageDate && (
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(conversation.lastMessageDate))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onStar(conversation)}
              className={`p-1 rounded-full transition-colors ${
                conversation.starred
                  ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Star className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {conversations.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No conversations found</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
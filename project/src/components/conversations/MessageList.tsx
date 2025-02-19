import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, Download, FileText, Clock, AlertCircle } from 'lucide-react';
import { Message } from '../../services/ghlMessages';
import { formatDistanceToNow } from '../../utils/date';

interface MessageListProps {
  messages: Message[];
  onDownloadRecording?: (messageId: string) => void;
  onViewTranscript?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages = [], // Provide default empty array
  onDownloadRecording,
  onViewTranscript
}) => {
  // Early return with message if no messages
  if (!Array.isArray(messages)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <AlertCircle className="h-5 w-5 mr-2" />
        No messages to display
      </div>
    );
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'TYPE_CALL':
        return <Phone className="h-4 w-4" />;
      case 'TYPE_EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'TYPE_FB_MESSENGER':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          No messages yet
        </div>
      ) : (
        messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.direction === 'outbound' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-[80%] ${
              message.direction === 'outbound'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            } rounded-lg p-4 space-y-2`}>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  {getMessageIcon(message.messageType)}
                  <span className="text-sm font-medium">
                    {message.messageType.replace('TYPE_', '').replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center text-xs opacity-75">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(message.dateAdded))}
                </div>
              </div>

              {message.body && (
                <p className="whitespace-pre-line">{message.body}</p>
              )}

              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        message.direction === 'outbound'
                          ? 'bg-blue-500 hover:bg-blue-400'
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                      } transition-colors`}
                    >
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              )}

              {message.messageType === 'TYPE_CALL' && (
                <div className="flex items-center space-x-2 mt-2">
                  {onDownloadRecording && (
                    <button
                      onClick={() => onDownloadRecording(message.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                        message.direction === 'outbound'
                          ? 'bg-blue-500 hover:bg-blue-400'
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                      } transition-colors`}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Recording
                    </button>
                  )}
                  {onViewTranscript && (
                    <button
                      onClick={() => onViewTranscript(message.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                        message.direction === 'outbound'
                          ? 'bg-blue-500 hover:bg-blue-400'
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                      } transition-colors`}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Transcript
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default MessageList;
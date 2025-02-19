import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, DollarSign, Calendar, ChevronDown, ChevronUp, Edit, Trash, Send, Eye, MessageSquare } from 'lucide-react';
import { Estimate } from '../../types/estimate';
import EstimateShareButton from './EstimateShareButton';
import { formatDistanceToNow } from 'date-fns';

interface EstimateCardProps {
  estimate: Estimate;
  onUpdate: (estimate: Estimate) => void;
  onDelete: (id: string) => void;
}

const EstimateCard: React.FC<EstimateCardProps> = ({ estimate, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {estimate.clientName}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(estimate.date).toLocaleDateString()}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
            {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(estimate.total)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400">Items</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {estimate.items.length}
            </p>
          </div>
        </div>

        {estimate.rooms && estimate.rooms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {estimate.rooms.map((room, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs"
              >
                {room}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {estimate.clientViewedAt && (
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Viewed {formatDistanceToNow(new Date(estimate.clientViewedAt))}
              </div>
            )}
            {estimate.clientRespondedAt && (
              <div className="flex items-center mt-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                Responded {formatDistanceToNow(new Date(estimate.clientRespondedAt))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {estimate.shareUrl && (
              <a
                href={estimate.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="View Estimate"
              >
                <Eye className="h-5 w-5" />
              </a>
            )}
            <EstimateShareButton
              estimate={estimate}
              onShareGenerated={(shareUrl) => {
                onUpdate({
                  ...estimate,
                  shareUrl
                });
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 mt-4"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {estimate.items.filter(item => item.type === 'material').map((item) => (
              <div
                key={item.id}
                className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              </div>
            ))}

            {estimate.items.filter(item => item.type === 'labor').map((item) => (
              <div
                key={item.id}
                className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.hours} hrs × {formatCurrency(item.hourlyRate || 0)}/hr
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              </div>
            ))}

            {estimate.notes && (
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {estimate.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-2">
        <button
          onClick={() => onDelete(estimate.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          title="Delete"
        >
          <Trash className="h-5 w-5" />
        </button>
        <button
          onClick={() => onUpdate(estimate)}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          title="Edit"
        >
          <Edit className="h-5 w-5" />
        </button>
        {estimate.status === 'draft' && (
          <button
            onClick={() => onUpdate({ ...estimate, status: 'pending' })}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-1" />
            <span className="text-sm">Send</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EstimateCard;
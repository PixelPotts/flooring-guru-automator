import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AIInteractionLog: React.FC = () => {
  const interactions = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      type: 'Estimate Request',
      summary: 'AI generated flooring estimate for living room and dining area',
      outcome: 'Appointment Scheduled',
      date: '2h ago',
      status: 'completed'
    },
    {
      id: 2,
      clientName: 'Mike Williams',
      type: 'Product Inquiry',
      summary: 'Discussed hardwood flooring options and maintenance',
      outcome: 'Follow-up Required',
      date: '4h ago',
      status: 'pending'
    },
    {
      id: 3,
      clientName: 'Emma Davis',
      type: 'Quote Comparison',
      summary: 'Compared different flooring materials and installation costs',
      outcome: 'Quote Sent',
      date: '6h ago',
      status: 'completed'
    },
    {
      id: 4,
      clientName: 'John Smith',
      type: 'Scheduling',
      summary: 'Discussed availability for installation next week',
      outcome: 'Pending Confirmation',
      date: '1d ago',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <motion.div
          key={interaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${
                interaction.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/20'
                  : 'bg-yellow-100 dark:bg-yellow-900/20'
              }`}>
                <MessageSquare className={`h-5 w-5 ${
                  interaction.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {interaction.clientName}
                  </h3>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {interaction.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {interaction.summary}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-sm">
                    {interaction.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                    )}
                    <span className={`${
                      interaction.status === 'completed'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {interaction.outcome}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {interaction.date}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {interaction.status === 'pending' && (
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30">
                  Follow Up
                </button>
              )}
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AIInteractionLog;
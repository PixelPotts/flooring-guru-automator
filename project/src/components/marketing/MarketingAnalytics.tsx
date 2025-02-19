import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, MessageSquare, Calendar, Users } from 'lucide-react';
import LeadSourceChart from './LeadSourceChart';
import ConversionMetrics from './ConversionMetrics';
import AIInteractionLog from './AIInteractionLog';
import DateRangePicker from '../shared/DateRangePicker';

const MarketingAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track lead sources, conversions, and AI interactions</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Total Leads',
            value: '247',
            change: '+12.5%',
            icon: Users,
            color: 'blue'
          },
          {
            title: 'Booking Rate',
            value: '35.8%',
            change: '+5.2%',
            icon: Calendar,
            color: 'green'
          },
          {
            title: 'Close Rate',
            value: '28.4%',
            change: '+3.7%',
            icon: TrendingUp,
            color: 'purple'
          },
          {
            title: 'Avg. Ticket',
            value: '$4,850',
            change: '+8.3%',
            icon: BarChart3,
            color: 'amber'
          }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-900/20 rounded-lg`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
              <span className={`text-sm font-medium ${
                metric.change.startsWith('+') 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lead Sources Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total: 247</span>
            </div>
          </div>
          <LeadSourceChart />
        </motion.div>

        {/* Conversion Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversion Metrics</h2>
          </div>
          <ConversionMetrics />
        </motion.div>
      </div>

      {/* AI Interaction Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Interactions</h2>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View All
          </button>
        </div>
        <AIInteractionLog />
      </motion.div>
    </div>
  );
};

export default MarketingAnalytics;
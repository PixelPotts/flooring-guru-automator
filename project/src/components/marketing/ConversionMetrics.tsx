import React from 'react';
import { BarChart, Calendar, DollarSign } from 'lucide-react';

const ConversionMetrics: React.FC = () => {
  const metrics = [
    {
      title: 'Lead to Booking',
      current: 35.8,
      previous: 30.6,
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Booking to Sale',
      current: 28.4,
      previous: 24.7,
      icon: BarChart,
      color: 'green'
    },
    {
      title: 'Revenue per Lead',
      current: 1375,
      previous: 1250,
      icon: DollarSign,
      color: 'purple',
      isCurrency: true
    }
  ];

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 bg-${metric.color}-100 dark:bg-${metric.color}-900/20 rounded-lg mr-3`}>
                <metric.icon className={`h-5 w-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {metric.title}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metric.isCurrency ? '$' : ''}{metric.current.toLocaleString()}{metric.isCurrency ? '' : '%'}
              </p>
              <p className={`text-sm ${
                metric.current > metric.previous
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {((metric.current - metric.previous) / metric.previous * 100).toFixed(1)}% vs last period
              </p>
            </div>
          </div>
          
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
            <div
              className={`h-full bg-${metric.color}-500 rounded-full`}
              style={{ width: `${metric.isCurrency ? (metric.current / 2000 * 100) : metric.current}%` }}
            />
          </div>
        </div>
      ))}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Conversion Timeline
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lead Generated</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">Day 0</span>
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '35.8%' }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Booking Scheduled</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">Day 2</span>
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '28.4%' }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sale Closed</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">Day 7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionMetrics;
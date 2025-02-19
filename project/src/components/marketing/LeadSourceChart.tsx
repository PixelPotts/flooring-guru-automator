import React from 'react';
import { PieChart, Phone, Mail, Globe, MessageSquare, Users } from 'lucide-react';

const LeadSourceChart: React.FC = () => {
  const leadSources = [
    { 
      name: 'Google Ads',
      count: 82,
      bookingRate: '38%',
      closeRate: '31%',
      avgTicket: '$5,200',
      icon: Globe,
      color: 'blue'
    },
    {
      name: 'Direct Calls',
      count: 64,
      bookingRate: '42%',
      closeRate: '35%',
      avgTicket: '$4,800',
      icon: Phone,
      color: 'green'
    },
    {
      name: 'Website Form',
      count: 45,
      bookingRate: '33%',
      closeRate: '26%',
      avgTicket: '$4,500',
      icon: Mail,
      color: 'purple'
    },
    {
      name: 'Referrals',
      count: 36,
      bookingRate: '45%',
      closeRate: '38%',
      avgTicket: '$5,500',
      icon: Users,
      color: 'amber'
    },
    {
      name: 'Chat Widget',
      count: 20,
      bookingRate: '30%',
      closeRate: '22%',
      avgTicket: '$4,200',
      icon: MessageSquare,
      color: 'pink'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-center">
          <PieChart className="h-48 w-48 text-gray-300 dark:text-gray-600" />
        </div>
        <div className="space-y-4">
          {leadSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 bg-${source.color}-100 dark:bg-${source.color}-900/20 rounded-lg mr-3`}>
                  <source.icon className={`h-4 w-4 text-${source.color}-600 dark:text-${source.color}-400`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{source.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{source.count} leads</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{source.bookingRate}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">booking rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                <th className="pb-2">Source</th>
                <th className="pb-2">Close Rate</th>
                <th className="pb-2">Avg. Ticket</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {leadSources.map((source, index) => (
                <tr key={index}>
                  <td className="py-2 text-gray-900 dark:text-white">{source.name}</td>
                  <td className="py-2 text-gray-900 dark:text-white">{source.closeRate}</td>
                  <td className="py-2 text-gray-900 dark:text-white">{source.avgTicket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadSourceChart;
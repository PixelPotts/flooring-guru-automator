import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import EstimateCard from './EstimateCard';
import { Estimate } from '../../types/estimate';
import { useState } from 'react';
import OpenAI from 'openai';

interface EstimateListProps {
  estimates: Estimate[];
  onCreateEstimate: () => void;
  onUpdateEstimate: (estimate: Estimate) => void;
  onDeleteEstimate: (id: string) => void;
}

const EstimateList: React.FC<EstimateListProps> = ({
  estimates,
  onCreateEstimate,
  onUpdateEstimate,
  onDeleteEstimate
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const generateAIRecommendations = async () => {
    setIsGeneratingAI(true);
    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a flooring business optimization expert. Analyze estimates and suggest improvements."
          },
          {
            role: "user",
            content: `Analyze these estimates: ${JSON.stringify(estimates)}`
          }
        ]
      });

      // Process AI suggestions
      if (completion.choices[0].message.content) {
        // Implement suggestion handling
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        estimate.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || estimate.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredEstimates.reduce((sum, est) => sum + est.total, 0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Estimates ({filteredEstimates.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Value: {formatCurrency(totalValue)}
          </p>
        </div>
        <button
          onClick={onCreateEstimate}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Estimate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-32 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Estimates List */}
      <div className="space-y-4">
        {filteredEstimates.map((estimate) => (
          <EstimateCard
            key={estimate.id}
            estimate={estimate}
            onUpdate={onUpdateEstimate}
            onDelete={onDeleteEstimate}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEstimates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery
              ? `No estimates match your search "${searchQuery}"`
              : "No estimates yet"}
          </p>
          <button
            onClick={onCreateEstimate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 inline-block mr-2" />
            Create First Estimate
          </button>
        </div>
      )}
    </div>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default EstimateList;
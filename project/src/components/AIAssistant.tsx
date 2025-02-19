import React, { useState, useEffect } from 'react';
import { X, Send, Bot, MessageSquare, RefreshCw } from 'lucide-react';
import { Client } from '../types/client';
import { useNavigate } from 'react-router-dom';
import { EstimateItem } from '../types/estimate';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

interface MaterialSuggestion {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
}

interface LaborSuggestion {
  name: string;
  hours: number;
  rate: number;
  total: number;
  description?: string;
}

interface ClientAnalysis {
  recommendations: string[];
  estimateSuggestions: {
    materials: MaterialSuggestion[];
    labor: LaborSuggestion[];
    totalEstimate: number;
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, client }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ClientAnalysis | null>(null);
  const [currentSuggestionSet, setCurrentSuggestionSet] = useState(0);

  useEffect(() => {
    if (isOpen && client) {
      generateInitialAnalysis();
    } else {
      // Reset state when closing or no client
      setMessages([]);
      setAnalysis(null);
      setCurrentSuggestionSet(0);
    }
  }, [isOpen, client]);

  const generateInitialAnalysis = async () => {
    if (!client) return;

    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const suggestions = generateSuggestions();
      const analysis: ClientAnalysis = {
        recommendations: [
          "Based on the client's history, they prefer premium materials",
          "Previous projects show a preference for hardwood flooring",
          "Client typically approves estimates within the $8-12k range",
          "Client values quality over price point",
          "Recommend scheduling work during weekdays",
          "Client prefers detailed project timelines",
          "Previous successful upsells with premium underlayment",
          "Client appreciates regular project updates",
          "Consider offering extended warranty options",
          "Past projects indicate preference for natural wood tones"
        ],
        estimateSuggestions: suggestions
      };

      setAnalysis(analysis);
      setMessages([{
        type: 'assistant',
        content: `Hello! I've analyzed ${client.name}'s profile and history. Here are my key insights:\n\n` +
          analysis.recommendations.slice(0, 5).join('\n\n') +
          '\n\nI\'ve generated some material and labor suggestions. Would you like to create an estimate based on these?'
      }]);
    } catch (error) {
      console.error('Error generating analysis:', error);
      setMessages([{
        type: 'assistant',
        content: 'I apologize, but I encountered an error analyzing the client data. Please try again.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSuggestions = () => {
    const materials = [
      { name: "Premium Oak Hardwood", quantity: 500, unitPrice: 12.99, total: 6495, description: "High-end oak flooring with natural finish" },
      { name: "Premium Underlayment", quantity: 500, unitPrice: 1.50, total: 750, description: "Moisture-resistant premium underlayment" },
      { name: "Luxury Vinyl Planks", quantity: 500, unitPrice: 8.99, total: 4495, description: "Waterproof luxury vinyl with wood look" },
      { name: "Porcelain Tile", quantity: 500, unitPrice: 9.99, total: 4995, description: "High-durability porcelain tiles" },
      { name: "Natural Stone Tile", quantity: 500, unitPrice: 15.99, total: 7995, description: "Premium natural stone flooring" }
    ];

    const labor = [
      { name: "Professional Installation", hours: 40, rate: 75, total: 3000, description: "Expert flooring installation" },
      { name: "Floor Preparation", hours: 8, rate: 65, total: 520, description: "Subfloor preparation and leveling" },
      { name: "Furniture Moving", hours: 4, rate: 55, total: 220, description: "Careful furniture relocation" },
      { name: "Old Flooring Removal", hours: 6, rate: 60, total: 360, description: "Removal and disposal of existing flooring" },
      { name: "Baseboard Installation", hours: 8, rate: 70, total: 560, description: "New baseboard installation" }
    ];

    // Apply variation based on current suggestion set
    const variation = 1 + (currentSuggestionSet * 0.1);
    const adjustedMaterials = materials.map(m => ({
      ...m,
      unitPrice: parseFloat((m.unitPrice * variation).toFixed(2)),
      total: parseFloat((m.total * variation).toFixed(2))
    }));

    const adjustedLabor = labor.map(l => ({
      ...l,
      rate: parseFloat((l.rate * variation).toFixed(2)),
      total: parseFloat((l.total * variation).toFixed(2))
    }));

    return {
      materials: adjustedMaterials,
      labor: adjustedLabor,
      totalEstimate: [...adjustedMaterials, ...adjustedLabor].reduce((sum, item) => sum + item.total, 0)
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      let response = '';
      if (input.toLowerCase().includes('estimate')) {
        response = "I'll help you create an estimate based on the analysis. Would you like me to proceed?";
      } else if (input.toLowerCase().includes('recommend')) {
        response = analysis?.recommendations.join('\n\n') || 
                  "I'll analyze the client's preferences and provide recommendations.";
      } else if (input.toLowerCase().includes('more') || input.toLowerCase().includes('different')) {
        handleRegenerateSuggestions();
        return;
      } else {
        response = "I'm here to help! I can:\n" +
                  "- Create an estimate based on client history\n" +
                  "- Provide recommendations\n" +
                  "- Generate different material and labor suggestions\n" +
                  "- Analyze previous projects\n" +
                  "What would you like to know?";
      }
      
      setMessages(prev => [...prev, { type: 'assistant', content: response }]);
    }, 1000);
  };

  const handleRegenerateSuggestions = () => {
    setCurrentSuggestionSet((prev) => prev + 1);
    const newSuggestions = generateSuggestions();
    
    setAnalysis(prev => ({
      ...prev!,
      estimateSuggestions: newSuggestions
    }));

    setMessages(prev => [...prev, {
      type: 'assistant',
      content: 'I\'ve generated new suggestions based on the client\'s preferences. Would you like to create an estimate with these items?'
    }]);
  };

  const handleCreateEstimate = () => {
    if (!analysis || !client) return;

    const estimateItems: EstimateItem[] = [
      ...analysis.estimateSuggestions.materials.map(material => ({
        id: Date.now().toString() + Math.random(),
        description: material.name,
        area: material.quantity,
        unitPrice: material.unitPrice,
        quantity: material.quantity,
        total: material.total,
        type: 'material',
        materialType: 'Premium',
        brand: 'Premium Brand',
        room: 'Main Room'
      })),
      ...analysis.estimateSuggestions.labor.map(labor => ({
        id: Date.now().toString() + Math.random(),
        description: labor.name,
        area: 0,
        unitPrice: labor.rate,
        quantity: labor.hours,
        total: labor.total,
        type: 'labor',
        laborType: 'Installation',
        hourlyRate: labor.rate,
        hours: labor.hours,
        room: 'Main Room'
      }))
    ];

    const estimateData = {
      clientId: client.id,
      clientName: client.name,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      items: estimateItems,
      subtotal: analysis.estimateSuggestions.totalEstimate,
      tax: analysis.estimateSuggestions.totalEstimate * 0.08,
      total: analysis.estimateSuggestions.totalEstimate * 1.08,
      notes: `AI Generated Estimate for ${client.name}\n\nRecommendations:\n${analysis.recommendations.slice(0, 5).join('\n')}`,
      rooms: ['Main Room']
    };

    onClose();
    navigate('/estimates', { state: { newEstimate: estimateData } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Assistant {client && `- ${client.name}`}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRegenerateSuggestions}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Generate new suggestions"
            >
              <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing client data...</p>
              </div>
            </div>
          ) : !client ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Please select a client to start the conversation
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {client && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={handleCreateEstimate}
                disabled={!analysis}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Create Estimate
              </button>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
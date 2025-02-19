import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader, Bot } from 'lucide-react';
import { EstimateItem } from '../../types/estimate';
import OpenAI from 'openai';

interface AIEstimateGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: EstimateItem[]) => void;
  type: 'materials' | 'labor';
}

const AIEstimateGenerator: React.FC<AIEstimateGeneratorProps> = ({
  isOpen,
  onClose,
  onAddItems,
  type
}) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EstimateItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const generateSuggestions = async () => {
    if (!projectDescription.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate ${type === 'materials' ? 'material' : 'labor'} suggestions for a flooring project. Return a JSON array with the structure:
            {
              "items": [
                {
                  "type": "${type}",
                  "description": string,
                  "quantity": number,
                  "unitPrice": number,
                  "materialType"?: string,
                  "brand"?: string,
                  "laborType"?: string,
                  "hourlyRate"?: number,
                  "hours"?: number,
                  "room": string
                }
              ]
            }`
          },
          {
            role: "user",
            content: projectDescription
          }
        ]
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error('No response from AI');

      try {
        const result = JSON.parse(response);
        if (!Array.isArray(result.items)) throw new Error('Invalid response format');

        const items: EstimateItem[] = result.items.map(item => {
          if (!item.quantity || !item.unitPrice) {
            throw new Error('Invalid item data: missing quantity or unit price');
          }

          const total = Math.round(item.quantity * item.unitPrice * 100) / 100;
          
          return {
            id: Date.now().toString() + Math.random(),
            description: item.description || 'No description',
            area: type === 'material' ? item.quantity : 0,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total,
            type,
            room: item.room || 'Main Room',
            ...(type === 'materials' ? {
              materialType: item.materialType || 'Standard',
              brand: item.brand || 'Generic'
            } : {
              laborType: item.laborType || 'Installation',
              hourlyRate: item.hourlyRate || item.unitPrice,
              hours: item.hours || item.quantity
            })
          };
        });

        setSuggestions(items);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        setError('Failed to process AI suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const selectedSuggestions = suggestions.filter(item => selectedItems.has(item.id));
    onAddItems(selectedSuggestions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI {type === 'materials' ? 'Material' : 'Labor'} Suggestions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {!suggestions.length ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe your project requirements
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder={`Example: Need ${type === 'materials' ? 'flooring materials' : 'installation services'} for a 500 sq ft living room...`}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <button
                onClick={generateSuggestions}
                disabled={!projectDescription.trim() || isGenerating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Generating suggestions...
                  </>
                ) : (
                  <>
                    <Bot className="h-5 w-5 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {suggestions.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                      selectedItems.has(item.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      const newSelected = new Set(selectedItems);
                      if (newSelected.has(item.id)) {
                        newSelected.delete(item.id);
                      } else {
                        newSelected.add(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.description}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                        </p>
                        {type === 'materials' ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.materialType} - {item.brand}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.laborType} - {item.hours} hours at ${item.hourlyRate}/hr
                          </p>
                        )}
                      </div>
                      <div className={`rounded-full p-2 ${
                        selectedItems.has(item.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setSuggestions([]);
                    setSelectedItems(new Set());
                    setProjectDescription('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Start Over
                </button>
                <div className="space-x-4">
                  <button
                    onClick={generateSuggestions}
                    className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={selectedItems.size === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    Add Selected Items
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIEstimateGenerator;
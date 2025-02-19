import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Bot, Edit, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { EstimateItem, Estimate } from '../../types/estimate';
import { Client } from '../../types/client';
import { calculateEstimateItems, validateEstimate } from '../../utils/estimateCalculator';
import ClientSelector from './estimate-steps/ClientSelector';
import RoomManager from './estimate-steps/RoomManager';
import MaterialSelector from './estimate-steps/MaterialSelector';
import EstimateReview from './estimate-steps/EstimateReview';
import StepIndicator from './estimate-steps/StepIndicator';
import OpenAI from 'openai';

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (estimate: Omit<Estimate, 'id'> | Estimate) => Promise<void>;
  estimate?: Estimate | null;
  clients?: Client[];
}

const EstimateModal: React.FC<EstimateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  estimate,
  clients = []
}) => {
  const initialFormData: Omit<Estimate, 'id'> = {
    clientId: '',
    clientName: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
    rooms: [],
    roomDimensions: {}
  };

  const [formData, setFormData] = useState<Omit<Estimate, 'id'> | Estimate>(initialFormData);
  const [step, setStep] = useState<'client' | 'rooms' | 'items' | 'review'>('client');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRooms, setUseRooms] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [editingItem, setEditingItem] = useState<{ index: number; item: EstimateItem } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (estimate) {
        setFormData(estimate);
        setUseRooms(Boolean(estimate.rooms?.length));
        setStep(estimate.clientId ? 'items' : 'client');
      } else {
        setFormData(initialFormData);
        setUseRooms(false);
        setStep('client');
      }
      setError(null);
      setEditingItem(null);
      setAiPrompt('');
    }
  }, [isOpen, estimate]);

  const handleClientSelect = (clientId: string, clientName: string) => {
    if (!clientId || !clientName) {
      setError('Please select a client');
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      clientId, 
      clientName,
      items: prev.items || [],
      rooms: prev.rooms || [],
      roomDimensions: prev.roomDimensions || {}
    }));
    setError(null);
  };

  const handleGenerateAIItems = async () => {
    if (!formData.clientId || !formData.clientName) {
      setError('Please select a client first');
      return;
    }

    if (!aiPrompt.trim()) {
      setError('Please provide instructions for the AI');
      return;
    }

    setIsGeneratingAI(true);
    setError(null);

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `Generate flooring estimate items for ${formData.clientName} based on these requirements: ${aiPrompt}
      
      Return a JSON array with items in this format:
      {
        "items": [
          {
            "type": "material"|"labor",
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
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error('No response from AI');

      const result = JSON.parse(response);
      if (!Array.isArray(result.items)) throw new Error('Invalid response format');

      const items: EstimateItem[] = result.items.map(item => ({
        id: Date.now().toString() + Math.random(),
        description: item.description || '',
        area: 0,
        unitPrice: item.unitPrice || 0,
        quantity: item.quantity || 0,
        total: (item.quantity || 0) * (item.unitPrice || 0),
        type: item.type || 'material',
        room: item.room || 'Main Room',
        ...(item.type === 'material' ? {
          materialType: item.materialType,
          brand: item.brand
        } : {
          laborType: item.laborType,
          hourlyRate: item.hourlyRate,
          hours: item.hours
        })
      }));

      handleUpdateItems([...formData.items, ...items]);
      setAiPrompt(''); // Clear the prompt after successful generation

    } catch (error) {
      console.error('Error generating AI items:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate items');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUpdateItems = (items: EstimateItem[]) => {
    try {
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
      const total = Math.round((subtotal + tax) * 100) / 100;

      setFormData(prev => ({
        ...prev,
        items,
        subtotal,
        tax,
        total
      }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update items');
    }
  };

  const handleEditItem = (index: number) => {
    const item = formData.items[index];
    if (!item) return;

    setEditingItem({
      index,
      item: { ...item }
    });
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    try {
      const { index, item } = editingItem;
      const newItems = [...formData.items];
      
      // Recalculate total
      item.total = Math.round(item.quantity * item.unitPrice * 100) / 100;
      
      newItems[index] = item;
      handleUpdateItems(newItems);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (!formData.clientId || !formData.clientName) {
        throw new Error('Please select a client');
      }

      if (formData.items.length === 0) {
        throw new Error('Please add at least one item');
      }

      if (useRooms) {
        const validation = validateEstimate(formData.rooms, formData.roomDimensions || {});
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid room dimensions');
        }
      }

      await onSave({
        ...formData,
        status: 'draft',
        date: new Date().toISOString().split('T')[0]
      });

      onClose();
    } catch (err) {
      console.error('Error saving estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to save estimate');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {estimate ? 'Edit Estimate' : 'Create Estimate'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <StepIndicator currentStep={step} />

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            {step === 'client' && (
              <>
                <ClientSelector
                  clients={clients}
                  selectedClientId={formData.clientId}
                  onClientSelect={handleClientSelect}
                  onNext={() => setStep(useRooms ? 'rooms' : 'items')}
                />
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useRooms}
                      onChange={(e) => setUseRooms(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Use room dimensions for calculations
                    </span>
                  </label>
                </div>
              </>
            )}

            {step === 'rooms' && useRooms && (
              <RoomManager
                rooms={formData.rooms}
                dimensions={formData.roomDimensions}
                onUpdate={(rooms, dimensions) => {
                  setFormData(prev => ({ ...prev, rooms, roomDimensions: dimensions }));
                }}
                onBack={() => setStep('client')}
                onNext={() => setStep('items')}
              />
            )}

            {step === 'items' && (
              <div className="space-y-6">
                {/* AI Generation Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      AI Estimate Generator
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe the project requirements (e.g., 'Need hardwood flooring for a 500 sq ft living room with premium materials and installation')"
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAIItems}
                    disabled={isGeneratingAI || !aiPrompt.trim()}
                    className="w-full px-4 py-3 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Bot className="h-5 w-5" />
                    <span>{isGeneratingAI ? 'Generating Items...' : 'Generate AI Suggestions'}</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      {editingItem?.index === index ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={editingItem.item.description}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  item: { ...editingItem.item, description: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={editingItem.item.quantity}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  item: { ...editingItem.item, quantity: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit Price
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingItem.item.unitPrice}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  item: { ...editingItem.item, unitPrice: parseFloat(e.target.value) || 0 }
                                })}
                                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                              />
                            </div>
                            {useRooms && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Room
                                </label>
                                <select
                                  value={editingItem.item.room}
                                  onChange={(e) => setEditingItem({
                                    ...editingItem,
                                    item: { ...editingItem.item, room: e.target.value }
                                  })}
                                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                                >
                                  {formData.rooms.map((room) => (
                                    <option key={room} value={room}>{room}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingItem(null)}
                              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveItem}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.description}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                            </p>
                            {item.room && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Room: {item.room}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditItem(index)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...formData.items];
                                newItems.splice(index, 1);
                                handleUpdateItems(newItems);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(useRooms ? 'rooms' : 'client')}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    disabled={formData.items.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next: Review
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <EstimateReview
                estimate={formData}
                onBack={() => setStep('items')}
                isSubmitting={isProcessing}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EstimateModal;
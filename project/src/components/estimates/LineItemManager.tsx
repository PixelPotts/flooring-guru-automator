import React, { useState } from 'react';
import { Plus, Search, Filter, Package2, Hammer, Bot, Trash, Edit, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { EstimateItem } from '../../types/estimate';
import InventorySelector from './InventorySelector';
import AIEstimateGenerator from './AIEstimateGenerator';

interface LineItemManagerProps {
  items: EstimateItem[];
  onUpdate: (items: EstimateItem[]) => void;
  onBack: () => void;
  onNext: () => void;
  useRooms?: boolean;
  rooms?: string[];
  roomDimensions?: Record<string, { length: number; width: number; sqft: number }>;
  clientId?: string;
  clientName?: string;
}

const LineItemManager: React.FC<LineItemManagerProps> = ({
  items,
  onUpdate,
  onBack,
  onNext,
  useRooms = false,
  rooms = [],
  roomDimensions = {},
  clientId,
  clientName
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'labor'>('materials');
  const [showInventory, setShowInventory] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return Math.round(quantity * unitPrice * 100) / 100;
  };

  const validateItem = (item: EstimateItem) => {
    if (!item.description) {
      throw new Error('Description is required');
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
      throw new Error('Unit price must be greater than 0');
    }
    if (useRooms && !item.room) {
      throw new Error('Room selection is required');
    }
  };

  const handleAddItem = (item: EstimateItem) => {
    try {
      // Ensure all required fields are present
      const newItem = {
        ...item,
        id: item.id || Date.now().toString() + Math.random(),
        area: item.area || 0,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        room: item.room || (useRooms && rooms.length > 0 ? rooms[0] : 'Main Room')
      };

      // Calculate total
      newItem.total = calculateItemTotal(newItem.quantity, newItem.unitPrice);

      // Validate item
      validateItem(newItem);

      // Add item
      onUpdate([...items, newItem]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleUpdateItem = (updatedItem: EstimateItem) => {
    try {
      // Validate item
      validateItem(updatedItem);

      // Recalculate total
      const total = calculateItemTotal(updatedItem.quantity, updatedItem.unitPrice);
      
      // Update item
      onUpdate(items.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, total } 
          : item
      ));
      setEditingItem(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdate(items.filter(item => item.id !== itemId));
  };

  const handleInventoryItemSelect = (inventoryItem: any) => {
    const newItem: EstimateItem = {
      id: Date.now().toString() + Math.random(),
      description: inventoryItem.name,
      area: 0,
      unitPrice: activeTab === 'materials' 
        ? inventoryItem.default_unit_price 
        : inventoryItem.default_hourly_rate,
      quantity: 1,
      total: activeTab === 'materials' 
        ? inventoryItem.default_unit_price 
        : inventoryItem.default_hourly_rate,
      type: activeTab === 'materials' ? 'material' : 'labor',
      room: useRooms && rooms.length > 0 ? rooms[0] : 'Main Room',
      ...(activeTab === 'materials' ? {
        materialType: inventoryItem.material_type,
        brand: inventoryItem.brand
      } : {
        laborType: inventoryItem.labor_type,
        hourlyRate: inventoryItem.default_hourly_rate,
        hours: inventoryItem.estimated_hours
      })
    };

    handleAddItem(newItem);
    setShowInventory(false);
  };

  const filteredItems = items.filter(item => 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.room && item.room.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'materials'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <Package2 className="h-5 w-5 mr-2" />
            Materials
          </button>
          <button
            onClick={() => setActiveTab('labor')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'labor'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <Hammer className="h-5 w-5 mr-2" />
            Labor
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowInventory(true)}
            className="px-4 py-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30"
          >
            <Package2 className="h-5 w-5 inline-block mr-2" />
            Add from Inventory
          </button>
          <button
            onClick={() => setShowAIGenerator(true)}
            className="px-4 py-2 bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30"
          >
            <Bot className="h-5 w-5 inline-block mr-2" />
            AI Suggestions
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {editingItem?.id === item.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
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
                      value={editingItem.quantity}
                      onChange={(e) => {
                        const quantity = parseFloat(e.target.value) || 0;
                        const total = calculateItemTotal(quantity, editingItem.unitPrice);
                        setEditingItem({ ...editingItem, quantity, total });
                      }}
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
                      value={editingItem.unitPrice}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value) || 0;
                        const total = calculateItemTotal(editingItem.quantity, unitPrice);
                        setEditingItem({ ...editingItem, unitPrice, total });
                      }}
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                  {useRooms && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Room
                      </label>
                      <select
                        value={editingItem.room}
                        onChange={(e) => setEditingItem({ ...editingItem, room: e.target.value })}
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        {rooms.map((room) => (
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
                    onClick={() => handleUpdateItem(editingItem)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
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
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No items added yet. Add items from inventory or use AI suggestions.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={items.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Next: Review Estimate
        </button>
      </div>

      {showInventory && (
        <InventorySelector
          isOpen={showInventory}
          onClose={() => setShowInventory(false)}
          onSelect={handleInventoryItemSelect}
        />
      )}

      {showAIGenerator && (
        <AIEstimateGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onAddItems={(newItems) => {
            onUpdate([...items, ...newItems]);
            setShowAIGenerator(false);
          }}
          type={activeTab}
        />
      )}
    </div>
  );
};

export default LineItemManager;
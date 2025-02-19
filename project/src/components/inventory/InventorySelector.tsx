import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Package2, Hammer } from 'lucide-react';
import { MaterialLineItem, LaborLineItem } from '../../types/lineItems';
import { supabase } from '../../lib/supabase';

interface InventorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MaterialLineItem | LaborLineItem) => void;
}

const InventorySelector: React.FC<InventorySelectorProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'labor'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<MaterialLineItem[]>([]);
  const [laborItems, setLaborItems] = useState<LaborLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInventory();
    }
  }, [isOpen]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .order('name');

      if (materialsError) throw materialsError;

      // Load labor items
      const { data: laborData, error: laborError } = await supabase
        .from('labor_items')
        .select('*')
        .order('name');

      if (laborError) throw laborError;

      setMaterials(materialsData || []);
      setLaborItems(laborData || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeTab === 'materials'
    ? materials.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : laborItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select from Inventory
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-4 mb-4">
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

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            />
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading inventory...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No items found</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${('default_unit_price' in item ? item.default_unit_price : item.default_hourly_rate).toFixed(2)}/
                      {'unit' in item ? item.unit : 'hr'}
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InventorySelector;
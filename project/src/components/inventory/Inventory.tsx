import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package2, Hammer, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MaterialLineItem, LaborLineItem } from '../../types/lineItems';
import MaterialLineItemModal from '../lineItems/MaterialLineItemModal';
import LaborLineItemModal from '../lineItems/LaborLineItemModal';
import InventoryCard from './InventoryCard';
import AISetupModal from './AISetupModal';
import QuickTip from '../shared/QuickTip';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const Inventory: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'materials' | 'labor'>('materials');
  const [materials, setMaterials] = useState<MaterialLineItem[]>([]);
  const [laborItems, setLaborItems] = useState<LaborLineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialLineItem | null>(null);
  const [editingLabor, setEditingLabor] = useState<LaborLineItem | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadInventory();
    }
  }, [currentUser]);

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

  const handleAddMaterial = async (material: Omit<MaterialLineItem, 'id'>) => {
    try {
      // Check if material with same name already exists
      const existingMaterial = materials.find(m => 
        m.name.toLowerCase() === material.name.toLowerCase()
      );

      if (existingMaterial) {
        return; // Skip adding duplicate
      }

      const { data, error } = await supabase
        .from('materials')
        .insert([material])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      setMaterials([...materials, data]);
      setIsMaterialModalOpen(false);
    } catch (err) {
      console.error('Error adding material:', err);
      throw err;
    }
  };

  const handleUpdateMaterial = async (material: MaterialLineItem) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update(material)
        .eq('id', material.id);

      if (error) throw error;

      setMaterials(materials.map(m => m.id === material.id ? material : m));
      setIsMaterialModalOpen(false);
      setEditingMaterial(null);
    } catch (err) {
      console.error('Error updating material:', err);
      throw err;
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMaterials(materials.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting material:', err);
      throw err;
    }
  };

  const handleAddLabor = async (labor: Omit<LaborLineItem, 'id'>) => {
    try {
      // Check if labor item with same name already exists
      const existingLabor = laborItems.find(l => 
        l.name.toLowerCase() === labor.name.toLowerCase()
      );

      if (existingLabor) {
        return; // Skip adding duplicate
      }

      const { data, error } = await supabase
        .from('labor_items')
        .insert([labor])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      setLaborItems([...laborItems, data]);
      setIsLaborModalOpen(false);
    } catch (err) {
      console.error('Error adding labor item:', err);
      throw err;
    }
  };

  const handleUpdateLabor = async (labor: LaborLineItem) => {
    try {
      const { error } = await supabase
        .from('labor_items')
        .update(labor)
        .eq('id', labor.id);

      if (error) throw error;

      setLaborItems(laborItems.map(l => l.id === labor.id ? labor : l));
      setIsLaborModalOpen(false);
      setEditingLabor(null);
    } catch (err) {
      console.error('Error updating labor item:', err);
      throw err;
    }
  };

  const handleDeleteLabor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('labor_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLaborItems(laborItems.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting labor item:', err);
      throw err;
    }
  };

  const handleAISuggestions = async (items: (MaterialLineItem | LaborLineItem)[]) => {
    try {
      if (activeTab === 'materials') {
        // Filter out materials that already exist
        const newMaterials = items.filter(item => 
          !materials.some(m => m.name.toLowerCase() === item.name.toLowerCase())
        ) as MaterialLineItem[];

        if (newMaterials.length === 0) {
          return; // No new materials to add
        }

        const { data, error } = await supabase
          .from('materials')
          .insert(newMaterials)
          .select();

        if (error) throw error;
        if (!data) throw new Error('No data returned from insert');

        setMaterials([...materials, ...data]);
      } else {
        // Filter out labor items that already exist
        const newLaborItems = items.filter(item => 
          !laborItems.some(l => l.name.toLowerCase() === item.name.toLowerCase())
        ) as LaborLineItem[];

        if (newLaborItems.length === 0) {
          return; // No new labor items to add
        }

        const { data, error } = await supabase
          .from('labor_items')
          .insert(newLaborItems)
          .select();

        if (error) throw error;
        if (!data) throw new Error('No data returned from insert');

        setLaborItems([...laborItems, ...data]);
      }
      setIsAIModalOpen(false);
    } catch (err) {
      console.error('Error adding AI suggestions:', err);
      throw err;
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let items = activeTab === 'materials' ? materials : laborItems;
    
    // Apply search filter
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply category filter
    if (filterCategory !== 'all') {
      items = items.filter(item => item.category === filterCategory);
    }

    // Apply sorting
    return [...items].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const priceA = 'default_unit_price' in a ? a.default_unit_price : a.default_hourly_rate;
        const priceB = 'default_unit_price' in b ? b.default_unit_price : b.default_hourly_rate;
        return priceA - priceB;
      }
    });
  }, [activeTab, materials, laborItems, searchQuery, filterCategory, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <HelpCircle className="h-5 w-5 inline-block mr-2" />
            Get AI Suggestions
          </button>
          <button
            onClick={() => activeTab === 'materials' ? setIsMaterialModalOpen(true) : setIsLaborModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 inline-block mr-2" />
            Add {activeTab === 'materials' ? 'Material' : 'Labor'}
          </button>
        </div>
      </div>

      {showTip && (
        <QuickTip
          title="Getting Started with Inventory"
          content="Add your materials and labor items to streamline estimate creation. You can also use AI suggestions to quickly populate common items for your business type."
          onClose={() => setShowTip(false)}
        />
      )}

      <div className="flex flex-col md:flex-row gap-4">
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

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              type={activeTab}
              onEdit={activeTab === 'materials' ? handleUpdateMaterial : handleUpdateLabor}
              onDelete={activeTab === 'materials' ? handleDeleteMaterial : handleDeleteLabor}
              onEditClick={() => {
                if (activeTab === 'materials') {
                  setEditingMaterial(item as MaterialLineItem);
                  setIsMaterialModalOpen(true);
                } else {
                  setEditingLabor(item as LaborLineItem);
                  setIsLaborModalOpen(true);
                }
              }}
            />
          ))}

          {filteredAndSortedItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? `No ${activeTab} match your search "${searchQuery}"`
                  : `No ${activeTab} items yet`}
              </p>
              <button
                onClick={() => activeTab === 'materials' ? setIsMaterialModalOpen(true) : setIsLaborModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 inline-block mr-2" />
                Add First {activeTab === 'materials' ? 'Material' : 'Labor'} Item
              </button>
            </div>
          )}
        </div>
      )}

      <MaterialLineItemModal
        isOpen={isMaterialModalOpen}
        onClose={() => {
          setIsMaterialModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
        material={editingMaterial}
      />

      <LaborLineItemModal
        isOpen={isLaborModalOpen}
        onClose={() => {
          setIsLaborModalOpen(false);
          setEditingLabor(null);
        }}
        onSave={editingLabor ? handleUpdateLabor : handleAddLabor}
        labor={editingLabor}
      />

      <AISetupModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSave={handleAISuggestions}
        type={activeTab}
      />
    </motion.div>
  );
};

export default Inventory;
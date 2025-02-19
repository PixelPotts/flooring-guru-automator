import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader } from 'lucide-react';
import { MaterialLineItem, LaborLineItem } from '../../types/lineItems';

interface AISetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: (MaterialLineItem | LaborLineItem)[]) => void;
  type: 'materials' | 'labor';
}

const AISetupModal: React.FC<AISetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type
}) => {
  const [businessDescription, setBusinessDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<(MaterialLineItem | LaborLineItem)[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  // Generate a UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateSuggestions = () => {
    const materialSets = [materialSuggestionsSet1, materialSuggestionsSet2];
    const laborSets = [laborSuggestionsSet1, laborSuggestionsSet2];
    
    const suggestions = type === 'materials' 
      ? materialSets[currentPage % 2]
      : laborSets[currentPage % 2];
    
    // Generate new UUIDs for each suggestion
    return suggestions.map(item => ({
      ...item,
      id: generateUUID()
    }));
  };

  const handleRegenerateSuggestions = () => {
    setCurrentPage(prev => prev + 1);
    setSuggestions(generateSuggestions());
  };

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSave = () => {
    const selectedSuggestions = suggestions.filter(item => selectedItems.has(item.id));
    onSave(selectedSuggestions);
    onClose();
  };

  const handleGenerateInitial = async () => {
    setIsGenerating(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const initialSuggestions = generateSuggestions();
    setSuggestions(initialSuggestions);
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI {type === 'materials' ? 'Material' : 'Labor'} Suggestions
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!suggestions.length ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe your business and typical services
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder={`Example: We specialize in ${type === 'materials' ? 'high-end residential flooring products' : 'professional flooring installation services'}, typically working with...`}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <button
                onClick={handleGenerateInitial}
                disabled={!businessDescription.trim() || isGenerating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Generating suggestions...
                  </>
                ) : (
                  'Generate Suggestions'
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                      selectedItems.has(item.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        {'material_type' in item ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ${item.default_unit_price}/{item.unit} - {item.brand}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ${item.default_hourly_rate}/{item.unit} - Est. {item.estimated_hours} hours
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
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setSuggestions([]);
                    setSelectedItems(new Set());
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Start Over
                </button>
                <div className="space-x-4">
                  <button
                    onClick={handleRegenerateSuggestions}
                    className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Show Different Options
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
      </div>
    </div>
  );
};

// Material suggestions with snake_case property names
const materialSuggestionsSet1: Omit<MaterialLineItem, 'id'>[] = [
  {
    name: "Premium Oak Hardwood",
    description: "High-quality oak flooring with natural finish",
    material_type: "Hardwood",
    brand: "Premium Woods",
    default_unit_price: 8.99,
    unit: "sqft",
    category: "Hardwood"
  },
  {
    name: "Luxury Vinyl Planks",
    description: "Waterproof luxury vinyl with wood-look finish",
    material_type: "Vinyl",
    brand: "LuxuryVinyl",
    default_unit_price: 4.99,
    unit: "sqft",
    category: "Vinyl"
  },
  {
    name: "Porcelain Tile",
    description: "Premium porcelain tiles with marble effect",
    material_type: "Tile",
    brand: "TileMaster",
    default_unit_price: 6.99,
    unit: "sqft",
    category: "Tile"
  },
  {
    name: "Premium Underlayment",
    description: "High-density foam underlayment with moisture barrier",
    material_type: "Underlayment",
    brand: "FloorPrep",
    default_unit_price: 0.99,
    unit: "sqft",
    category: "Accessories"
  },
  {
    name: "Natural Stone Tile",
    description: "Genuine travertine stone tiles",
    material_type: "Stone",
    brand: "StoneCraft",
    default_unit_price: 12.99,
    unit: "sqft",
    category: "Stone"
  }
];

const materialSuggestionsSet2: Omit<MaterialLineItem, 'id'>[] = [
  {
    name: "Bamboo Flooring",
    description: "Eco-friendly strand-woven bamboo",
    material_type: "Bamboo",
    brand: "EcoFloor",
    default_unit_price: 5.99,
    unit: "sqft",
    category: "Bamboo"
  },
  {
    name: "Wool Carpet",
    description: "Premium wool blend carpet with stain resistance",
    material_type: "Carpet",
    brand: "LuxCarpet",
    default_unit_price: 7.99,
    unit: "sqft",
    category: "Carpet"
  },
  {
    name: "Cork Tiles",
    description: "Natural cork flooring with protective finish",
    material_type: "Cork",
    brand: "CorkMaster",
    default_unit_price: 6.49,
    unit: "sqft",
    category: "Cork"
  },
  {
    name: "Engineered Maple",
    description: "Engineered maple with UV-cured finish",
    material_type: "Engineered",
    brand: "MapleWood",
    default_unit_price: 9.99,
    unit: "sqft",
    category: "Engineered"
  },
  {
    name: "Slate Tiles",
    description: "Natural slate with rustic finish",
    material_type: "Stone",
    brand: "SlateMaster",
    default_unit_price: 14.99,
    unit: "sqft",
    category: "Stone"
  }
];

// Labor suggestions with snake_case property names
const laborSuggestionsSet1: Omit<LaborLineItem, 'id'>[] = [
  {
    name: "Basic Installation",
    description: "Standard flooring installation service",
    labor_type: "Installation",
    default_hourly_rate: 65,
    estimated_hours: 8,
    category: "Installation",
    unit: "hour"
  },
  {
    name: "Floor Preparation",
    description: "Subfloor leveling and repair",
    labor_type: "Preparation",
    default_hourly_rate: 55,
    estimated_hours: 4,
    category: "Preparation",
    unit: "hour"
  },
  {
    name: "Furniture Moving",
    description: "Careful furniture relocation service",
    labor_type: "Moving",
    default_hourly_rate: 45,
    estimated_hours: 2,
    category: "Additional Services",
    unit: "hour"
  },
  {
    name: "Old Floor Removal",
    description: "Removal and disposal of existing flooring",
    labor_type: "Removal",
    default_hourly_rate: 50,
    estimated_hours: 6,
    category: "Preparation",
    unit: "hour"
  },
  {
    name: "Baseboard Installation",
    description: "New baseboard installation and finishing",
    labor_type: "Trim",
    default_hourly_rate: 60,
    estimated_hours: 4,
    category: "Finishing",
    unit: "hour"
  }
];

const laborSuggestionsSet2: Omit<LaborLineItem, 'id'>[] = [
  {
    name: "Custom Pattern Installation",
    description: "Complex pattern and inlay installation",
    labor_type: "Specialty",
    default_hourly_rate: 85,
    estimated_hours: 12,
    category: "Specialty",
    unit: "hour"
  },
  {
    name: "Stair Installation",
    description: "Custom stair flooring installation",
    labor_type: "Stairs",
    default_hourly_rate: 90,
    estimated_hours: 8,
    category: "Specialty",
    unit: "hour"
  },
  {
    name: "Moisture Barrier Application",
    description: "Professional moisture barrier installation",
    labor_type: "Preparation",
    default_hourly_rate: 55,
    estimated_hours: 3,
    category: "Preparation",
    unit: "hour"
  },
  {
    name: "Floor Sealing",
    description: "Professional sealing and finishing",
    labor_type: "Finishing",
    default_hourly_rate: 70,
    estimated_hours: 4,
    category: "Finishing",
    unit: "hour"
  },
  {
    name: "Radiant Heat Installation",
    description: "Under-floor heating system installation",
    labor_type: "Specialty",
    default_hourly_rate: 95,
    estimated_hours: 10,
    category: "Specialty",
    unit: "hour"
  }
];

export default AISetupModal;
import React, { useState } from 'react';
import { Plus, Search, Filter, Package2, Hammer, Edit, Trash } from 'lucide-react';
import { MaterialLineItem, LaborLineItem } from '../../types/lineItems';
import MaterialLineItemModal from './MaterialLineItemModal';
import LaborLineItemModal from './LaborLineItemModal';

const LineItemsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'labor'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialLineItem | null>(null);
  const [editingLabor, setEditingLabor] = useState<LaborLineItem | null>(null);

  const [materials, setMaterials] = useState<MaterialLineItem[]>([
    {
      id: '1',
      name: 'Premium Hardwood',
      description: 'High-quality oak hardwood flooring',
      materialType: 'Hardwood',
      brand: 'Premium Woods',
      defaultUnitPrice: 8.99,
      unit: 'sqft',
      category: 'Hardwood'
    },
    {
      id: '2',
      name: 'Luxury Vinyl Plank',
      description: 'Waterproof luxury vinyl planks',
      materialType: 'Vinyl',
      brand: 'LuxuryVinyl',
      defaultUnitPrice: 4.99,
      unit: 'sqft',
      category: 'Vinyl'
    }
  ]);

  const [laborItems, setLaborItems] = useState<LaborLineItem[]>([
    {
      id: '1',
      name: 'Standard Installation',
      description: 'Basic flooring installation',
      laborType: 'Installation',
      defaultHourlyRate: 65,
      estimatedHours: 8,
      category: 'Installation'
    },
    {
      id: '2',
      name: 'Floor Preparation',
      description: 'Subfloor preparation and leveling',
      laborType: 'Preparation',
      defaultHourlyRate: 55,
      estimatedHours: 4,
      category: 'Preparation'
    }
  ]);

  const handleAddMaterial = (material: Omit<MaterialLineItem, 'id'>) => {
    const newMaterial = {
      ...material,
      id: (materials.length + 1).toString()
    };
    setMaterials([...materials, newMaterial]);
    setIsMaterialModalOpen(false);
  };

  const handleUpdateMaterial = (material: MaterialLineItem) => {
    setMaterials(materials.map(m => m.id === material.id ? material : m));
    setIsMaterialModalOpen(false);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleAddLabor = (labor: Omit<LaborLineItem, 'id'>) => {
    const newLabor = {
      ...labor,
      id: (laborItems.length + 1).toString()
    };
    setLaborItems([...laborItems, newLabor]);
    setIsLaborModalOpen(false);
  };

  const handleUpdateLabor = (labor: LaborLineItem) => {
    setLaborItems(laborItems.map(l => l.id === labor.id ? labor : l));
    setIsLaborModalOpen(false);
    setEditingLabor(null);
  };

  const handleDeleteLabor = (id: string) => {
    setLaborItems(laborItems.filter(l => l.id !== id));
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabor = laborItems.filter(labor =>
    labor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    labor.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Line Items</h1>
        <button
          onClick={() => activeTab === 'materials' ? setIsMaterialModalOpen(true) : setIsLaborModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add {activeTab === 'materials' ? 'Material' : 'Labor'} Item
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'materials'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
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
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <Hammer className="h-5 w-5 mr-2" />
            Labor
          </button>
        </div>

        <div className="flex gap-4">
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
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'materials' ? (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{material.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{material.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingMaterial(material);
                      setIsMaterialModalOpen(true);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white">{material.materialType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                  <span className="text-gray-900 dark:text-white">{material.brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${material.defaultUnitPrice}/{material.unit}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredLabor.map((labor) => (
            <div key={labor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{labor.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{labor.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingLabor(labor);
                      setIsLaborModalOpen(true);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteLabor(labor.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white">{labor.laborType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                  <span className="text-gray-900 dark:text-white">${labor.defaultHourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Est. Hours:</span>
                  <span className="text-gray-900 dark:text-white">{labor.estimatedHours}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
    </div>
  );
};

export default LineItemsManager;
import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { MaterialLineItem } from '../../types/lineItems';
import CameraCapture from '../shared/CameraCapture';

interface MaterialLineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: MaterialLineItem | Omit<MaterialLineItem, 'id'>) => void;
  material?: MaterialLineItem | null;
}

const MaterialLineItemModal: React.FC<MaterialLineItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  material
}) => {
  const initialFormData: Omit<MaterialLineItem, 'id'> = {
    name: '',
    description: '',
    material_type: '',
    brand: '',
    default_unit_price: 0,
    unit: 'sqft',
    category: '',
    image: ''
  };

  const [formData, setFormData] = useState<Omit<MaterialLineItem, 'id'>>(initialFormData);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        description: material.description || '',
        material_type: material.material_type || '',
        brand: material.brand || '',
        default_unit_price: material.default_unit_price || 0,
        unit: material.unit || 'sqft',
        category: material.category || '',
        image: material.image || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [material, isOpen]); // Reset form when modal opens/closes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(material ? { ...formData, id: material.id } : formData);
  };

  const handleCapture = (imageData: string, description?: string) => {
    setFormData({ 
      ...formData, 
      image: imageData,
      description: description || formData.description 
    });
    setShowCamera(false);
  };

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {material ? 'Edit Material' : 'Add Material'}
          </h2>
          <button
            onClick={() => onClose()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              >
                <Camera className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Material Type
            </label>
            <select
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Hardwood">Hardwood</option>
              <option value="Laminate">Laminate</option>
              <option value="Vinyl">Vinyl</option>
              <option value="Tile">Tile</option>
              <option value="Carpet">Carpet</option>
              <option value="Cork">Cork</option>
              <option value="Bamboo">Bamboo</option>
              <option value="Stone">Stone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.default_unit_price}
                onChange={(e) => setFormData({ ...formData, default_unit_price: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as MaterialLineItem['unit'] })}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="sqft">Square Feet</option>
                <option value="piece">Piece</option>
                <option value="box">Box</option>
                <option value="roll">Roll</option>
                <option value="linear_ft">Linear Feet</option>
                <option value="yard">Yard</option>
                <option value="meter">Meter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {formData.image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preview
              </label>
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {material ? 'Save Changes' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default MaterialLineItemModal;
import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { LaborLineItem } from '../../types/lineItems';
import CameraCapture from '../shared/CameraCapture';

interface LaborLineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labor: LaborLineItem | Omit<LaborLineItem, 'id'>) => void;
  labor?: LaborLineItem | null;
}

const LaborLineItemModal: React.FC<LaborLineItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  labor
}) => {
  const initialFormData: Omit<LaborLineItem, 'id'> = {
    name: '',
    description: '',
    labor_type: '',
    default_hourly_rate: 0,
    estimated_hours: 0,
    category: '',
    unit: 'hour',
    image: ''
  };

  const [formData, setFormData] = useState<Omit<LaborLineItem, 'id'>>(initialFormData);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (labor) {
      setFormData({
        name: labor.name || '',
        description: labor.description || '',
        labor_type: labor.labor_type || '',
        default_hourly_rate: labor.default_hourly_rate || 0,
        estimated_hours: labor.estimated_hours || 0,
        category: labor.category || '',
        unit: labor.unit || 'hour',
        image: labor.image || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [labor, isOpen]); // Reset form when modal opens/closes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(labor ? { ...formData, id: labor.id } : formData);
  };

  const handleCapture = (imageData: string, description?: string) => {
    setFormData({ 
      ...formData, 
      image: imageData,
      description: description || formData.description 
    });
    setShowCamera(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {labor ? 'Edit Labor' : 'Add Labor'}
          </h2>
          <button
            onClick={onClose}
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
              Labor Type
            </label>
            <select
              value={formData.labor_type}
              onChange={(e) => setFormData({ ...formData, labor_type: e.target.value })}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Installation">Installation</option>
              <option value="Removal">Removal</option>
              <option value="Floor Preparation">Floor Preparation</option>
              <option value="Baseboards">Baseboards</option>
              <option value="Stairs">Stairs</option>
              <option value="Transitions">Transitions</option>
              <option value="Cleanup">Cleanup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as LaborLineItem['unit'] })}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="hour">Per Hour</option>
              <option value="day">Per Day</option>
              <option value="project">Per Project</option>
              <option value="sqft">Per Square Foot</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.default_hourly_rate}
                onChange={(e) => setFormData({ ...formData, default_hourly_rate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
              {labor ? 'Save Changes' : 'Add Labor'}
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

export default LaborLineItemModal;
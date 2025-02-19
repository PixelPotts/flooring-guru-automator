import React from 'react';
import { Edit, Trash, Package2, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';
import { MaterialLineItem, LaborLineItem } from '../../types/lineItems';

interface InventoryCardProps {
  item: MaterialLineItem | LaborLineItem;
  type: 'materials' | 'labor';
  onEdit: (item: MaterialLineItem | LaborLineItem) => void;
  onDelete: (id: string) => void;
  onEditClick: () => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  type,
  onDelete,
  onEditClick,
}) => {
  const isMaterial = type === 'materials';
  const material = item as MaterialLineItem;
  const labor = item as LaborLineItem;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
              {isMaterial ? (
                <Package2 className="h-5 w-5 text-blue-500" />
              ) : (
                <Hammer className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEditClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {isMaterial ? (
            <>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {material.material_type}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Brand</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {material.brand}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${material.default_unit_price}/{material.unit}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {labor.labor_type}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${labor.default_hourly_rate}/{labor.unit}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Est. Hours</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {labor.estimated_hours}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.category}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryCard;
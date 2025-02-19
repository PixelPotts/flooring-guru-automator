import React from 'react';
import { Trash, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomDimension {
  length: number;
  width: number;
  sqft: number;
}

interface RoomDimensionsFormProps {
  rooms: string[];
  dimensions: Record<string, RoomDimension>;
  onAddRoom: (room: string) => void;
  onRemoveRoom: (room: string) => void;
  onUpdateDimensions: (room: string, field: 'length' | 'width', value: number) => void;
}

const RoomDimensionsForm: React.FC<RoomDimensionsFormProps> = ({
  rooms = [], // Provide default empty array
  dimensions = {}, // Provide default empty object
  onAddRoom,
  onRemoveRoom,
  onUpdateDimensions
}) => {
  const [newRoom, setNewRoom] = React.useState('');

  const handleAddRoom = () => {
    if (newRoom && !rooms.includes(newRoom)) {
      onAddRoom(newRoom);
      setNewRoom('');
    } else if (rooms.includes(newRoom)) {
      // Show error or feedback that room already exists
      alert('Room already exists');
    }
  };

  const handleDimensionChange = (room: string, field: 'length' | 'width', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdateDimensions(room, field, numValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="Add room (e.g., Living Room)"
          className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAddRoom}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {rooms.map((room) => {
          // Get dimensions with default values
          const roomDims = dimensions[room] || { length: 0, width: 0, sqft: 0 };
          
          return (
            <motion.div
              key={room}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{room}</span>
                <button
                  type="button"
                  onClick={() => onRemoveRoom(room)}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Length (ft)"
                  min="0"
                  step="0.1"
                  value={roomDims.length || ''}
                  onChange={(e) => handleDimensionChange(room, 'length', e.target.value)}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
                <input
                  type="number"
                  placeholder="Width (ft)"
                  min="0"
                  step="0.1"
                  value={roomDims.width || ''}
                  onChange={(e) => handleDimensionChange(room, 'width', e.target.value)}
                  className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {roomDims.sqft || 0} sq ft
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomDimensionsForm;
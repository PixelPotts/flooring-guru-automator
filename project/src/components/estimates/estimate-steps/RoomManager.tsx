import React from 'react';
import RoomDimensionsForm from '../RoomDimensionsForm';

interface RoomManagerProps {
  rooms: string[];
  dimensions: Record<string, { length: number; width: number; sqft: number }>;
  onUpdate: (
    rooms: string[],
    dimensions: Record<string, { length: number; width: number; sqft: number }>
  ) => void;
  onBack: () => void;
  onNext: () => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({
  rooms,
  dimensions,
  onUpdate,
  onBack,
  onNext
}) => {
  return (
    <div>
      <RoomDimensionsForm
        rooms={rooms}
        dimensions={dimensions}
        onAddRoom={(room) => {
          const newRooms = [...rooms, room];
          const newDimensions = {
            ...dimensions,
            [room]: { length: 0, width: 0, sqft: 0 }
          };
          onUpdate(newRooms, newDimensions);
        }}
        onRemoveRoom={(room) => {
          const newRooms = rooms.filter(r => r !== room);
          const { [room]: _, ...newDimensions } = dimensions;
          onUpdate(newRooms, newDimensions);
        }}
        onUpdateDimensions={(room, field, value) => {
          const current = dimensions[room] || { length: 0, width: 0, sqft: 0 };
          const updated = { ...current, [field]: value };
          updated.sqft = updated.length * updated.width;
          onUpdate(rooms, { ...dimensions, [room]: updated });
        }}
      />
      
      <div className="mt-4 flex justify-between">
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
          disabled={!rooms.length}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Next: Select Materials
        </button>
      </div>
    </div>
  );
};

export default RoomManager;
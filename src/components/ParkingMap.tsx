
import React from 'react';

interface ParkingMapProps {
  availableSlots: number[];
  selectedSlot?: number;
  onSlotSelect: (slotNumber: number) => void;
  loading?: boolean;
}

const ParkingMap: React.FC<ParkingMapProps> = ({ 
  availableSlots, 
  selectedSlot, 
  onSlotSelect,
  loading = false
}) => {
  // Create a 5x8 grid for 40 parking slots
  const rows = 5;
  const columns = 8;
  
  // Generate all slot numbers
  const allSlots = Array.from({ length: rows * columns }, (_, i) => i + 1);
  
  // Determine slot status
  const getSlotStatus = (slotNumber: number) => {
    if (selectedSlot === slotNumber) return 'selected';
    if (availableSlots.includes(slotNumber)) return 'available';
    return 'occupied';
  };
  
  // Handle slot click
  const handleSlotClick = (slotNumber: number) => {
    if (!loading && availableSlots.includes(slotNumber)) {
      onSlotSelect(slotNumber);
    }
  };
  
  return (
    <div className="mt-2 relative">
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-md">
          <div className="text-sm text-muted-foreground">Loading available slots...</div>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded-md shadow-md">
        {/* Building entrance */}
        <div className="mb-4 bg-blue-200 text-blue-800 py-2 text-center text-sm font-medium rounded-md">
          Building Entrance
        </div>
        
        {/* Parking grid */}
        <div className="grid grid-cols-8 gap-2">
          {allSlots.map(slotNumber => {
            const status = getSlotStatus(slotNumber);
            return (
              <div 
                key={slotNumber}
                onClick={() => handleSlotClick(slotNumber)}
                className={`
                  aspect-square flex items-center justify-center rounded-md text-sm font-medium border-2
                  ${status === 'available' ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600 border-green-600' : ''}
                  ${status === 'occupied' ? 'bg-red-500 text-white cursor-not-allowed border-red-600' : ''}
                  ${status === 'selected' ? 'bg-spoton-purple text-white cursor-pointer ring-2 ring-offset-2 ring-spoton-purple border-purple-600' : ''}
                  transition-all shadow-sm
                `}
              >
                {slotNumber}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500 border border-green-600"></div>
            <span className="font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-500 border border-red-600"></div>
            <span className="font-medium">Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-spoton-purple border border-purple-600"></div>
            <span className="font-medium">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingMap;

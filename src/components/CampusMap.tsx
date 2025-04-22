
import React from "react";

// Example: simple campus schematic with building + parking zones
const CampusMap = () => (
  <div className="w-full max-w-xl mx-auto py-4">
    <div className="text-center text-lg font-bold mb-3 text-spoton-purple-darkest">Ajman University Campus Map</div>
    <div className="relative bg-[#E5DEFF] rounded-xl shadow p-8 min-h-[300px] flex items-center justify-center flex-col border border-purple-100">
      {/* Parking lots as colored rectangles */}
      <div className="absolute left-6 top-14">
        <div className="bg-green-100 border-2 border-green-400 w-28 h-16 flex items-center justify-center rounded-lg shadow">
          <span className="font-bold text-green-700 text-sm">Parking J2-A</span>
        </div>
        <span className="block mt-1 text-xs text-center text-gray-700">Law & Arts</span>
      </div>
      <div className="absolute right-8 top-20">
        <div className="bg-yellow-100 border-2 border-yellow-400 w-28 h-16 flex items-center justify-center rounded-lg shadow">
          <span className="font-bold text-yellow-700 text-sm">Parking J2-B</span>
        </div>
        <span className="block mt-1 text-xs text-center text-gray-700">Business Admin</span>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8">
        <div className="bg-blue-100 border-2 border-blue-400 w-32 h-16 flex items-center justify-center rounded-lg shadow">
          <span className="font-bold text-blue-700 text-sm">Parking J2-C</span>
        </div>
        <span className="block mt-1 text-xs text-center text-gray-700">IT Dept</span>
      </div>
      {/* Central campus/entrance */}
      <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
        <div className="bg-white border-4 border-spoton-purple w-36 h-28 flex flex-col items-center justify-center rounded-xl">
          <span className="font-bold text-spoton-purple-darkest text-xl">Ajman University</span>
          <span className="text-muted-foreground text-xs">Main Entrance</span>
        </div>
      </div>
      {/* Legend */}
      <div className="absolute bottom-1 right-3 bg-white/90 rounded-xl px-4 py-2 text-xs flex gap-5 border border-purple-100 shadow">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400 border border-green-700"></div>
          <span>J2-A (Law & Arts)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-700"></div>
          <span>J2-B (Business)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-400 border border-blue-700"></div>
          <span>J2-C (IT)</span>
        </div>
      </div>
    </div>
  </div>
);

export default CampusMap;

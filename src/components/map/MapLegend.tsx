import React from 'react';

export const MapLegend: React.FC = () => (
  <div className="absolute bottom-4 right-4 z-[1000] bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 shadow-xl">
    <div className="text-xs font-semibold text-slate-300 mb-2">Legend</div>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-3 h-3 rounded-sm bg-orange-500" /> <span className="text-slate-300">IU (Integrated Unit)</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-3 h-3 rounded-sm bg-blue-500" /> <span className="text-slate-300">GU (Grinding Unit)</span>
      </div>
      <div className="border-t border-slate-700 my-1.5" />
      <div className="flex items-center gap-2 text-xs">
        <span className="w-6 h-0.5 bg-orange-500 rounded" /> <span className="text-slate-400">Road</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-6 h-0.5 bg-blue-500 rounded" /> <span className="text-slate-400">Rail</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-6 h-0.5 bg-green-500 rounded" /> <span className="text-slate-400">Bulk</span>
      </div>
    </div>
  </div>
);

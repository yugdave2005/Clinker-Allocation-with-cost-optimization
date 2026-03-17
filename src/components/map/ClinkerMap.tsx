import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { useAppStore } from '../../store/appStore';
import { ALL_LOCATIONS, IU_LOCATIONS, GU_LOCATIONS } from '../../data/locations';
import { IUMarker } from './IUMarker';
import { GUMarker } from './GUMarker';
import { AllocationLine } from './AllocationLine';
import { MapLegend } from './MapLegend';
import { setOnRouteLoaded } from '../../lib/routing';
import 'leaflet/dist/leaflet.css';

// Fix 2: Click map background to deselect node
function MapClickHandler() {
  const setSelectedNodeCode = useAppStore((s) => s.setSelectedNodeCode);
  useMapEvents({
    click: () => setSelectedNodeCode(null),
  });
  return null;
}

export const ClinkerMap: React.FC = () => {
  const { currentResult, activePeriod } = useAppStore();

  // Fix 1: Route loading tracking
  const [routesLoaded, setRoutesLoaded] = useState(0);

  const filteredAllocations = currentResult?.allocationPlan.filter(
    (a) => activePeriod === 'ALL' || a.period === activePeriod
  ) ?? [];

  const totalRoutes = filteredAllocations.filter((a) => a.quantityMt > 0).length;

  useEffect(() => {
    setRoutesLoaded(0);
    setOnRouteLoaded(() => {
      setRoutesLoaded((prev) => prev + 1);
    });
    return () => setOnRouteLoaded(null);
  }, [currentResult, activePeriod]);

  const isLoadingRoutes = totalRoutes > 0 && routesLoaded < totalRoutes;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        style={{ background: '#0f172a' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fix 2: Map click deselects node */}
        <MapClickHandler />

        {/* IU Markers */}
        {IU_LOCATIONS.map((loc) => (
          <IUMarker key={loc.id} location={loc} />
        ))}

        {/* GU Markers */}
        {GU_LOCATIONS.map((loc) => (
          <GUMarker key={loc.id} location={loc} />
        ))}

        {/* Allocation Flow Lines */}
        {filteredAllocations.map((entry, idx) => {
          const fromLoc = ALL_LOCATIONS.find((l) => l.code === entry.fromCode);
          const toLoc = ALL_LOCATIONS.find((l) => l.code === entry.toCode);
          if (!fromLoc || !toLoc || entry.quantityMt <= 0) return null;
          return (
            <AllocationLine
              key={`${entry.fromCode}-${entry.toCode}-${entry.period}-${entry.modeCode}-${idx}`}
              from={[fromLoc.latitude, fromLoc.longitude]}
              to={[toLoc.latitude, toLoc.longitude]}
              mode={entry.modeCode}
              quantity={entry.quantityMt}
              entry={entry}
            />
          );
        })}
      </MapContainer>

      <MapLegend />

      {/* Fix 1: Route loading badge */}
      {isLoadingRoutes && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800/95 backdrop-blur-sm border border-violet-500/30 rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-300 font-medium">
            Loading routes… {Math.min(routesLoaded, totalRoutes)}/{totalRoutes}
          </span>
        </div>
      )}
    </div>
  );
};

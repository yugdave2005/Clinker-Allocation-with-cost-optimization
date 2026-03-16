import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useAppStore } from '../../store/appStore';
import { ALL_LOCATIONS, IU_LOCATIONS, GU_LOCATIONS } from '../../data/locations';
import { IUMarker } from './IUMarker';
import { GUMarker } from './GUMarker';
import { AllocationLine } from './AllocationLine';
import { MapLegend } from './MapLegend';
import 'leaflet/dist/leaflet.css';

export const ClinkerMap: React.FC = () => {
  const { currentResult, activePeriod } = useAppStore();

  const filteredAllocations = currentResult?.allocationPlan.filter(
    (a) => activePeriod === 'ALL' || a.period === activePeriod
  ) ?? [];

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
    </div>
  );
};

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../../pso/types';
import { useAppStore } from '../../store/appStore';
import { NodePopup } from './NodePopup';

interface Props {
  location: Location;
}

const iuIcon = (code: string) =>
  L.divIcon({
    className: 'custom-iu-marker',
    html: `<div style="
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(249,115,22,0.4);
      border: 2px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      gap: 4px;
    ">🏭 ${code}</div>`,
    iconSize: [70, 28],
    iconAnchor: [35, 14],
  });

export const IUMarker: React.FC<Props> = ({ location }) => {
  const setSelectedNode = useAppStore((s) => s.setSelectedNode);

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={iuIcon(location.code)}
      eventHandlers={{
        click: () => setSelectedNode(location),
      }}
    >
      <Popup maxWidth={380} className="custom-popup">
        <NodePopup location={location} />
      </Popup>
    </Marker>
  );
};

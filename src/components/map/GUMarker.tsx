import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../../pso/types';
import { useAppStore } from '../../store/appStore';
import { NodePopup } from './NodePopup';

interface Props {
  location: Location;
}

const createGUIcon = (code: string, isSelected: boolean, isFaded: boolean) =>
  L.divIcon({
    className: 'custom-gu-marker',
    html: `<div style="
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
      box-shadow: ${isSelected ? '0 0 0 4px rgba(255,255,255,0.3), 0 2px 8px rgba(59,130,246,0.6)' : '0 2px 8px rgba(59,130,246,0.4)'};
      border: ${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.3)'};
      opacity: ${isFaded ? '0.35' : '1'};
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.3s, box-shadow 0.3s;
    ">🏗️ ${code}</div>`,
    iconSize: [65, 28],
    iconAnchor: [32, 14],
  });

export const GUMarker: React.FC<Props> = ({ location }) => {
  const { selectedNodeCode, setSelectedNodeCode, setSelectedNode } = useAppStore();

  const isSelected = selectedNodeCode === location.code;
  const isFaded = selectedNodeCode !== null && !isSelected;
  const icon = useMemo(() => createGUIcon(location.code, isSelected, isFaded), [location.code, isSelected, isFaded]);

  const handleClick = () => {
    if (isSelected) {
      setSelectedNodeCode(null);
    } else {
      setSelectedNodeCode(location.code);
    }
    setSelectedNode(location);
  };

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup maxWidth={380} className="custom-popup">
        <NodePopup location={location} />
      </Popup>
    </Marker>
  );
};

import React, { useEffect, useState, memo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import type { AllocationEntry } from '../../pso/types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { fetchRouteQueued, notifyRouteLoaded } from '../../lib/routing';
import { useAppStore } from '../../store/appStore';

interface Props {
  from: [number, number];
  to: [number, number];
  mode: string;
  quantity: number;
  entry: AllocationEntry;
}

const MODE_COLORS: Record<string, string> = {
  ROAD: '#f97316',
  RAIL: '#3b82f6',
  BULK: '#22c55e',
};

const MODE_STYLES: Record<string, { dashArray?: string; weight: number; opacity: number }> = {
  ROAD: { weight: 3, opacity: 0.8 },
  RAIL: { dashArray: '12 6', weight: 4, opacity: 0.9 },
  BULK: { dashArray: '4 4', weight: 3, opacity: 0.8 },
};

export const AllocationLine: React.FC<Props> = memo(({ from, to, mode, quantity, entry }) => {
  const selectedNodeCode = useAppStore((s) => s.selectedNodeCode);

  const baseColor = MODE_COLORS[mode] || '#8b5cf6';
  const baseWeight = Math.max(MODE_STYLES[mode]?.weight ?? 3, Math.log(quantity / 1000) * 3);
  const baseOpacity = MODE_STYLES[mode]?.opacity ?? 0.8;
  const baseDash = MODE_STYLES[mode]?.dashArray;

  // ─── Fix 2: Highlight / fade logic ──────────────────────
  const isRelated =
    selectedNodeCode === null ||
    entry.fromCode === selectedNodeCode ||
    entry.toCode === selectedNodeCode;

  let finalColor = baseColor;
  let finalWeight = baseWeight;
  let finalOpacity = baseOpacity;
  let showGlow = false;

  if (selectedNodeCode !== null) {
    if (isRelated) {
      finalOpacity = 1.0;
      finalWeight = baseWeight + 2;
      showGlow = true;
    } else {
      finalColor = '#475569';
      finalWeight = 1;
      finalOpacity = 0.08;
    }
  }

  // ─── Fix 1: OSRM route fetching ────────────────────────
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchRouteQueued(
      { lat: from[0], lng: from[1] },
      { lat: to[0], lng: to[1] },
      mode as 'ROAD' | 'RAIL' | 'BULK'
    ).then((result) => {
      if (!cancelled) {
        setRouteCoords(result.coordinates);
        setLoaded(true);
        notifyRouteLoaded();
      }
    });

    return () => { cancelled = true; };
  }, [from[0], from[1], to[0], to[1], mode]);

  const positions = loaded && routeCoords && routeCoords.length > 1
    ? routeCoords
    : [from, to];

  const tooltipContent = (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: '1.5' }}>
      <strong>{entry.fromCode} → {entry.toCode}</strong><br />
      {formatNumber(entry.quantityMt)} MT · {entry.trips} trips · {mode}<br />
      {entry.distanceKm} km · {formatCurrency(entry.cost)}<br />
      Period {entry.period}
      {loaded && routeCoords && <><br /><span style={{ color: '#94a3b8', fontSize: '10px' }}>📍 Real route via OSRM</span></>}
    </div>
  );

  return (
    <>
      {/* Glow layer (only when node is selected and this line is related) */}
      {showGlow && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: baseColor,
            weight: finalWeight + 6,
            opacity: 0.2,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* Main line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: finalColor,
          weight: finalWeight,
          opacity: finalOpacity,
          dashArray: baseDash,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      >
        <Tooltip sticky>{tooltipContent}</Tooltip>
      </Polyline>
    </>
  );
});

import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import type { AllocationEntry } from '../../pso/types';
import { formatCurrency, formatNumber } from '../../lib/utils';

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

export const AllocationLine: React.FC<Props> = ({ from, to, mode, quantity, entry }) => {
  const color = MODE_COLORS[mode] || '#8b5cf6';
  const weight = Math.max(1.5, Math.log(quantity / 1000) * 3);

  return (
    <Polyline
      positions={[from, to]}
      pathOptions={{
        color,
        weight,
        opacity: 0.7,
        dashArray: '8 12',
        lineCap: 'round',
      }}
    >
      <Tooltip sticky>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: '1.5' }}>
          <strong>{entry.fromCode} → {entry.toCode}</strong><br />
          {formatNumber(entry.quantityMt)} MT · {entry.trips} trips · {mode}<br />
          {entry.distanceKm} km · {formatCurrency(entry.cost)}<br />
          Period {entry.period}
        </div>
      </Tooltip>
    </Polyline>
  );
};

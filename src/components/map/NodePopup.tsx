import React from 'react';
import type { Location } from '../../pso/types';
import { useAppStore } from '../../store/appStore';
import { formatNumber } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface Props {
  location: Location;
}

export const NodePopup: React.FC<Props> = ({ location }) => {
  const currentResult = useAppStore((s) => s.currentResult);

  const allocations = currentResult?.allocationPlan.filter(
    (a) => a.fromCode === location.code || a.toCode === location.code
  ) ?? [];

  const inventorySnaps = currentResult?.inventoryPlan.filter(
    (s) => s.locationCode === location.code
  ) ?? [];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '280px', color: '#f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>{location.type === 'IU' ? '🏭' : '🏗️'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{location.code} — {location.name}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{location.state} · {location.type === 'IU' ? 'Integrated Unit' : 'Grinding Unit'}</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
        {location.type === 'IU' && (
          <>
            <div><span style={{ color: '#64748b' }}>Capacity:</span> {formatNumber(location.prodCapacity || 0)} MT</div>
            <div><span style={{ color: '#64748b' }}>Prod Cost:</span> ₹{location.prodCostPerMt}/MT</div>
          </>
        )}
        <div><span style={{ color: '#64748b' }}>Initial Inv:</span> {formatNumber(location.initialInventory)} MT</div>
        <div><span style={{ color: '#64748b' }}>Safety Stock:</span> {formatNumber(location.safetyStock)} MT</div>
        <div><span style={{ color: '#64748b' }}>Max Inv:</span> {formatNumber(location.maxInventory)} MT</div>
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px' }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Demand (P1 / P2 / P3):</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
          {formatNumber(location.demand[0])} / {formatNumber(location.demand[1])} / {formatNumber(location.demand[2])} MT
        </div>
      </div>

      {allocations.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Allocations:</div>
          {allocations.slice(0, 5).map((a, i) => (
            <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #f1f5f9' }}>
              {a.fromCode === location.code ? `→ ${a.toCode}` : `← ${a.fromCode}`} · {formatNumber(a.quantityMt)} MT · {a.modeCode} · P{a.period}
            </div>
          ))}
          {allocations.length > 5 && <div style={{ color: '#94a3b8' }}>+{allocations.length - 5} more...</div>}
        </div>
      )}

      {inventorySnaps.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Inventory Profile:</div>
          {inventorySnaps.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span>Period {s.period}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {formatNumber(s.openingInv)} → {formatNumber(s.closingInv)} MT
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

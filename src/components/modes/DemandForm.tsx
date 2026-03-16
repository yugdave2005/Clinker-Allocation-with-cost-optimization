import React from 'react';
import { useAppStore } from '../../store/appStore';

interface Props {
  location: { code: string; name: string; type: 'IU' | 'GU'; demand: [number, number, number] };
}

export const DemandForm: React.FC<Props> = ({ location }) => {
  const { demandOverrides, setDemandOverride } = useAppStore();
  const current = demandOverrides[location.code] || location.demand;

  const handleChange = (period: number, value: string) => {
    const numVal = parseInt(value) || 0;
    const newDemand: [number, number, number] = [...current] as [number, number, number];
    newDemand[period] = numVal;
    setDemandOverride(location.code, newDemand);
  };

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((p) => (
        <input
          key={p}
          type="number"
          value={current[p]}
          onChange={(e) => handleChange(p, e.target.value)}
          className="w-16 bg-slate-700 border border-slate-600 rounded px-1.5 py-1 text-xs text-right font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          min={0}
        />
      ))}
    </div>
  );
};

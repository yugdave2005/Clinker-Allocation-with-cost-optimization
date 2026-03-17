import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../lib/utils';

// Filter button component
const FilterBtn: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 text-xs rounded-md transition-colors font-medium ${active ? 'bg-violet-600 text-white' : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600 hover:text-slate-300'}`}
  >
    {label}
  </button>
);

// Range filter dropdown
const RangeFilter: React.FC<{
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-700/60 text-slate-300 text-xs rounded-md px-2 py-1 border border-slate-600 focus:outline-none focus:border-violet-500 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export const AllocationTable: React.FC = () => {
  const { currentResult, activePeriod } = useAppStore();
  const [sortCol, setSortCol] = useState<string>('period');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filters
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [volumeFilter, setVolumeFilter] = useState<string>('ALL');
  const [distanceFilter, setDistanceFilter] = useState<string>('ALL');
  const [costFilter, setCostFilter] = useState<string>('ALL');

  const plan = currentResult?.allocationPlan ?? [];

  const filtered = useMemo(() => {
    let data = plan.filter((a) => {
      // Period filter (use activePeriod from global OR local filter)
      const period = periodFilter !== 'ALL' ? Number(periodFilter) : activePeriod;
      if (period !== 'ALL' && a.period !== period) return false;

      // Transport mode
      if (modeFilter !== 'ALL' && a.modeCode !== modeFilter) return false;

      // Volume ranges
      if (volumeFilter === '<1000' && a.quantityMt >= 1000) return false;
      if (volumeFilter === '1000-5000' && (a.quantityMt < 1000 || a.quantityMt > 5000)) return false;
      if (volumeFilter === '5000-20000' && (a.quantityMt < 5000 || a.quantityMt > 20000)) return false;
      if (volumeFilter === '>20000' && a.quantityMt <= 20000) return false;

      // Distance ranges
      if (distanceFilter === '<200' && a.distanceKm >= 200) return false;
      if (distanceFilter === '200-500' && (a.distanceKm < 200 || a.distanceKm > 500)) return false;
      if (distanceFilter === '500-1000' && (a.distanceKm < 500 || a.distanceKm > 1000)) return false;
      if (distanceFilter === '>1000' && a.distanceKm <= 1000) return false;

      // Cost ranges
      if (costFilter === '<1L' && a.cost >= 100000) return false;
      if (costFilter === '1L-10L' && (a.cost < 100000 || a.cost > 1000000)) return false;
      if (costFilter === '10L-1Cr' && (a.cost < 1000000 || a.cost > 10000000)) return false;
      if (costFilter === '>1Cr' && a.cost <= 10000000) return false;

      return true;
    });

    data = [...data].sort((a, b) => {
      const aVal = (a as any)[sortCol];
      const bVal = (b as any)[sortCol];
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

    return data;
  }, [plan, activePeriod, modeFilter, periodFilter, volumeFilter, distanceFilter, costFilter, sortCol, sortDir]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const resetFilters = () => {
    setModeFilter('ALL');
    setPeriodFilter('ALL');
    setVolumeFilter('ALL');
    setDistanceFilter('ALL');
    setCostFilter('ALL');
  };

  const hasActiveFilter = modeFilter !== 'ALL' || periodFilter !== 'ALL' || volumeFilter !== 'ALL' || distanceFilter !== 'ALL' || costFilter !== 'ALL';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Allocation Results</CardTitle>
            {filtered.length > 0 && (
              <span className="text-xs text-slate-500">{filtered.length} entries</span>
            )}
          </div>
          {hasActiveFilter && (
            <button onClick={resetFilters} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-700/50">
          {/* Transport Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mode</span>
            <div className="flex gap-1">
              {['ALL', 'ROAD', 'RAIL', 'BULK'].map((m) => (
                <FilterBtn key={m} label={m} active={modeFilter === m} onClick={() => setModeFilter(m)} />
              ))}
            </div>
          </div>

          {/* Period */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Period</span>
            <div className="flex gap-1">
              {['ALL', '1', '2', '3'].map((p) => (
                <FilterBtn key={p} label={p === 'ALL' ? 'ALL' : `P${p}`} active={periodFilter === p} onClick={() => setPeriodFilter(p)} />
              ))}
            </div>
          </div>

          {/* Volume */}
          <RangeFilter
            label="Volume"
            value={volumeFilter}
            onChange={setVolumeFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: '< 1,000 MT', value: '<1000' },
              { label: '1k – 5k MT', value: '1000-5000' },
              { label: '5k – 20k MT', value: '5000-20000' },
              { label: '> 20,000 MT', value: '>20000' },
            ]}
          />

          {/* Distance */}
          <RangeFilter
            label="Distance"
            value={distanceFilter}
            onChange={setDistanceFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: '< 200 km', value: '<200' },
              { label: '200 – 500 km', value: '200-500' },
              { label: '500 – 1000 km', value: '500-1000' },
              { label: '> 1000 km', value: '>1000' },
            ]}
          />

          {/* Cost */}
          <RangeFilter
            label="Cost"
            value={costFilter}
            onChange={setCostFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: '< ₹1 Lakh', value: '<1L' },
              { label: '₹1L – ₹10L', value: '1L-10L' },
              { label: '₹10L – ₹1Cr', value: '10L-1Cr' },
              { label: '> ₹1 Crore', value: '>1Cr' },
            ]}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">
            {plan.length === 0 ? 'No allocation data yet. Run PSO to generate results.' : 'No results match the current filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-400 border-b border-slate-700">
                  {[
                    { key: 'period', label: 'Period' },
                    { key: 'fromCode', label: 'From' },
                    { key: 'toCode', label: 'To' },
                    { key: 'modeCode', label: 'Mode' },
                    { key: 'quantityMt', label: 'Quantity MT' },
                    { key: 'trips', label: 'Trips' },
                    { key: 'distanceKm', label: 'Dist km' },
                    { key: 'cost', label: 'Cost ₹' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="text-left py-2 px-2 cursor-pointer hover:text-slate-200 select-none"
                    >
                      {label} {sortCol === key && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-1.5 px-2 font-mono">P{a.period}</td>
                    <td className="py-1.5 px-2"><Badge variant="iu">{a.fromCode}</Badge></td>
                    <td className="py-1.5 px-2"><Badge variant="gu">{a.toCode}</Badge></td>
                    <td className="py-1.5 px-2">
                      <Badge variant={a.modeCode.toLowerCase() as any}>{a.modeCode}</Badge>
                    </td>
                    <td className="py-1.5 px-2 font-mono text-right">{formatNumber(a.quantityMt)}</td>
                    <td className="py-1.5 px-2 font-mono text-right">{a.trips}</td>
                    <td className="py-1.5 px-2 font-mono text-right">{formatNumber(a.distanceKm)}</td>
                    <td className="py-1.5 px-2 font-mono text-right">{formatCurrency(a.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

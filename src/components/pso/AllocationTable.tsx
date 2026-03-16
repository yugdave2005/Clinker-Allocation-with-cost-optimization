import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../lib/utils';

export const AllocationTable: React.FC = () => {
  const { currentResult, activePeriod } = useAppStore();
  const [sortCol, setSortCol] = useState<string>('period');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modeFilter, setModeFilter] = useState<string>('ALL');

  const plan = currentResult?.allocationPlan ?? [];

  let filtered = plan.filter((a) => {
    if (activePeriod !== 'ALL' && a.period !== activePeriod) return false;
    if (modeFilter !== 'ALL' && a.modeCode !== modeFilter) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortCol];
    const bVal = (b as any)[sortCol];
    if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Allocation Results</CardTitle>
          <div className="flex gap-2">
            {['ALL', 'ROAD', 'RAIL', 'BULK'].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${modeFilter === m ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">No allocation data yet. Run PSO to generate results.</div>
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

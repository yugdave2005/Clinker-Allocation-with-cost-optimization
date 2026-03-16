import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { IU_LOCATIONS, GU_LOCATIONS } from '../../data/locations';
import { PSOControls } from '../pso/PSOControls';
import { DemandForm } from './DemandForm';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { usePSO } from '../../hooks/usePSO';
import { formatCurrency } from '../../lib/utils';
import { Play, Search, Zap } from 'lucide-react';

export const ManualMode: React.FC = () => {
  const { psoStatus, psoProgress, currentIteration, currentResult, demandOverrides, clearDemandOverrides } = useAppStore();
  const { run } = usePSO();
  const [search, setSearch] = useState('');

  const allLocations = [...IU_LOCATIONS, ...GU_LOCATIONS];
  const filtered = allLocations.filter(
    (l) =>
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* Overrides count */}
      {Object.keys(demandOverrides).length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-violet-400">{Object.keys(demandOverrides).length} overrides active</span>
          <button onClick={clearDemandOverrides} className="text-xs text-slate-500 hover:text-slate-300">Clear all</button>
        </div>
      )}

      {/* Location list with demand inputs */}
      <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-slate-700 p-2">
        <div className="grid grid-cols-[1fr_auto] gap-1 text-[10px] text-slate-500 pb-1 border-b border-slate-700 px-1">
          <span>Location</span>
          <span className="text-right">P1 / P2 / P3 (MT)</span>
        </div>
        {filtered.map((loc) => (
          <div key={loc.code} className="flex items-center justify-between py-1 px-1 rounded hover:bg-slate-700/30 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant={loc.type === 'IU' ? 'iu' : 'gu'}>{loc.code}</Badge>
              <span className="text-xs text-slate-300 truncate">{loc.name.split('–')[1]?.trim() || loc.name}</span>
            </div>
            <DemandForm location={loc} />
          </div>
        ))}
      </div>

      {/* PSO Params */}
      <PSOControls />

      {/* Run Button */}
      <Button
        onClick={() => run()}
        disabled={psoStatus === 'RUNNING'}
        className="w-full"
        size="lg"
      >
        {psoStatus === 'RUNNING' ? (
          <>
            <Spinner size="sm" className="text-white" />
            Running... {currentIteration} iters ({psoProgress}%)
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Optimization
          </>
        )}
      </Button>

      {/* Progress */}
      {psoStatus === 'RUNNING' && (
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-violet-600 to-violet-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${psoProgress}%` }}
          />
        </div>
      )}

      {/* Result */}
      {currentResult && psoStatus === 'DONE' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" /> Optimization Complete
          </div>
          <div className="text-slate-300">
            Total Cost: <span className="font-mono font-semibold text-emerald-300">{formatCurrency(currentResult.bestCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

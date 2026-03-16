import React from 'react';
import { useAppStore } from '../../store/appStore';
import { IU_LOCATIONS, GU_LOCATIONS } from '../../data/locations';
import { PSOControls } from '../pso/PSOControls';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { usePSO } from '../../hooks/usePSO';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Play, Zap } from 'lucide-react';

export const AutoMode: React.FC = () => {
  const { psoStatus, psoProgress, currentIteration, activePeriod, setActivePeriod, currentResult } = useAppStore();
  const { run } = usePSO();

  const allLocations = [...IU_LOCATIONS, ...GU_LOCATIONS];

  return (
    <div className="space-y-4 p-4">
      {/* Period Selector */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Period</h3>
        <div className="flex gap-1.5">
          {(['ALL', 1, 2, 3] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p as any)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                activePeriod === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {p === 'ALL' ? 'All' : `P${p}`}
            </button>
          ))}
        </div>
      </div>

      {/* Demand Table (read-only) */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Demand Overview</h3>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-700">
          <table className="w-full text-xs">
            <thead className="bg-slate-800 sticky top-0">
              <tr className="text-slate-500">
                <th className="text-left py-1.5 px-2">Node</th>
                <th className="text-right py-1.5 px-1">P1</th>
                <th className="text-right py-1.5 px-1">P2</th>
                <th className="text-right py-1.5 px-1">P3</th>
              </tr>
            </thead>
            <tbody>
              {allLocations.map((loc) => (
                <tr key={loc.code} className="border-t border-slate-700/50">
                  <td className="py-1 px-2">
                    <Badge variant={loc.type === 'IU' ? 'iu' : 'gu'}>{loc.code}</Badge>
                  </td>
                  <td className="py-1 px-1 text-right font-mono text-slate-300">{formatNumber(loc.demand[0])}</td>
                  <td className="py-1 px-1 text-right font-mono text-slate-300">{formatNumber(loc.demand[1])}</td>
                  <td className="py-1 px-1 text-right font-mono text-slate-300">{formatNumber(loc.demand[2])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {/* Last result summary */}
      {currentResult && psoStatus === 'DONE' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" /> Optimization Complete
          </div>
          <div className="text-slate-300 space-y-0.5">
            <div>Total Cost: <span className="font-mono font-semibold text-emerald-300">{formatCurrency(currentResult.bestCost)}</span></div>
            <div>Iterations: <span className="font-mono">{currentResult.iterationsRun}</span> · Converged: {currentResult.converged ? '✅' : '❌'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

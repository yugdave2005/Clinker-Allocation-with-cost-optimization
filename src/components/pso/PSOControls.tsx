import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Spinner } from '../ui/Spinner';

export const PSOControls: React.FC = () => {
  const { psoConfig, setPsoConfig } = useAppStore();

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PSO Parameters</h3>

      {/* Swarm Size */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Swarm Size</span>
          <span className="text-slate-200 font-mono">{psoConfig.swarmSize}</span>
        </div>
        <input
          type="range" min={20} max={200} step={10}
          value={psoConfig.swarmSize}
          onChange={(e) => setPsoConfig({ swarmSize: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Max Iterations */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Max Iterations</span>
          <span className="text-slate-200 font-mono">{psoConfig.maxIterations}</span>
        </div>
        <input
          type="range" min={50} max={500} step={10}
          value={psoConfig.maxIterations}
          onChange={(e) => setPsoConfig({ maxIterations: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Inertia w */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Inertia (w)</span>
          <span className="text-slate-200 font-mono">{psoConfig.wStart.toFixed(1)} → {psoConfig.wEnd.toFixed(1)}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="range" min={0.5} max={0.9} step={0.1}
            value={psoConfig.wStart}
            onChange={(e) => setPsoConfig({ wStart: Number(e.target.value) })}
            className="w-1/2 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <input
            type="range" min={0.1} max={0.5} step={0.1}
            value={psoConfig.wEnd}
            onChange={(e) => setPsoConfig({ wEnd: Number(e.target.value) })}
            className="w-1/2 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>

      {/* c1 */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Cognitive (c1)</span>
          <span className="text-slate-200 font-mono">{psoConfig.c1.toFixed(1)}</span>
        </div>
        <input
          type="range" min={1.0} max={3.0} step={0.1}
          value={psoConfig.c1}
          onChange={(e) => setPsoConfig({ c1: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* c2 */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Social (c2)</span>
          <span className="text-slate-200 font-mono">{psoConfig.c2.toFixed(1)}</span>
        </div>
        <input
          type="range" min={1.0} max={3.0} step={0.1}
          value={psoConfig.c2}
          onChange={(e) => setPsoConfig({ c2: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Penalty Lambda */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Penalty λ</span>
          <span className="text-slate-200 font-mono">{psoConfig.penaltyLambda.toExponential(0)}</span>
        </div>
        <select
          value={psoConfig.penaltyLambda}
          onChange={(e) => setPsoConfig({ penaltyLambda: Number(e.target.value) })}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value={1e4}>1×10⁴</option>
          <option value={1e5}>1×10⁵</option>
          <option value={1e6}>1×10⁶</option>
        </select>
      </div>
    </div>
  );
};

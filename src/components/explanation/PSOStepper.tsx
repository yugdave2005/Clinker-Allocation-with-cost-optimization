import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PSOStepper: React.FC = () => {
  const { currentResult } = useAppStore();
  const [step, setStep] = useState(0);

  if (!currentResult || currentResult.convergenceData.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8 text-sm">
        Run a PSO optimization first to see the execution trace.
      </div>
    );
  }

  const data = currentResult.convergenceData;
  const milestones = [
    data[0],
    data[Math.min(9, data.length - 1)],
    data[Math.min(Math.floor(data.length / 4), data.length - 1)],
    data[Math.min(Math.floor(data.length / 2), data.length - 1)],
    data[Math.min(Math.floor(data.length * 3 / 4), data.length - 1)],
    data[data.length - 1],
  ].filter((v, i, arr) => v && arr.findIndex(a => a?.iter === v?.iter) === i);

  const current = milestones[step];
  if (!current) return null;

  const prevCost = step > 0 ? milestones[step - 1].bestCost : current.bestCost;
  const improvement = prevCost > 0 ? ((prevCost - current.bestCost) / prevCost * 100) : 0;

  const labels = [
    `Initial cost evaluation at iteration ${current.iter}`,
    `Early exploration phase — cost improving`,
    `Swarm is converging on promising regions`,
    `Mid-optimization — major improvements found`,
    `Fine-tuning — approaching optimal solution`,
    `Final — Optimal plan found at iteration ${current.iter}`,
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Step {step + 1} of {milestones.length}</span>
          <span className="text-xs font-mono text-violet-400">Iter {current.iter}</span>
        </div>
        <div className="text-sm text-slate-200 font-medium mb-2">
          {labels[Math.min(step, labels.length - 1)]}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500">Best Cost:</span>{' '}
            <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(current.bestCost)}</span>
          </div>
          {improvement > 0 && (
            <div className="text-emerald-400">↓ {improvement.toFixed(2)}% improvement</div>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {milestones.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-violet-500 scale-125' : i < step ? 'bg-violet-500/40' : 'bg-slate-600'}`}
          />
        ))}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep((s) => Math.min(milestones.length - 1, s + 1))}
          disabled={step === milestones.length - 1}
          className="flex-1"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

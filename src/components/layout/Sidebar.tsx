import React from 'react';
import { useAppStore } from '../../store/appStore';
import { AutoMode } from '../modes/AutoMode';
import { ManualMode } from '../modes/ManualMode';
import { Bot, Pencil } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeMode, setActiveMode, activeTab } = useAppStore();

  if (activeTab !== 'MAP') return null;

  return (
    <div className="w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Mode Selector */}
      <div className="p-3 space-y-2 border-b border-slate-700">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveMode('AUTO')}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
              activeMode === 'AUTO'
                ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 ring-1 ring-violet-500/30'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span>AUTO</span>
            <span className="text-[10px] text-slate-500">From database</span>
          </button>
          <button
            onClick={() => setActiveMode('MANUAL')}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
              activeMode === 'MANUAL'
                ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 ring-1 ring-violet-500/30'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Pencil className="w-5 h-5" />
            <span>MANUAL</span>
            <span className="text-[10px] text-slate-500">Custom demand</span>
          </button>
        </div>
      </div>

      {/* Mode Content */}
      <div className="flex-1 overflow-y-auto">
        {activeMode === 'AUTO' ? <AutoMode /> : <ManualMode />}
      </div>
    </div>
  );
};

import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Map, BarChart3, HelpCircle } from 'lucide-react';

const TABS = [
  { key: 'MAP' as const, label: 'Map & Allocation', icon: Map },
  { key: 'DASHBOARD' as const, label: 'Dashboard', icon: BarChart3 },
  { key: 'HOW_IT_WORKS' as const, label: 'How It Works', icon: HelpCircle },
];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4">
      <div className="flex items-center h-14 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
            C
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none">ClinkerPSO</div>
            <div className="text-[10px] text-slate-500 leading-none mt-0.5">Supply Chain Optimizer</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

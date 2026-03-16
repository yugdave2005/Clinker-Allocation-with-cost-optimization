import { create } from 'zustand';
import type { Location, TransportMode, PSOConfig, PSOResult, AllocationEntry, AllocationRun } from '../pso/types';
import { DEFAULT_PSO_CONFIG } from '../pso/types';

interface AppState {
  // Mode
  activeMode: 'AUTO' | 'MANUAL';
  activeTab: 'MAP' | 'DASHBOARD' | 'HOW_IT_WORKS';
  activePeriod: 1 | 2 | 3 | 'ALL';

  // Data
  locations: Location[];
  distances: number[][];
  modes: TransportMode[];

  // PSO
  psoConfig: PSOConfig;
  demandOverrides: Record<string, [number, number, number]>;
  psoStatus: 'IDLE' | 'RUNNING' | 'DONE' | 'ERROR';
  psoProgress: number;
  currentIteration: number;
  liveConvergence: { iter: number; cost: number }[];

  // Results
  currentResult: PSOResult | null;
  runHistory: AllocationRun[];

  // UI
  selectedNode: Location | null;
  hoveredLine: AllocationEntry | null;

  // Actions
  setActiveMode: (mode: 'AUTO' | 'MANUAL') => void;
  setActiveTab: (tab: 'MAP' | 'DASHBOARD' | 'HOW_IT_WORKS') => void;
  setActivePeriod: (period: 1 | 2 | 3 | 'ALL') => void;
  setLocations: (locations: Location[]) => void;
  setDistances: (distances: number[][]) => void;
  setModes: (modes: TransportMode[]) => void;
  setPsoConfig: (config: Partial<PSOConfig>) => void;
  setDemandOverride: (code: string, demand: [number, number, number]) => void;
  clearDemandOverrides: () => void;
  setPsoStatus: (status: 'IDLE' | 'RUNNING' | 'DONE' | 'ERROR') => void;
  setPsoProgress: (progress: number) => void;
  setCurrentIteration: (iter: number) => void;
  addConvergencePoint: (point: { iter: number; cost: number }) => void;
  resetConvergence: () => void;
  setCurrentResult: (result: PSOResult | null) => void;
  addRunHistory: (run: AllocationRun) => void;
  setSelectedNode: (node: Location | null) => void;
  setHoveredLine: (line: AllocationEntry | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Mode
  activeMode: 'AUTO',
  activeTab: 'MAP',
  activePeriod: 'ALL',

  // Data
  locations: [],
  distances: [],
  modes: [],

  // PSO
  psoConfig: DEFAULT_PSO_CONFIG,
  demandOverrides: {},
  psoStatus: 'IDLE',
  psoProgress: 0,
  currentIteration: 0,
  liveConvergence: [],

  // Results
  currentResult: null,
  runHistory: [],

  // UI
  selectedNode: null,
  hoveredLine: null,

  // Actions
  setActiveMode: (mode) => set({ activeMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActivePeriod: (period) => set({ activePeriod: period }),
  setLocations: (locations) => set({ locations }),
  setDistances: (distances) => set({ distances }),
  setModes: (modes) => set({ modes }),
  setPsoConfig: (config) => set((state) => ({ psoConfig: { ...state.psoConfig, ...config } })),
  setDemandOverride: (code, demand) =>
    set((state) => ({ demandOverrides: { ...state.demandOverrides, [code]: demand } })),
  clearDemandOverrides: () => set({ demandOverrides: {} }),
  setPsoStatus: (status) => set({ psoStatus: status }),
  setPsoProgress: (progress) => set({ psoProgress: progress }),
  setCurrentIteration: (iter) => set({ currentIteration: iter }),
  addConvergencePoint: (point) =>
    set((state) => ({ liveConvergence: [...state.liveConvergence, point] })),
  resetConvergence: () => set({ liveConvergence: [] }),
  setCurrentResult: (result) => set({ currentResult: result }),
  addRunHistory: (run) =>
    set((state) => ({ runHistory: [run, ...state.runHistory].slice(0, 10) })),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setHoveredLine: (line) => set({ hoveredLine: line }),
}));

// ─── Location ──────────────────────────────────────────────
export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'IU' | 'GU';
  latitude: number;
  longitude: number;
  state: string;
  prodCapacity?: number;
  prodCostPerMt?: number;
  initialInventory: number;
  safetyStock: number;
  maxInventory: number;
  demand: [number, number, number];
}

// ─── Transport Mode ────────────────────────────────────────
export interface TransportMode {
  id: string;
  code: 'ROAD' | 'RAIL' | 'BULK';
  name: string;
  costPerMtKm: number;
  capacityMtTrip: number;
  sbqTrips: number;
  description?: string;
}

// ─── PSO Configuration ────────────────────────────────────
export interface PSOConfig {
  swarmSize: number;
  maxIterations: number;
  wStart: number;
  wEnd: number;
  c1: number;
  c2: number;
  maxVelocity: number;
  penaltyLambda: number;
}

export const DEFAULT_PSO_CONFIG: PSOConfig = {
  swarmSize: 60,
  maxIterations: 200,
  wStart: 0.9,
  wEnd: 0.4,
  c1: 2.0,
  c2: 2.0,
  maxVelocity: 15,
  penaltyLambda: 1e6,
};

// ─── Particle ──────────────────────────────────────────────
export interface Particle {
  position: number[][][][]; // [source][dest][period][mode]
  velocity: number[][][][];
  pBest: number[][][][];
  pBestFitness: number;
  fitness: number;
}

// ─── PSO Result ────────────────────────────────────────────
export interface PSOResult {
  bestPosition: number[][][][];
  bestCost: number;
  costBreakdown: {
    production: number;
    transport: number;
    inventory: number;
  };
  convergenceData: { iter: number; bestCost: number }[];
  allocationPlan: AllocationEntry[];
  inventoryPlan: InventorySnapshot[];
  iterationsRun: number;
  converged: boolean;
}

// ─── Allocation Entry ──────────────────────────────────────
export interface AllocationEntry {
  period: number;
  fromCode: string;
  toCode: string;
  modeCode: string;
  quantityMt: number;
  trips: number;
  distanceKm: number;
  cost: number;
}

// ─── Inventory Snapshot ────────────────────────────────────
export interface InventorySnapshot {
  locationCode: string;
  period: number;
  openingInv: number;
  production: number;
  receivedMt: number;
  dispatchedMt: number;
  selfConsumed: number;
  closingInv: number;
}

// ─── Dimensions ────────────────────────────────────────────
export interface Dimensions {
  numSources: number;
  numDests: number;
  numPeriods: number;
  numModes: number;
}

// ─── Allocation Run (DB record) ────────────────────────────
export interface AllocationRun {
  id: string;
  mode: 'AUTO' | 'MANUAL';
  psoParams: PSOConfig;
  demandInput: Record<string, [number, number, number]>;
  totalCost: number | null;
  prodCost: number | null;
  transportCost: number | null;
  inventoryCost: number | null;
  iterationsRun: number | null;
  converged: boolean;
  convergenceData: { iter: number; bestCost: number }[] | null;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  createdAt: string;
}

// ─── Fitness Result ────────────────────────────────────────
export interface FitnessResult {
  total: number;
  production: number;
  transport: number;
  inventory: number;
  violations: number;
}

import type { Location, TransportMode, FitnessResult } from './types';

const HOLDING_COST = 50; // INR/MT/period

/**
 * Compute the fitness (total cost + penalties) for a given particle position.
 */
export function computeFitness(
  position: number[][][][],
  sources: Location[],
  destinations: Location[],
  modes: TransportMode[],
  distances: number[][],
  allLocations: Location[],
  penaltyLambda: number
): FitnessResult {
  const nSources = sources.length;
  const nDests = destinations.length;
  const nPeriods = 3;
  const nModes = modes.length;

  let productionCost = 0;
  let transportCost = 0;
  let inventoryCost = 0;
  let violations = 0;

  // Track inventory for each location across periods
  const srcInv: number[] = sources.map(s => s.initialInventory);
  const dstInv: number[] = destinations.map(d => d.initialInventory);

  for (let t = 0; t < nPeriods; t++) {
    // ── Compute dispatched & received quantities ──
    const dispatched: number[] = new Array(nSources).fill(0);
    const received: number[] = new Array(nDests).fill(0);

    for (let i = 0; i < nSources; i++) {
      for (let j = 0; j < nDests; j++) {
        for (let m = 0; m < nModes; m++) {
          const trips = Math.max(0, Math.round(position[i][j][t][m]));
          if (trips <= 0) continue;

          const qty = trips * modes[m].capacityMtTrip;
          dispatched[i] += qty;
          received[j] += qty;

          // Find source/dest indices in allLocations for distance lookup
          const srcIdx = allLocations.findIndex(l => l.id === sources[i].id);
          const dstIdx = allLocations.findIndex(l => l.id === destinations[j].id);
          const dist = distances[srcIdx][dstIdx];

          // Transport cost = trips × capacity × distance × rate/MT/km
          transportCost += qty * dist * modes[m].costPerMtKm;
        }
      }
    }

    // ── Production at each IU ──
    for (let i = 0; i < nSources; i++) {
      const src = sources[i];
      const selfConsumption = src.demand[t];
      const totalNeeded = selfConsumption + dispatched[i];
      const production = Math.max(0, totalNeeded - srcInv[i]);

      // Production cost
      productionCost += production * (src.prodCostPerMt || 0);

      // Check production capacity
      if (production > (src.prodCapacity || 0)) {
        violations += (production - (src.prodCapacity || 0));
      }

      // Update IU inventory
      srcInv[i] = srcInv[i] + production - selfConsumption - dispatched[i];

      // Check IU inventory constraints
      if (srcInv[i] < 0) {
        violations += Math.abs(srcInv[i]);
      }
      if (srcInv[i] < src.safetyStock) {
        violations += (src.safetyStock - srcInv[i]);
      }
      if (srcInv[i] > src.maxInventory) {
        violations += (srcInv[i] - src.maxInventory);
      }

      // Inventory holding cost for IU
      inventoryCost += Math.max(0, srcInv[i]) * HOLDING_COST;
    }

    // ── GU inventory updates ──
    for (let j = 0; j < nDests; j++) {
      const dst = destinations[j];
      dstInv[j] = dstInv[j] + received[j] - dst.demand[t];

      // Check demand fulfillment
      if (dstInv[j] < 0) {
        violations += Math.abs(dstInv[j]);
      }
      // Safety stock
      if (dstInv[j] < dst.safetyStock) {
        violations += (dst.safetyStock - dstInv[j]);
      }
      // Max inventory
      if (dstInv[j] > dst.maxInventory) {
        violations += (dstInv[j] - dst.maxInventory);
      }

      // Inventory holding cost for GU
      inventoryCost += Math.max(0, dstInv[j]) * HOLDING_COST;
    }
  }

  const penalty = penaltyLambda * violations;
  const total = productionCost + transportCost + inventoryCost + penalty;

  return { total, production: productionCost, transport: transportCost, inventory: inventoryCost, violations };
}

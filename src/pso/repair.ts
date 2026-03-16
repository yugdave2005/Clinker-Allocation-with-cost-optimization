import type { TransportMode } from './types';

const MAX_TRIPS = 20;

/**
 * Repair a particle position to ensure feasibility:
 * 1. Round to nearest integer
 * 2. Clip to [0, MAX_TRIPS]
 * 3. Enforce SBQ constraints
 */
export function repair(
  position: number[][][][],
  modes: TransportMode[]
): number[][][][] {
  const nI = position.length;
  for (let i = 0; i < nI; i++) {
    const nJ = position[i].length;
    for (let j = 0; j < nJ; j++) {
      const nT = position[i][j].length;
      for (let t = 0; t < nT; t++) {
        const nM = position[i][j][t].length;
        for (let m = 0; m < nM; m++) {
          // Round
          let val = Math.round(position[i][j][t][m]);
          // Clip
          val = Math.max(0, Math.min(MAX_TRIPS, val));
          // SBQ: if > 0 but < sbq, set to sbq
          if (val > 0 && val < modes[m].sbqTrips) {
            val = modes[m].sbqTrips;
          }
          position[i][j][t][m] = val;
        }
      }
    }
  }
  return position;
}

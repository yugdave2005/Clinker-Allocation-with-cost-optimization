import type { Location, TransportMode, InventorySnapshot } from './types';

const HOLDING_COST = 50;

/**
 * Compute per-period inventory snapshots for all locations given an allocation position.
 */
export function computeInventorySnapshots(
  position: number[][][][],
  sources: Location[],
  destinations: Location[],
  modes: TransportMode[],
  allLocations: Location[]
): InventorySnapshot[] {
  const nPeriods = 3;
  const snapshots: InventorySnapshot[] = [];
  const srcInv = sources.map(s => s.initialInventory);
  const dstInv = destinations.map(d => d.initialInventory);

  for (let t = 0; t < nPeriods; t++) {
    const dispatched: number[] = new Array(sources.length).fill(0);
    const received: number[] = new Array(destinations.length).fill(0);

    for (let i = 0; i < sources.length; i++) {
      for (let j = 0; j < destinations.length; j++) {
        for (let m = 0; m < modes.length; m++) {
          const trips = Math.max(0, Math.round(position[i][j][t][m]));
          if (trips > 0) {
            const qty = trips * modes[m].capacityMtTrip;
            dispatched[i] += qty;
            received[j] += qty;
          }
        }
      }
    }

    // IU snapshots
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const opening = srcInv[i];
      const selfConsumed = src.demand[t];
      const totalNeeded = selfConsumed + dispatched[i];
      const production = Math.max(0, totalNeeded - opening);

      srcInv[i] = opening + production - selfConsumed - dispatched[i];

      snapshots.push({
        locationCode: src.code,
        period: t + 1,
        openingInv: opening,
        production,
        receivedMt: 0,
        dispatchedMt: dispatched[i],
        selfConsumed,
        closingInv: srcInv[i],
      });
    }

    // GU snapshots
    for (let j = 0; j < destinations.length; j++) {
      const dst = destinations[j];
      const opening = dstInv[j];
      dstInv[j] = opening + received[j] - dst.demand[t];

      snapshots.push({
        locationCode: dst.code,
        period: t + 1,
        openingInv: opening,
        production: 0,
        receivedMt: received[j],
        dispatchedMt: 0,
        selfConsumed: dst.demand[t],
        closingInv: dstInv[j],
      });
    }
  }

  return snapshots;
}

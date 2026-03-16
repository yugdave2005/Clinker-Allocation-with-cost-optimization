import type { Location } from './types';

/**
 * Validate all constraints and return a list of violation descriptions.
 */
export function validateConstraints(
  sources: Location[],
  destinations: Location[],
  srcInventories: number[],
  dstInventories: number[],
  productions: number[]
): string[] {
  const violations: string[] = [];

  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (productions[i] > (src.prodCapacity || 0)) {
      violations.push(`${src.code}: Production ${productions[i].toFixed(0)} MT exceeds capacity ${src.prodCapacity} MT`);
    }
    if (srcInventories[i] < 0) {
      violations.push(`${src.code}: Negative inventory ${srcInventories[i].toFixed(0)} MT`);
    }
    if (srcInventories[i] < src.safetyStock) {
      violations.push(`${src.code}: Inventory ${srcInventories[i].toFixed(0)} MT below safety stock ${src.safetyStock} MT`);
    }
    if (srcInventories[i] > src.maxInventory) {
      violations.push(`${src.code}: Inventory ${srcInventories[i].toFixed(0)} MT exceeds max ${src.maxInventory} MT`);
    }
  }

  for (let j = 0; j < destinations.length; j++) {
    const dst = destinations[j];
    if (dstInventories[j] < 0) {
      violations.push(`${dst.code}: Unmet demand — deficit ${Math.abs(dstInventories[j]).toFixed(0)} MT`);
    }
    if (dstInventories[j] < dst.safetyStock) {
      violations.push(`${dst.code}: Inventory ${dstInventories[j].toFixed(0)} MT below safety stock ${dst.safetyStock} MT`);
    }
    if (dstInventories[j] > dst.maxInventory) {
      violations.push(`${dst.code}: Inventory ${dstInventories[j].toFixed(0)} MT exceeds max ${dst.maxInventory} MT`);
    }
  }

  return violations;
}

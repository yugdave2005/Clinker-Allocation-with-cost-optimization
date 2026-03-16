import type { Dimensions } from './types';

/**
 * Create a 4D array filled with zeros.
 */
export function create4D(dims: Dimensions): number[][][][] {
  const { numSources, numDests, numPeriods, numModes } = dims;
  return Array.from({ length: numSources }, () =>
    Array.from({ length: numDests }, () =>
      Array.from({ length: numPeriods }, () =>
        new Array(numModes).fill(0)
      )
    )
  );
}

/**
 * Deep-clone a 4D array.
 */
export function clone4D(arr: number[][][][]): number[][][][] {
  return arr.map(a => a.map(b => b.map(c => [...c])));
}

/**
 * Initialize a random particle position with integer values in [0, maxVal].
 */
export function randomPosition(dims: Dimensions, maxVal: number = 3): number[][][][] {
  const { numSources, numDests, numPeriods, numModes } = dims;
  return Array.from({ length: numSources }, () =>
    Array.from({ length: numDests }, () =>
      Array.from({ length: numPeriods }, () =>
        Array.from({ length: numModes }, () => Math.floor(Math.random() * (maxVal + 1)))
      )
    )
  );
}

/**
 * Initialize a random velocity in [-maxVel, maxVel].
 */
export function randomVelocity(dims: Dimensions, maxVel: number): number[][][][] {
  const { numSources, numDests, numPeriods, numModes } = dims;
  return Array.from({ length: numSources }, () =>
    Array.from({ length: numDests }, () =>
      Array.from({ length: numPeriods }, () =>
        Array.from({ length: numModes }, () => (Math.random() * 2 - 1) * maxVel)
      )
    )
  );
}

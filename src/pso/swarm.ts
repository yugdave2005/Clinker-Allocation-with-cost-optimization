import type { Location, TransportMode, PSOConfig, PSOResult, Particle, AllocationEntry, Dimensions } from './types';
import { computeFitness } from './fitness';
import { computeInventorySnapshots } from './inventory';
import { repair } from './repair';
import { create4D, clone4D, randomPosition, randomVelocity } from './particle';

export class Swarm {
  particles: Particle[];
  gBest: number[][][][];
  gBestFitness: number;
  convergence: { iter: number; bestCost: number }[];
  private config: PSOConfig;
  private sources: Location[];
  private destinations: Location[];
  private modes: TransportMode[];
  private distances: number[][];
  private allLocations: Location[];
  private dims: Dimensions;

  constructor(
    config: PSOConfig,
    sources: Location[],
    destinations: Location[],
    modes: TransportMode[],
    distances: number[][],
    allLocations: Location[]
  ) {
    this.config = config;
    this.sources = sources;
    this.destinations = destinations;
    this.modes = modes;
    this.distances = distances;
    this.allLocations = allLocations;
    this.convergence = [];

    this.dims = {
      numSources: sources.length,
      numDests: destinations.length,
      numPeriods: 3,
      numModes: modes.length,
    };

    // Initialize particles
    this.particles = [];
    this.gBest = create4D(this.dims);
    this.gBestFitness = Infinity;

    for (let p = 0; p < config.swarmSize; p++) {
      const position = repair(randomPosition(this.dims, 3), modes);
      const velocity = randomVelocity(this.dims, config.maxVelocity * 0.5);
      const fit = this.evaluate(position);

      const particle: Particle = {
        position,
        velocity,
        pBest: clone4D(position),
        pBestFitness: fit.total,
        fitness: fit.total,
      };

      this.particles.push(particle);

      if (fit.total < this.gBestFitness) {
        this.gBestFitness = fit.total;
        this.gBest = clone4D(position);
      }
    }
  }

  private evaluate(position: number[][][][]) {
    return computeFitness(
      position,
      this.sources,
      this.destinations,
      this.modes,
      this.distances,
      this.allLocations,
      this.config.penaltyLambda
    );
  }

  iterate(w: number): void {
    const { c1, c2, maxVelocity } = this.config;

    for (const particle of this.particles) {
      // Update velocity & position
      for (let i = 0; i < this.dims.numSources; i++) {
        for (let j = 0; j < this.dims.numDests; j++) {
          for (let t = 0; t < this.dims.numPeriods; t++) {
            for (let m = 0; m < this.dims.numModes; m++) {
              const r1 = Math.random();
              const r2 = Math.random();

              let v = w * particle.velocity[i][j][t][m]
                + c1 * r1 * (particle.pBest[i][j][t][m] - particle.position[i][j][t][m])
                + c2 * r2 * (this.gBest[i][j][t][m] - particle.position[i][j][t][m]);

              // Clip velocity
              v = Math.max(-maxVelocity, Math.min(maxVelocity, v));
              particle.velocity[i][j][t][m] = v;

              // Update position
              particle.position[i][j][t][m] += v;
            }
          }
        }
      }

      // Repair
      repair(particle.position, this.modes);

      // Evaluate
      const fit = this.evaluate(particle.position);
      particle.fitness = fit.total;

      // Update personal best
      if (fit.total < particle.pBestFitness) {
        particle.pBestFitness = fit.total;
        particle.pBest = clone4D(particle.position);
      }

      // Update global best
      if (fit.total < this.gBestFitness) {
        this.gBestFitness = fit.total;
        this.gBest = clone4D(particle.position);
      }
    }
  }

  run(onProgress?: (iter: number, bestCost: number) => void): PSOResult {
    const { maxIterations, wStart, wEnd } = this.config;
    let converged = false;
    let iterationsRun = 0;
    const recentCosts: number[] = [];

    for (let iter = 1; iter <= maxIterations; iter++) {
      const w = wStart - (wStart - wEnd) * (iter / maxIterations);
      this.iterate(w);
      iterationsRun = iter;

      this.convergence.push({ iter, bestCost: this.gBestFitness });

      // Progress callback every 10 iterations
      if (iter % 10 === 0 && onProgress) {
        onProgress(iter, this.gBestFitness);
      }

      // Convergence check: if cost change < 0.01% over last 20 iters
      recentCosts.push(this.gBestFitness);
      if (recentCosts.length > 20) {
        recentCosts.shift();
        const oldCost = recentCosts[0];
        const newCost = recentCosts[recentCosts.length - 1];
        if (oldCost > 0 && Math.abs((oldCost - newCost) / oldCost) < 0.0001) {
          converged = true;
          break;
        }
      }
    }

    return this.extractResult(iterationsRun, converged);
  }

  private extractResult(iterationsRun: number, converged: boolean): PSOResult {
    const fit = this.evaluate(this.gBest);
    const allocationPlan = this.decodeAllocationPlan(this.gBest);
    const inventoryPlan = computeInventorySnapshots(
      this.gBest,
      this.sources,
      this.destinations,
      this.modes,
      this.allLocations
    );

    return {
      bestPosition: this.gBest,
      bestCost: fit.total,
      costBreakdown: {
        production: fit.production,
        transport: fit.transport,
        inventory: fit.inventory,
      },
      convergenceData: this.convergence,
      allocationPlan,
      inventoryPlan,
      iterationsRun,
      converged,
    };
  }

  private decodeAllocationPlan(position: number[][][][]): AllocationEntry[] {
    const entries: AllocationEntry[] = [];

    for (let i = 0; i < this.dims.numSources; i++) {
      for (let j = 0; j < this.dims.numDests; j++) {
        for (let t = 0; t < this.dims.numPeriods; t++) {
          for (let m = 0; m < this.dims.numModes; m++) {
            const trips = Math.round(position[i][j][t][m]);
            if (trips <= 0) continue;

            const qty = trips * this.modes[m].capacityMtTrip;
            const srcIdx = this.allLocations.findIndex(l => l.id === this.sources[i].id);
            const dstIdx = this.allLocations.findIndex(l => l.id === this.destinations[j].id);
            const dist = this.distances[srcIdx][dstIdx];
            const cost = qty * dist * this.modes[m].costPerMtKm;

            entries.push({
              period: t + 1,
              fromCode: this.sources[i].code,
              toCode: this.destinations[j].code,
              modeCode: this.modes[m].code,
              quantityMt: qty,
              trips,
              distanceKm: Math.round(dist),
              cost,
            });
          }
        }
      }
    }

    return entries.sort((a, b) => a.period - b.period || a.fromCode.localeCompare(b.fromCode));
  }
}

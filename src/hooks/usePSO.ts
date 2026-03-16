import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { ALL_LOCATIONS, TRANSPORT_MODES, DISTANCE_MATRIX, IU_LOCATIONS, GU_LOCATIONS } from '../data/locations';
import { Swarm } from '../pso/swarm';
import type { PSOConfig, Location } from '../pso/types';

/**
 * Hook to run the PSO optimization with progress tracking.
 */
export function usePSO() {
  const {
    psoConfig,
    activeMode,
    demandOverrides,
    psoStatus,
    psoProgress,
    currentIteration,
    liveConvergence,
    currentResult,
    setPsoStatus,
    setPsoProgress,
    setCurrentIteration,
    addConvergencePoint,
    resetConvergence,
    setCurrentResult,
    addRunHistory,
  } = useAppStore();

  const run = useCallback(async (configOverride?: Partial<PSOConfig>) => {
    const config = { ...psoConfig, ...configOverride };

    setPsoStatus('RUNNING');
    setPsoProgress(0);
    setCurrentIteration(0);
    resetConvergence();
    setCurrentResult(null);

    // Apply demand overrides for MANUAL mode
    let sources: Location[] = [...IU_LOCATIONS];
    let destinations: Location[] = [...GU_LOCATIONS];

    if (activeMode === 'MANUAL' && Object.keys(demandOverrides).length > 0) {
      sources = sources.map(loc => {
        const override = demandOverrides[loc.code];
        return override ? { ...loc, demand: override } : loc;
      });
      destinations = destinations.map(loc => {
        const override = demandOverrides[loc.code];
        return override ? { ...loc, demand: override } : loc;
      });
    }

    try {
      // Run PSO in a setTimeout to allow UI to update
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            const swarm = new Swarm(
              config,
              sources,
              destinations,
              TRANSPORT_MODES,
              DISTANCE_MATRIX,
              ALL_LOCATIONS
            );

            const result = swarm.run((iter, bestCost) => {
              setPsoProgress(Math.round((iter / config.maxIterations) * 100));
              setCurrentIteration(iter);
              addConvergencePoint({ iter, cost: bestCost });
            });

            setCurrentResult(result);
            setPsoProgress(100);
            setCurrentIteration(result.iterationsRun);
            setPsoStatus('DONE');

            // Add to run history
            addRunHistory({
              id: crypto.randomUUID(),
              mode: activeMode,
              psoParams: config,
              demandInput: demandOverrides,
              totalCost: result.bestCost,
              prodCost: result.costBreakdown.production,
              transportCost: result.costBreakdown.transport,
              inventoryCost: result.costBreakdown.inventory,
              iterationsRun: result.iterationsRun,
              converged: result.converged,
              convergenceData: result.convergenceData,
              status: 'DONE',
              createdAt: new Date().toISOString(),
            });

            resolve();
          } catch (err) {
            reject(err);
          }
        }, 50);
      });
    } catch (error) {
      console.error('PSO Error:', error);
      setPsoStatus('ERROR');
    }
  }, [psoConfig, activeMode, demandOverrides, setPsoStatus, setPsoProgress, setCurrentIteration, addConvergencePoint, resetConvergence, setCurrentResult, addRunHistory]);

  return {
    run,
    status: psoStatus,
    progress: psoProgress,
    currentIteration,
    liveConvergence,
    result: currentResult,
  };
}

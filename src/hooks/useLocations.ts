import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { ALL_LOCATIONS, TRANSPORT_MODES, DISTANCE_MATRIX } from '../data/locations';

/**
 * Hook to load all locations, transport modes, and distance matrix
 * Uses hardcoded data (falls back gracefully without Supabase)
 */
export function useLocations() {
  const { locations, setLocations, setModes, setDistances } = useAppStore();

  useEffect(() => {
    if (locations.length === 0) {
      setLocations(ALL_LOCATIONS);
      setModes(TRANSPORT_MODES);
      setDistances(DISTANCE_MATRIX);
    }
  }, [locations.length, setLocations, setModes, setDistances]);

  return {
    locations: ALL_LOCATIONS,
    modes: TRANSPORT_MODES,
    distances: DISTANCE_MATRIX,
    loading: false,
  };
}

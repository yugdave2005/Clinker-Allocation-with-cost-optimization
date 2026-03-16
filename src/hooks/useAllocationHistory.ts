import { useAppStore } from '../store/appStore';

/**
 * Hook to access allocation run history.
 */
export function useAllocationHistory() {
  const { runHistory } = useAppStore();
  return { history: runHistory, loading: false };
}

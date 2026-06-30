/**
 * React Query hooks — the only way screens read data.
 * Each hook wraps a function from services/api.ts, so the mock/real swap is
 * invisible here too.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acknowledgeAlert,
  getActivityReadings,
  getAlerts,
  getBarn,
  getDailySummaries,
  getEnvReadings,
  getFarm,
  getWeightReadings,
} from '@/services/api';
import { Alert } from '@/types';

export const queryKeys = {
  farm: ['farm'] as const,
  barn: (id: string) => ['barn', id] as const,
  alerts: ['alerts'] as const,
  weight: (id: string) => ['weight', id] as const,
  env: (id: string) => ['env', id] as const,
  activity: (id: string) => ['activity', id] as const,
  summaries: (id: string) => ['summaries', id] as const,
};

export function useFarm() {
  return useQuery({ queryKey: queryKeys.farm, queryFn: getFarm });
}

export function useBarn(barnId: string) {
  return useQuery({ queryKey: queryKeys.barn(barnId), queryFn: () => getBarn(barnId) });
}

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: getAlerts });
}

export function useWeightReadings(barnId: string) {
  return useQuery({ queryKey: queryKeys.weight(barnId), queryFn: () => getWeightReadings(barnId) });
}

export function useEnvReadings(barnId: string) {
  return useQuery({ queryKey: queryKeys.env(barnId), queryFn: () => getEnvReadings(barnId) });
}

export function useActivityReadings(barnId: string) {
  return useQuery({
    queryKey: queryKeys.activity(barnId),
    queryFn: () => getActivityReadings(barnId),
  });
}

export function useDailySummaries(barnId: string) {
  return useQuery({
    queryKey: queryKeys.summaries(barnId),
    queryFn: () => getDailySummaries(barnId),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => acknowledgeAlert(alertId),
    onSuccess: (updated: Alert) => {
      qc.setQueryData<Alert[]>(queryKeys.alerts, (prev) =>
        prev?.map((a) => (a.id === updated.id ? updated : a))
      );
    },
  });
}

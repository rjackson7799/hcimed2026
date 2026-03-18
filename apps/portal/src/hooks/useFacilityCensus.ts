/**
 * React Query hooks for facility census trends and pipeline history.
 * Currently uses mock data — swap queryFn bodies to Supabase in Phase 7.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FacilityStatus } from '@/types/mobile-docs';
import {
  getMockFacilityCensusTrend,
  getMockFacilityPipelineHistory,
  addMockPipelineTransition,
  updateMockFacility,
} from '@/lib/mobile-docs-mock-data';

export function useFacilityCensusTrend(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility-census-trend', facilityId],
    queryFn: () => getMockFacilityCensusTrend(facilityId!),
    enabled: !!facilityId,
    staleTime: 30_000,
  });
}

export function useFacilityPipelineHistory(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility-pipeline', facilityId],
    queryFn: () => getMockFacilityPipelineHistory(facilityId!),
    enabled: !!facilityId,
    staleTime: 30_000,
  });
}

export function useChangeFacilityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ facilityId, fromStatus, toStatus, reason }: {
      facilityId: string;
      fromStatus: FacilityStatus | null;
      toStatus: FacilityStatus;
      reason: string;
    }) => {
      updateMockFacility(facilityId, { status: toStatus });
      addMockPipelineTransition(facilityId, fromStatus, toStatus, reason);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility', variables.facilityId] });
      queryClient.invalidateQueries({ queryKey: ['facility-pipeline', variables.facilityId] });
    },
  });
}

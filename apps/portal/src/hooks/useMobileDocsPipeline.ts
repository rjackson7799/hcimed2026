import { useQuery } from '@tanstack/react-query';
import {
  getMockPipelineStages,
  getMockPipelineMetrics,
  getMockPipelineActivity,
  getMockFacilityMix,
  getMockFacilityGrowth,
} from '@/lib/mobile-docs-mock-data';

export function useMobileDocsPipelineStages() {
  return useQuery({
    queryKey: ['mobile-docs-pipeline-stages'],
    queryFn: () => getMockPipelineStages(),
    staleTime: 30_000,
  });
}

export function useMobileDocsPipelineMetrics() {
  return useQuery({
    queryKey: ['mobile-docs-pipeline-metrics'],
    queryFn: () => getMockPipelineMetrics(),
    staleTime: 30_000,
  });
}

export function useMobileDocsPipelineActivity() {
  return useQuery({
    queryKey: ['mobile-docs-pipeline-activity'],
    queryFn: () => getMockPipelineActivity(),
    staleTime: 30_000,
  });
}

export function useMobileDocsFacilityMix() {
  return useQuery({
    queryKey: ['mobile-docs-facility-mix'],
    queryFn: () => getMockFacilityMix(),
    staleTime: 30_000,
  });
}

export function useMobileDocsFacilityGrowth() {
  return useQuery({
    queryKey: ['mobile-docs-facility-growth'],
    queryFn: () => getMockFacilityGrowth(),
    staleTime: 30_000,
  });
}

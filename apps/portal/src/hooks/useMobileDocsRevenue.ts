import { useQuery } from '@tanstack/react-query';
import {
  getMockRevenueTrend,
  getMockFacilityRevenue,
  getMockAncillaryRevenue,
} from '@/lib/mobile-docs-mock-data';

export function useMobileDocsRevenueTrend(range: '30d' | '90d' | '12m') {
  return useQuery({
    queryKey: ['mobile-docs-revenue-trend', range],
    queryFn: () => getMockRevenueTrend(range),
    staleTime: 30_000,
  });
}

export function useMobileDocsFacilityRevenue() {
  return useQuery({
    queryKey: ['mobile-docs-facility-revenue'],
    queryFn: () => getMockFacilityRevenue(),
    staleTime: 30_000,
  });
}

export function useMobileDocsAncillaryRevenue() {
  return useQuery({
    queryKey: ['mobile-docs-ancillary-revenue'],
    queryFn: () => getMockAncillaryRevenue(),
    staleTime: 30_000,
  });
}

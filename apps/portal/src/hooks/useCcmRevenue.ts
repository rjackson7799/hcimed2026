import { useQuery } from '@tanstack/react-query';
import {
  getMockCcmRevenueMetrics,
  getMockCcmMonthlyRevenue,
  getMockCcmProviderMetrics,
  getMockCcmProgramSplit,
} from '@/lib/ccm-rpm-mock-data';

export function useCcmRevenueMetrics() {
  return useQuery({
    queryKey: ['ccm', 'revenue-metrics'],
    queryFn: () => getMockCcmRevenueMetrics(),
    staleTime: 30_000,
  });
}

export function useCcmMonthlyRevenue() {
  return useQuery({
    queryKey: ['ccm', 'monthly-revenue'],
    queryFn: () => getMockCcmMonthlyRevenue(),
    staleTime: 30_000,
  });
}

export function useCcmProviderMetrics() {
  return useQuery({
    queryKey: ['ccm', 'provider-metrics'],
    queryFn: () => getMockCcmProviderMetrics(),
    staleTime: 30_000,
  });
}

export function useCcmProgramSplit() {
  return useQuery({
    queryKey: ['ccm', 'program-split'],
    queryFn: () => getMockCcmProgramSplit(),
    staleTime: 30_000,
  });
}

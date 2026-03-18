import { useQuery } from '@tanstack/react-query';
import type {
  AwvRevenueMetrics,
  AwvProviderMetrics,
  AwvMonthlyRevenuePoint,
  AwvServiceLineSplit,
} from '@/types/awv-tracker';
import {
  getMockAwvRevenueMetrics,
  getMockAwvMonthlyRevenue,
  getMockAwvServiceLineSplit,
} from '@/lib/awv-tracker-mock-data';

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useAwvRevenueMetrics() {
  return useQuery<AwvRevenueMetrics>({
    queryKey: ['awv', 'revenue', 'metrics'],
    queryFn: async () => getMockAwvRevenueMetrics(),
    staleTime: 30_000,
  });
}

export function useAwvProviderMetrics() {
  return useQuery<AwvProviderMetrics[]>({
    queryKey: ['awv', 'revenue', 'providers'],
    queryFn: async () => getMockAwvRevenueMetrics().providerBreakdown,
    staleTime: 30_000,
  });
}

export function useAwvMonthlyRevenue() {
  return useQuery<AwvMonthlyRevenuePoint[]>({
    queryKey: ['awv', 'revenue', 'monthly'],
    queryFn: async () => getMockAwvMonthlyRevenue(),
    staleTime: 30_000,
  });
}

export function useAwvServiceLineSplit() {
  return useQuery<AwvServiceLineSplit[]>({
    queryKey: ['awv', 'revenue', 'service-line-split'],
    queryFn: async () => getMockAwvServiceLineSplit(),
    staleTime: 30_000,
  });
}

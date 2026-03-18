import { useQuery } from '@tanstack/react-query';
import {
  getMockPenetrationData,
  getMockCensusTrend,
  getMockEnrollment,
  getMockCadenceStatus,
  getMockAlerts,
} from '@/lib/mobile-docs-mock-data';

export function useMobileDocsPenetration() {
  return useQuery({
    queryKey: ['mobile-docs-penetration'],
    queryFn: () => getMockPenetrationData(),
    staleTime: 30_000,
  });
}

export function useMobileDocsCensusTrend() {
  return useQuery({
    queryKey: ['mobile-docs-census-trend'],
    queryFn: () => getMockCensusTrend(),
    staleTime: 30_000,
  });
}

export function useMobileDocsEnrollment() {
  return useQuery({
    queryKey: ['mobile-docs-enrollment'],
    queryFn: () => getMockEnrollment(),
    staleTime: 30_000,
  });
}

export function useMobileDocsCadenceStatus() {
  return useQuery({
    queryKey: ['mobile-docs-cadence-status'],
    queryFn: () => getMockCadenceStatus(),
    staleTime: 30_000,
  });
}

export function useMobileDocsAlerts() {
  return useQuery({
    queryKey: ['mobile-docs-alerts'],
    queryFn: () => getMockAlerts(),
    staleTime: 30_000,
  });
}

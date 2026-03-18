import { useQuery } from '@tanstack/react-query';
import { getMockKpiData } from '@/lib/mobile-docs-mock-data';

export function useMobileDocsKpi() {
  return useQuery({
    queryKey: ['mobile-docs-kpi'],
    queryFn: () => getMockKpiData(),
    staleTime: 30_000,
  });
}

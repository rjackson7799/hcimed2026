import { useQuery } from '@tanstack/react-query';
import { getMockProviders } from '@/lib/awv-tracker-mock-data';

export function useAwvProviders() {
  return useQuery({
    queryKey: ['awv', 'providers'],
    queryFn: async () => getMockProviders(),
    staleTime: 120_000,
  });
}

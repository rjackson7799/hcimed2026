import { useQuery } from '@tanstack/react-query';
import { getMockFacilities } from '@/lib/awv-tracker-mock-data';

export function useAwvFacilities() {
  return useQuery({
    queryKey: ['awv', 'facilities'],
    queryFn: async () => getMockFacilities(),
    staleTime: 120_000,
  });
}

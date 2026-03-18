import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PhProvider } from '@/types/practice-health';

export function usePracticeProviders() {
  return useQuery({
    queryKey: ['ph-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ph_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as PhProvider[];
    },
    staleTime: 60_000,
  });
}

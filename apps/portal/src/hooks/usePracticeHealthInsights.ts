import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { KpiFilters } from '@/types/practice-health';

interface AiInsight {
  id: string;
  insight_date: string;
  insight_type: string;
  category: string | null;
  severity: string | null;
  title: string;
  narrative: string;
  created_at: string;
}

interface GroupedInsights {
  takeaways: Array<{ title: string; narrative: string }>;
  opportunities: Array<{ title: string; narrative: string }>;
  concerns: Array<{ title: string; narrative: string; severity: string }>;
}

export function useAiInsights(filters: KpiFilters) {
  return useQuery({
    queryKey: ['ph-ai-insights', filters.dateRange],
    queryFn: async (): Promise<GroupedInsights> => {
      const { data, error } = await supabase
        .from('ph_ai_insights')
        .select('*')
        .gte('insight_date', filters.dateRange.start)
        .lte('insight_date', filters.dateRange.end)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const insights = (data || []) as AiInsight[];

      return {
        takeaways: insights
          .filter((i) => i.insight_type === 'daily_summary')
          .map((i) => ({ title: i.title, narrative: i.narrative })),
        opportunities: insights
          .filter((i) => i.insight_type === 'recommendation')
          .map((i) => ({ title: i.title, narrative: i.narrative })),
        concerns: insights
          .filter((i) => i.insight_type === 'alert')
          .map((i) => ({ title: i.title, narrative: i.narrative, severity: i.severity || 'warning' })),
      };
    },
    staleTime: 60_000,
  });
}

export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dateRange: { start: string; end: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ dateRange }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || 'Failed to generate insights');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ph-ai-insights'] });
    },
  });
}

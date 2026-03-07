import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '@/portal/lib/supabase';
import type { KpiFilters } from '@/portal/types/practice-health';

interface EmLevelDistributionProps {
  filters: KpiFilters;
}

const EM_CODES = ['99211', '99212', '99213', '99214', '99215'];
const EM_COLORS: Record<string, string> = {
  '99211': '#93c5fd',
  '99212': '#60a5fa',
  '99213': '#3b82f6',
  '99214': '#2563eb',
  '99215': '#1d4ed8',
};

interface ProviderEmData {
  provider: string;
  [key: string]: number | string;
}

export function EmLevelDistribution({ filters }: EmLevelDistributionProps) {
  const { data: chartData } = useQuery({
    queryKey: ['ph-em-distribution', filters],
    queryFn: async () => {
      let query = supabase
        .from('ph_charges')
        .select('rendering_provider, cpt_code')
        .in('cpt_code', EM_CODES)
        .gte('service_date', filters.dateRange.start)
        .lte('service_date', filters.dateRange.end);

      if (filters.serviceLine !== 'all') {
        query = query.eq('service_line', filters.serviceLine);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by provider, count each E/M level
      const providerMap = new Map<string, Record<string, number>>();
      (data || []).forEach((row: { rendering_provider: string; cpt_code: string }) => {
        if (!providerMap.has(row.rendering_provider)) {
          providerMap.set(row.rendering_provider, {});
        }
        const counts = providerMap.get(row.rendering_provider)!;
        counts[row.cpt_code] = (counts[row.cpt_code] || 0) + 1;
      });

      const result: ProviderEmData[] = Array.from(providerMap.entries()).map(([provider, counts]) => ({
        provider,
        ...EM_CODES.reduce((acc, code) => ({ ...acc, [code]: counts[code] || 0 }), {}),
      }));

      return result;
    },
    staleTime: 30_000,
  });

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">E/M Level Distribution</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">E/M Level Distribution</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="provider" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
          <Tooltip />
          <Legend />
          {EM_CODES.map(code => (
            <Bar key={code} dataKey={code} name={code} stackId="em" fill={EM_COLORS[code]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { KpiFilters, PhKpiDaily, PhProvider, ProviderMetrics, SparklinePoint } from '@/types/practice-health';
import { BENCHMARKS } from '@/lib/practice-health-constants';

function buildProviderMetrics(
  provider: PhProvider,
  rows: PhKpiDaily[],
  sparklineRows: PhKpiDaily[]
): ProviderMetrics {
  const visits = rows.reduce((s, r) => s + r.visits, 0);
  const rvuTotal = rows.reduce((s, r) => s + r.rvu_total, 0);
  const wrvuTotal = rows.reduce((s, r) => s + r.wrvu_total, 0);
  const billedCharges = rows.reduce((s, r) => s + r.billed_amount, 0);
  const waitTimeSum = rows.reduce((s, r) => s + r.avg_wait_time_min * r.visits, 0);
  const durationSum = rows.reduce((s, r) => s + r.avg_visit_duration_min * r.visits, 0);

  const uniqueDates = new Set(rows.map(r => r.date));
  const scheduledDays = uniqueDates.size || 1;

  const benchmark = BENCHMARKS.visitsPerDay[provider.role] || 6;
  const visitsPerDay = visits / scheduledDays;
  const benchmarkStatus: 'above' | 'at' | 'below' =
    visitsPerDay >= benchmark * 1.1 ? 'above' :
    visitsPerDay >= benchmark * 0.9 ? 'at' : 'below';

  // Build sparkline from last 30 days
  const dateMap = new Map<string, number>();
  sparklineRows.forEach(r => {
    dateMap.set(r.date, (dateMap.get(r.date) || 0) + r.visits);
  });
  const sparklineData: SparklinePoint[] = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  return {
    providerId: provider.id,
    providerName: provider.name,
    role: provider.role,
    fte: provider.fte,
    visits,
    visitsPerScheduledDay: visitsPerDay,
    rvuTotal,
    wrvuTotal,
    wrvuPerDay: wrvuTotal / scheduledDays,
    billedCharges,
    avgVisitDuration: visits > 0 ? durationSum / visits : 0,
    avgWaitTime: visits > 0 ? waitTimeSum / visits : 0,
    sparklineData,
    benchmarkStatus,
  };
}

export function useProviderProductivity(filters: KpiFilters) {
  return useQuery({
    queryKey: ['ph-provider-productivity', filters],
    queryFn: async () => {
      // Fetch providers
      const { data: providers, error: provError } = await supabase
        .from('ph_providers')
        .select('*')
        .eq('is_active', true);
      if (provError) throw provError;

      // Fetch KPI data for current period
      let query = supabase
        .from('ph_kpi_daily')
        .select('*')
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end)
        .not('provider_id', 'is', null);

      if (filters.serviceLine !== 'all') {
        query = query.eq('service_line', filters.serviceLine);
      }

      const { data: kpiRows, error: kpiError } = await query;
      if (kpiError) throw kpiError;

      // Fetch sparkline data (last 30 days from end date)
      const sparklineStart = new Date(filters.dateRange.end);
      sparklineStart.setDate(sparklineStart.getDate() - 30);

      let sparkQuery = supabase
        .from('ph_kpi_daily')
        .select('*')
        .gte('date', sparklineStart.toISOString().split('T')[0])
        .lte('date', filters.dateRange.end)
        .not('provider_id', 'is', null);

      if (filters.serviceLine !== 'all') {
        sparkQuery = sparkQuery.eq('service_line', filters.serviceLine);
      }

      const { data: sparkRows, error: sparkError } = await sparkQuery;
      if (sparkError) throw sparkError;

      const typedProviders = (providers || []) as PhProvider[];
      const typedKpi = (kpiRows || []) as PhKpiDaily[];
      const typedSpark = (sparkRows || []) as PhKpiDaily[];

      return typedProviders.map(provider => {
        const providerKpi = typedKpi.filter(r => r.provider_id === provider.id);
        const providerSpark = typedSpark.filter(r => r.provider_id === provider.id);
        return buildProviderMetrics(provider, providerKpi, providerSpark);
      });
    },
    staleTime: 30_000,
  });
}

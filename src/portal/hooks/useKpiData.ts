import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { KpiFilters, KpiSummary, PhKpiDaily } from '@/portal/types/practice-health';

function aggregateKpi(rows: PhKpiDaily[]): KpiSummary {
  if (rows.length === 0) {
    return { totalVisits: 0, billedCharges: 0, estCollections: 0, totalWrvu: 0, collectionRate: 0 };
  }

  const totalVisits = rows.reduce((sum, r) => sum + r.visits, 0);
  const billedCharges = rows.reduce((sum, r) => sum + r.billed_amount, 0);
  const estCollections = rows.reduce((sum, r) => sum + r.est_collections, 0);
  const totalWrvu = rows.reduce((sum, r) => sum + r.wrvu_total, 0);
  const collectionRate = billedCharges > 0 ? estCollections / billedCharges : 0;

  return { totalVisits, billedCharges, estCollections, totalWrvu, collectionRate };
}

function getPreviousPeriod(start: string, end: string): { start: string; end: string } {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return {
    start: prevStart.toISOString().split('T')[0],
    end: prevEnd.toISOString().split('T')[0],
  };
}

async function fetchKpiRows(
  startDate: string,
  endDate: string,
  serviceLine: string,
  providerId?: string
): Promise<PhKpiDaily[]> {
  let query = supabase
    .from('ph_kpi_daily')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (serviceLine !== 'all') {
    query = query.eq('service_line', serviceLine);
  }
  if (providerId) {
    query = query.eq('provider_id', providerId);
  }

  const { data, error } = await query.order('date');
  if (error) throw error;
  return (data || []) as PhKpiDaily[];
}

export function useKpiData(filters: KpiFilters) {
  return useQuery({
    queryKey: ['ph-kpi', filters],
    queryFn: async () => {
      const currentRows = await fetchKpiRows(
        filters.dateRange.start,
        filters.dateRange.end,
        filters.serviceLine,
        filters.providerId
      );

      const prev = getPreviousPeriod(filters.dateRange.start, filters.dateRange.end);
      const previousRows = await fetchKpiRows(
        prev.start,
        prev.end,
        filters.serviceLine,
        filters.providerId
      );

      return {
        current: aggregateKpi(currentRows),
        previous: aggregateKpi(previousRows),
        daily: currentRows,
      };
    },
    staleTime: 30_000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { KpiFilters, PhKpiDaily } from '@/types/practice-health';

export interface VisitVolumePoint {
  date: string;
  newPatients: number;
  established: number;
  total: number;
}

export interface NoShowPoint {
  date: string;
  noShowRate: number;
  visits: number;
  noShows: number;
}

export interface WaitTimePoint {
  date: string;
  avgWaitTime: number;
  avgDuration: number;
}

export interface UtilizationPoint {
  date: string;
  utilization: number;
}

export function useOperationalMetrics(filters: KpiFilters) {
  return useQuery({
    queryKey: ['ph-operational', filters],
    queryFn: async () => {
      let query = supabase
        .from('ph_kpi_daily')
        .select('*')
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end);

      if (filters.serviceLine !== 'all') {
        query = query.eq('service_line', filters.serviceLine);
      }

      const { data, error } = await query.order('date');
      if (error) throw error;

      const rows = (data || []) as PhKpiDaily[];

      // Aggregate by date
      const dateAgg = new Map<string, {
        visits: number; noShows: number; cancellations: number;
        newPatients: number; established: number;
        waitTimeWeighted: number; durationWeighted: number;
        utilizationWeighted: number; visitCount: number;
      }>();

      rows.forEach(r => {
        const existing = dateAgg.get(r.date) || {
          visits: 0, noShows: 0, cancellations: 0,
          newPatients: 0, established: 0,
          waitTimeWeighted: 0, durationWeighted: 0,
          utilizationWeighted: 0, visitCount: 0,
        };
        existing.visits += r.visits;
        existing.noShows += r.no_shows;
        existing.cancellations += r.cancellations;
        existing.newPatients += r.new_patients;
        existing.established += r.established_patients;
        existing.waitTimeWeighted += r.avg_wait_time_min * r.visits;
        existing.durationWeighted += r.avg_visit_duration_min * r.visits;
        existing.utilizationWeighted += r.schedule_utilization;
        existing.visitCount += 1;
        dateAgg.set(r.date, existing);
      });

      const dates = Array.from(dateAgg.entries()).sort(([a], [b]) => a.localeCompare(b));

      const visitVolume: VisitVolumePoint[] = dates.map(([date, d]) => ({
        date,
        newPatients: d.newPatients,
        established: d.established,
        total: d.visits,
      }));

      const noShowTrend: NoShowPoint[] = dates.map(([date, d]) => {
        const totalAppts = d.visits + d.noShows + d.cancellations;
        return {
          date,
          noShowRate: totalAppts > 0 ? (d.noShows / totalAppts) * 100 : 0,
          visits: d.visits,
          noShows: d.noShows,
        };
      });

      const waitTimes: WaitTimePoint[] = dates.map(([date, d]) => ({
        date,
        avgWaitTime: d.visits > 0 ? d.waitTimeWeighted / d.visits : 0,
        avgDuration: d.visits > 0 ? d.durationWeighted / d.visits : 0,
      }));

      const scheduleUtilization: UtilizationPoint[] = dates.map(([date, d]) => ({
        date,
        utilization: d.visitCount > 0 ? (d.utilizationWeighted / d.visitCount) * 100 : 0,
      }));

      return { visitVolume, noShowTrend, waitTimes, scheduleUtilization };
    },
    staleTime: 30_000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { KpiFilters, PhKpiDaily, PayerMixEntry } from '@/portal/types/practice-health';

export interface TimeSeriesPoint {
  date: string;
  billed: number;
  collections: number;
}

export interface LagEntry {
  period: string;
  avgLagDays: number;
}

export function useFinancialMetrics(filters: KpiFilters) {
  return useQuery({
    queryKey: ['ph-financial', filters],
    queryFn: async () => {
      // 1. Charges/collections time series from ph_kpi_daily
      let kpiQuery = supabase
        .from('ph_kpi_daily')
        .select('*')
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end);

      if (filters.serviceLine !== 'all') {
        kpiQuery = kpiQuery.eq('service_line', filters.serviceLine);
      }

      const { data: kpiRows, error: kpiError } = await kpiQuery.order('date');
      if (kpiError) throw kpiError;

      const typedKpi = (kpiRows || []) as PhKpiDaily[];

      // Aggregate by date
      const dateMap = new Map<string, { billed: number; collections: number }>();
      typedKpi.forEach(r => {
        const existing = dateMap.get(r.date) || { billed: 0, collections: 0 };
        existing.billed += r.billed_amount;
        existing.collections += r.est_collections;
        dateMap.set(r.date, existing);
      });

      const chargesCollections: TimeSeriesPoint[] = Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({ date, ...vals }));

      // 2. Payer mix from ph_charges
      let chargesQuery = supabase
        .from('ph_charges')
        .select('primary_payer, billed_charge')
        .gte('service_date', filters.dateRange.start)
        .lte('service_date', filters.dateRange.end);

      if (filters.serviceLine !== 'all') {
        chargesQuery = chargesQuery.eq('service_line', filters.serviceLine);
      }

      const { data: charges, error: chargesError } = await chargesQuery;
      if (chargesError) throw chargesError;

      const payerTotals = new Map<string, number>();
      let grandTotal = 0;
      (charges || []).forEach((c: { primary_payer: string | null; billed_charge: number }) => {
        const payer = c.primary_payer || 'Unknown';
        payerTotals.set(payer, (payerTotals.get(payer) || 0) + c.billed_charge);
        grandTotal += c.billed_charge;
      });

      const payerMix: PayerMixEntry[] = Array.from(payerTotals.entries())
        .map(([payer, charges]) => ({
          payer,
          charges,
          percentage: grandTotal > 0 ? charges / grandTotal : 0,
        }))
        .sort((a, b) => b.charges - a.charges);

      // 3. Revenue cycle lag — compute avg days between service_date and claim_date
      let lagQuery = supabase
        .from('ph_charges')
        .select('service_date, claim_date')
        .gte('service_date', filters.dateRange.start)
        .lte('service_date', filters.dateRange.end)
        .not('claim_date', 'is', null);

      if (filters.serviceLine !== 'all') {
        lagQuery = lagQuery.eq('service_line', filters.serviceLine);
      }

      const { data: lagData, error: lagError } = await lagQuery;
      if (lagError) throw lagError;

      // Group by month
      const monthLags = new Map<string, number[]>();
      (lagData || []).forEach((r: { service_date: string; claim_date: string }) => {
        const month = r.service_date.substring(0, 7); // YYYY-MM
        const lag = Math.round(
          (new Date(r.claim_date).getTime() - new Date(r.service_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (!monthLags.has(month)) monthLags.set(month, []);
        monthLags.get(month)!.push(lag);
      });

      const revenueCycleLag: LagEntry[] = Array.from(monthLags.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, lags]) => ({
          period,
          avgLagDays: Math.round(lags.reduce((s, l) => s + l, 0) / lags.length),
        }));

      return { chargesCollections, payerMix, revenueCycleLag };
    },
    staleTime: 30_000,
  });
}

/**
 * Practice Health Report — Server-side data fetching
 * Mirrors query logic from src/portal/hooks/ but uses service role client.
 */

import { createClient } from '@supabase/supabase-js';
import type {
  KpiSummary,
  VisitVolumePoint,
  ChargesCollectionsPoint,
  PayerMixEntry,
  ProviderRow,
  OperationalSummary,
  Recipient,
  IncomeStreamData,
  FacilityRow,
  OutreachProjectRow,
  AiInsights,
} from './ph-report-types';

// ─── Supabase Client ────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Raw row type (mirrors PhKpiDaily) ──────────────────────────────

interface KpiRow {
  date: string;
  provider_id: string | null;
  visits: number;
  no_shows: number;
  cancellations: number;
  new_patients: number;
  established_patients: number;
  billed_amount: number;
  est_collections: number;
  wrvu_total: number;
  rvu_total: number;
  avg_visit_duration_min: number;
  avg_wait_time_min: number;
  schedule_utilization: number;
}

// ─── KPI Summary ────────────────────────────────────────────────────

function aggregateKpi(rows: KpiRow[]): KpiSummary {
  if (rows.length === 0) {
    return { totalVisits: 0, billedCharges: 0, estCollections: 0, totalWrvu: 0, collectionRate: 0 };
  }
  const totalVisits = rows.reduce((s, r) => s + r.visits, 0);
  const billedCharges = rows.reduce((s, r) => s + r.billed_amount, 0);
  const estCollections = rows.reduce((s, r) => s + r.est_collections, 0);
  const totalWrvu = rows.reduce((s, r) => s + r.wrvu_total, 0);
  const collectionRate = billedCharges > 0 ? estCollections / billedCharges : 0;
  return { totalVisits, billedCharges, estCollections, totalWrvu, collectionRate };
}

async function fetchKpiRows(startDate: string, endDate: string, serviceLine?: string): Promise<KpiRow[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('ph_kpi_daily')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);
  if (serviceLine) {
    query = query.eq('service_line', serviceLine);
  }
  const { data, error } = await query.order('date');
  if (error) throw error;
  return (data || []) as KpiRow[];
}

export async function fetchKpiSummary(
  startDate: string,
  endDate: string
): Promise<{ current: KpiSummary; previous: KpiSummary }> {
  const currentRows = await fetchKpiRows(startDate, endDate);

  // Compute previous period of same duration
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const durationMs = endMs - startMs;
  const prevEnd = new Date(startMs - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  const previousRows = await fetchKpiRows(
    prevStart.toISOString().split('T')[0],
    prevEnd.toISOString().split('T')[0]
  );

  return {
    current: aggregateKpi(currentRows),
    previous: aggregateKpi(previousRows),
  };
}

// ─── Visit Volume ───────────────────────────────────────────────────

export async function fetchVisitVolume(
  startDate: string,
  endDate: string
): Promise<VisitVolumePoint[]> {
  const rows = await fetchKpiRows(startDate, endDate);

  const dateMap = new Map<string, { newPatients: number; established: number }>();
  rows.forEach(r => {
    const existing = dateMap.get(r.date) || { newPatients: 0, established: 0 };
    existing.newPatients += r.new_patients;
    existing.established += r.established_patients;
    dateMap.set(r.date, existing);
  });

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

// ─── Charges vs Collections ─────────────────────────────────────────

export async function fetchChargesCollections(
  startDate: string,
  endDate: string
): Promise<ChargesCollectionsPoint[]> {
  const rows = await fetchKpiRows(startDate, endDate);

  const dateMap = new Map<string, { billed: number; collections: number }>();
  rows.forEach(r => {
    const existing = dateMap.get(r.date) || { billed: 0, collections: 0 };
    existing.billed += r.billed_amount;
    existing.collections += r.est_collections;
    dateMap.set(r.date, existing);
  });

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

// ─── Payer Mix ──────────────────────────────────────────────────────

export async function fetchPayerMix(
  startDate: string,
  endDate: string
): Promise<PayerMixEntry[]> {
  const supabase = getSupabase();
  const { data: charges, error } = await supabase
    .from('ph_charges')
    .select('primary_payer, billed_charge')
    .gte('service_date', startDate)
    .lte('service_date', endDate);
  if (error) throw error;

  const payerTotals = new Map<string, number>();
  let grandTotal = 0;
  (charges || []).forEach((c: { primary_payer: string | null; billed_charge: number }) => {
    const payer = c.primary_payer || 'Unknown';
    payerTotals.set(payer, (payerTotals.get(payer) || 0) + c.billed_charge);
    grandTotal += c.billed_charge;
  });

  return Array.from(payerTotals.entries())
    .map(([payer, charges]) => ({
      payer,
      charges,
      percentage: grandTotal > 0 ? charges / grandTotal : 0,
    }))
    .sort((a, b) => b.charges - a.charges);
}

// ─── Provider Productivity ──────────────────────────────────────────

export async function fetchProviderProductivity(
  startDate: string,
  endDate: string
): Promise<ProviderRow[]> {
  const supabase = getSupabase();

  // Fetch active providers
  const { data: providers, error: provError } = await supabase
    .from('ph_providers')
    .select('id, name, role')
    .eq('is_active', true);
  if (provError) throw provError;

  // Fetch KPI data with provider breakdown
  const { data: kpiRows, error: kpiError } = await supabase
    .from('ph_kpi_daily')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('provider_id', 'is', null);
  if (kpiError) throw kpiError;

  const typedKpi = (kpiRows || []) as KpiRow[];

  return (providers || []).map((provider: { id: string; name: string; role: string }) => {
    const providerKpi = typedKpi.filter(r => r.provider_id === provider.id);
    const visits = providerKpi.reduce((s, r) => s + r.visits, 0);
    const wrvuTotal = providerKpi.reduce((s, r) => s + r.wrvu_total, 0);
    const billedCharges = providerKpi.reduce((s, r) => s + r.billed_amount, 0);
    const estCollections = providerKpi.reduce((s, r) => s + r.est_collections, 0);

    return {
      providerName: provider.name,
      role: provider.role,
      visits,
      wrvuTotal,
      billedCharges,
      collectionRate: billedCharges > 0 ? estCollections / billedCharges : 0,
    };
  });
}

// ─── Operational Summary ────────────────────────────────────────────

export async function fetchOperationalSummary(
  startDate: string,
  endDate: string
): Promise<OperationalSummary> {
  const rows = await fetchKpiRows(startDate, endDate);

  if (rows.length === 0) {
    return { noShowRate: 0, avgWaitTime: 0, scheduleUtilization: 0 };
  }

  const totalVisits = rows.reduce((s, r) => s + r.visits, 0);
  const totalNoShows = rows.reduce((s, r) => s + r.no_shows, 0);
  const totalCancellations = rows.reduce((s, r) => s + r.cancellations, 0);
  const totalAppts = totalVisits + totalNoShows + totalCancellations;

  const waitTimeWeighted = rows.reduce((s, r) => s + r.avg_wait_time_min * r.visits, 0);
  const utilizationSum = rows.reduce((s, r) => s + r.schedule_utilization, 0);

  return {
    noShowRate: totalAppts > 0 ? (totalNoShows / totalAppts) * 100 : 0,
    avgWaitTime: totalVisits > 0 ? waitTimeWeighted / totalVisits : 0,
    scheduleUtilization: rows.length > 0 ? (utilizationSum / rows.length) * 100 : 0,
  };
}

// ─── Recipients ─────────────────────────────────────────────────────

export async function fetchRecipients(): Promise<Recipient[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('role', 'admin')
    .eq('is_active', true)
    .eq('title', 'Medical Director');
  if (error) throw error;
  return (data || []) as Recipient[];
}

// ─── Admin Recipients (for email summary) ────────────────────────────

export async function fetchAdminRecipients(): Promise<Recipient[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('role', 'admin')
    .eq('is_active', true);
  if (error) throw error;
  return (data || []) as Recipient[];
}

// ─── Service-Line Filtered Fetchers (for Executive Summary) ─────────

async function fetchKpiRowsFiltered(startDate: string, endDate: string, serviceLine: string): Promise<KpiRow[]> {
  return fetchKpiRows(startDate, endDate, serviceLine);
}

export async function fetchServiceLineKpi(
  startDate: string,
  endDate: string,
  serviceLine: string
): Promise<{ current: KpiSummary; previous: KpiSummary }> {
  const currentRows = await fetchKpiRowsFiltered(startDate, endDate, serviceLine);

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const durationMs = endMs - startMs;
  const prevEnd = new Date(startMs - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  const previousRows = await fetchKpiRowsFiltered(
    prevStart.toISOString().split('T')[0],
    prevEnd.toISOString().split('T')[0],
    serviceLine
  );

  return {
    current: aggregateKpi(currentRows),
    previous: aggregateKpi(previousRows),
  };
}

export async function fetchServiceLineVisitVolume(
  startDate: string,
  endDate: string,
  serviceLine: string
): Promise<VisitVolumePoint[]> {
  const rows = await fetchKpiRowsFiltered(startDate, endDate, serviceLine);
  const dateMap = new Map<string, { newPatients: number; established: number }>();
  rows.forEach(r => {
    const existing = dateMap.get(r.date) || { newPatients: 0, established: 0 };
    existing.newPatients += r.new_patients;
    existing.established += r.established_patients;
    dateMap.set(r.date, existing);
  });
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

export async function fetchServiceLineChargesCollections(
  startDate: string,
  endDate: string,
  serviceLine: string
): Promise<ChargesCollectionsPoint[]> {
  const rows = await fetchKpiRowsFiltered(startDate, endDate, serviceLine);
  const dateMap = new Map<string, { billed: number; collections: number }>();
  rows.forEach(r => {
    const existing = dateMap.get(r.date) || { billed: 0, collections: 0 };
    existing.billed += r.billed_amount;
    existing.collections += r.est_collections;
    dateMap.set(r.date, existing);
  });
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

export async function fetchServiceLinePayerMix(
  startDate: string,
  endDate: string,
  serviceLine: string
): Promise<PayerMixEntry[]> {
  const supabase = getSupabase();
  const { data: charges, error } = await supabase
    .from('ph_charges')
    .select('primary_payer, billed_charge')
    .gte('service_date', startDate)
    .lte('service_date', endDate)
    .eq('service_line', serviceLine);
  if (error) throw error;

  const payerTotals = new Map<string, number>();
  let grandTotal = 0;
  (charges || []).forEach((c: { primary_payer: string | null; billed_charge: number }) => {
    const payer = c.primary_payer || 'Unknown';
    payerTotals.set(payer, (payerTotals.get(payer) || 0) + c.billed_charge);
    grandTotal += c.billed_charge;
  });

  return Array.from(payerTotals.entries())
    .map(([payer, charges]) => ({
      payer,
      charges,
      percentage: grandTotal > 0 ? charges / grandTotal : 0,
    }))
    .sort((a, b) => b.charges - a.charges);
}

// ─── Income Stream Data ──────────────────────────────────────────────

export async function fetchIncomeStreamData(
  startDate: string,
  endDate: string,
  serviceLine: string
): Promise<IncomeStreamData> {
  const [kpi, visitVolume, chargesCollections, payerMix] = await Promise.all([
    fetchServiceLineKpi(startDate, endDate, serviceLine),
    fetchServiceLineVisitVolume(startDate, endDate, serviceLine),
    fetchServiceLineChargesCollections(startDate, endDate, serviceLine),
    fetchServiceLinePayerMix(startDate, endDate, serviceLine),
  ]);

  const result: IncomeStreamData = {
    kpiCurrent: kpi.current,
    kpiPrevious: kpi.previous,
    visitVolume,
    chargesCollections,
    payerMix,
  };

  // For mobile docs, also fetch facility breakdown
  if (serviceLine === 'mobile_docs') {
    result.facilities = await fetchFacilityBreakdown(startDate, endDate);
  }

  return result;
}

// ─── Facility Breakdown (Mobile Docs) ────────────────────────────────

async function fetchFacilityBreakdown(
  startDate: string,
  endDate: string
): Promise<FacilityRow[]> {
  const supabase = getSupabase();
  const { data: charges, error } = await supabase
    .from('ph_charges')
    .select('facility, billed_charge')
    .gte('service_date', startDate)
    .lte('service_date', endDate)
    .eq('service_line', 'mobile_docs');
  if (error) throw error;

  const facilityMap = new Map<string, { visits: number; charges: number }>();
  (charges || []).forEach((c: { facility: string; billed_charge: number }) => {
    const existing = facilityMap.get(c.facility) || { visits: 0, charges: 0 };
    existing.visits += 1;
    existing.charges += c.billed_charge;
    facilityMap.set(c.facility, existing);
  });

  return Array.from(facilityMap.entries())
    .map(([facilityName, data]) => ({ facilityName, ...data }))
    .sort((a, b) => b.charges - a.charges);
}

// ─── Outreach Projects ──────────────────────────────────────────────

export async function fetchOutreachProjects(): Promise<OutreachProjectRow[]> {
  const supabase = getSupabase();

  // Fetch active projects
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('status', 'active');
  if (projError) throw projError;

  if (!projects || projects.length === 0) return [];

  const rows: OutreachProjectRow[] = [];

  for (const project of projects) {
    // Get patient stats for each project
    const { data: patients, error: patError } = await supabase
      .from('patients')
      .select('disposition')
      .eq('project_id', project.id);
    if (patError) throw patError;

    const all = patients || [];
    const called = all.filter((p: { disposition: string | null }) =>
      p.disposition && p.disposition !== 'pending'
    );
    const willSwitch = all.filter((p: { disposition: string | null }) =>
      p.disposition === 'will_switch'
    );
    const forwarded = all.filter((p: { disposition: string | null }) =>
      p.disposition === 'forwarded_to_broker'
    );
    const completed = all.filter((p: { disposition: string | null }) =>
      p.disposition === 'completed'
    );

    rows.push({
      projectName: project.name,
      totalPatients: all.length,
      called: called.length,
      willSwitch: willSwitch.length,
      forwarded: forwarded.length,
      completed: completed.length,
    });
  }

  return rows;
}

// ─── AI Insights ─────────────────────────────────────────────────────

export async function fetchAiInsights(
  startDate: string,
  endDate: string
): Promise<AiInsights> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('ph_ai_insights')
    .select('*')
    .gte('insight_date', startDate)
    .lte('insight_date', endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const insights = data || [];

  const takeaways = insights
    .filter((i: { insight_type: string }) => i.insight_type === 'daily_summary')
    .map((i: { title: string; narrative: string }) => ({ title: i.title, narrative: i.narrative }));

  const opportunities = insights
    .filter((i: { insight_type: string }) => i.insight_type === 'recommendation')
    .map((i: { title: string; narrative: string }) => ({ title: i.title, narrative: i.narrative }));

  const concerns = insights
    .filter((i: { insight_type: string }) => i.insight_type === 'alert')
    .map((i: { title: string; narrative: string; severity: string }) => ({
      title: i.title,
      narrative: i.narrative,
      severity: i.severity || 'warning',
    }));

  return { takeaways, opportunities, concerns };
}

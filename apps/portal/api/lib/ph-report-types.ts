/**
 * Practice Health Report — Type definitions
 * Self-contained types for the server-side PDF report pipeline.
 * Mirrors relevant types from src/portal/types/practice-health.ts.
 */

// ─── KPI Summary ────────────────────────────────────────────────────

export interface KpiSummary {
  totalVisits: number;
  billedCharges: number;
  estCollections: number;
  totalWrvu: number;
  collectionRate: number;
}

export interface KpiTrend {
  direction: 'up' | 'down' | 'flat';
  percentage: number;
  label: string;
}

// ─── Chart Data ─────────────────────────────────────────────────────

export interface VisitVolumePoint {
  date: string;
  newPatients: number;
  established: number;
}

export interface ChargesCollectionsPoint {
  date: string;
  billed: number;
  collections: number;
}

export interface PayerMixEntry {
  payer: string;
  charges: number;
  percentage: number;
}

// ─── Provider Productivity ──────────────────────────────────────────

export interface ProviderRow {
  providerName: string;
  role: string;
  visits: number;
  wrvuTotal: number;
  billedCharges: number;
  collectionRate: number;
}

// ─── Operational Metrics ────────────────────────────────────────────

export interface OperationalSummary {
  noShowRate: number;
  avgWaitTime: number;
  scheduleUtilization: number;
}

// ─── Recipients ─────────────────────────────────────────────────────

export interface Recipient {
  email: string;
  full_name: string;
}

// ─── Aggregate Report Data ──────────────────────────────────────────

export interface ReportData {
  reportType: 'weekly' | 'monthly';
  periodLabel: string;
  generatedAt: string;
  dateRange: { start: string; end: string };
  kpiCurrent: KpiSummary;
  kpiPrevious: KpiSummary;
  visitVolume: VisitVolumePoint[];
  chargesCollections: ChargesCollectionsPoint[];
  payerMix: PayerMixEntry[];
  providers: ProviderRow[];
  operational: OperationalSummary;
}

// ─── Executive Summary Types ────────────────────────────────────────

export interface IncomeStreamData {
  kpiCurrent: KpiSummary;
  kpiPrevious: KpiSummary;
  visitVolume: VisitVolumePoint[];
  chargesCollections: ChargesCollectionsPoint[];
  payerMix: PayerMixEntry[];
  facilities?: FacilityRow[];
}

export interface FacilityRow {
  facilityName: string;
  visits: number;
  charges: number;
}

export interface OutreachProjectRow {
  projectName: string;
  totalPatients: number;
  called: number;
  willSwitch: number;
  forwarded: number;
  completed: number;
}

export interface AiInsights {
  takeaways: Array<{ title: string; narrative: string }>;
  opportunities: Array<{ title: string; narrative: string }>;
  concerns: Array<{ title: string; narrative: string; severity: string }>;
}

export interface ExecutiveSummaryData {
  periodLabel: string;
  generatedAt: string;
  dateRange: { start: string; end: string };
  insights: AiInsights;
  hciOffice: IncomeStreamData;
  mobileDocs: IncomeStreamData;
  outreachProjects: OutreachProjectRow[];
  providers: ProviderRow[];
  operational: OperationalSummary;
}

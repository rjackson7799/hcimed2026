/**
 * Practice Health Module — TypeScript type definitions
 * Matches the ph_ prefixed Supabase tables for the Practice Health analytics module.
 */

// ─── Enums & Literals ──────────────────────────────────────────────

export type ReportType = '371.02' | '36.14' | '4.06' | 'rvu';
export type ServiceLine = 'hci_office' | 'mobile_docs';
export type ServiceLineFilter = ServiceLine | 'all';
export type UploadStatus = 'processing' | 'success' | 'error' | 'duplicate';
export type ProviderRole = 'physician' | 'np' | 'pa';
export type EmploymentType = 'w2' | '1099';
export type InsightType = 'daily_summary' | 'recommendation' | 'trend' | 'alert';
export type InsightSeverity = 'critical' | 'warning' | 'info';
export type InsightCategory = 'productivity' | 'revenue' | 'coding' | 'efficiency';
export type VisitStatus = 'CHK' | 'N/S' | 'R/S' | 'CAN';
export type DatePreset = 'day' | 'week' | 'month' | 'custom';

// ─── Filters & Params ──────────────────────────────────────────────

export interface DateRange {
  start: string; // ISO date YYYY-MM-DD
  end: string;
  preset?: DatePreset;
}

export interface KpiFilters {
  dateRange: DateRange;
  serviceLine: ServiceLineFilter;
  providerId?: string;
}

// ─── Table Row Types ───────────────────────────────────────────────

export interface PhUpload {
  id: string;
  uploaded_by: string;
  upload_date: string;
  report_type: ReportType;
  file_name: string;
  file_size_bytes: number | null;
  status: UploadStatus;
  row_count: number | null;
  date_range_start: string | null;
  date_range_end: string | null;
  validation_errors: ValidationError[];
  error_message: string | null;
  overwritten_upload_id: string | null;
  created_at: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface PhProvider {
  id: string;
  name: string;
  normalized_name: string;
  npi: string | null;
  role: ProviderRole;
  employment_type: EmploymentType;
  scheduled_days_per_week: number;
  fte: number; // Generated column: days / 5.0
  service_lines: ServiceLine[];
  is_active: boolean;
  hire_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhFacility {
  id: string;
  name: string;
  normalized_name: string;
  pos_code: number | null;
  service_line: ServiceLine;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PhRvuLookup {
  id: string;
  cpt_code: string;
  description: string | null;
  work_rvu: number;
  practice_expense_rvu: number;
  malpractice_rvu: number;
  total_rvu: number;
  conversion_factor: number | null;
  effective_date: string;
}

export interface PhCharge {
  id: string;
  upload_id: string;
  service_date: string;
  claim_date: string | null;
  facility: string;
  facility_pos: number | null;
  service_line: ServiceLine;
  rendering_provider: string;
  provider_id: string | null;
  cpt_code: string;
  cpt_description: string | null;
  cpt_group: string | null;
  primary_payer: string | null;
  secondary_payer: string | null;
  icd_codes: string[];
  icd_names: string[];
  billed_charge: number;
  payer_charge: number;
  self_charge: number;
  units: number;
  modifiers: string[];
  is_billable: boolean;
  work_rvu: number;
  total_rvu: number;
  created_at: string;
}

export interface PhCollection {
  id: string;
  upload_id: string;
  period_start: string;
  period_end: string;
  facility: string;
  service_line: ServiceLine;
  charges: number;
  payer_charges: number;
  self_charges: number;
  payments: number;
  payer_payments: number;
  patient_payments: number;
  contractual_adj: number;
  payer_withheld: number;
  writeoffs: number;
  refunds: number;
  claim_count: number;
  patient_count: number;
  ar_change: number;
  created_at: string;
}

export interface PhProductivity {
  id: string;
  upload_id: string;
  appointment_date: string;
  facility: string;
  service_line: ServiceLine;
  rendering_provider: string | null;
  provider_id: string | null;
  visit_type: string | null;
  visit_status: string;
  is_televisit: boolean;
  scheduled_duration_min: number | null;
  actual_duration_min: number | null;
  variance_min: number | null;
  wait_time_min: number | null;
  clinician_time_min: number | null;
  appointment_start_time: string | null;
  appointment_end_time: string | null;
  created_at: string;
}

export interface PhKpiDaily {
  id: string;
  date: string;
  provider_id: string | null;
  service_line: ServiceLineFilter;
  // Volume
  visits: number;
  no_shows: number;
  cancellations: number;
  televisits: number;
  new_patients: number;
  established_patients: number;
  // Financial
  billed_amount: number;
  est_collections: number;
  revenue_per_visit: number;
  // Productivity
  rvu_total: number;
  wrvu_total: number;
  avg_visit_duration_min: number;
  avg_wait_time_min: number;
  avg_clinician_time_min: number;
  schedule_utilization: number;
  // Clinical
  avg_diagnoses_per_encounter: number;
  quality_code_encounters: number;
  total_encounters: number;
  created_at: string;
}

export interface PhAiInsight {
  id: string;
  insight_date: string;
  insight_type: InsightType;
  service_line: ServiceLineFilter | null;
  category: InsightCategory | null;
  severity: InsightSeverity | null;
  title: string;
  narrative: string;
  supporting_data: Record<string, unknown> | null;
  generated_by_upload_id: string | null;
  model_version: string | null;
  created_at: string;
}

// ─── Dashboard / UI Types ──────────────────────────────────────────

export interface KpiSummary {
  totalVisits: number;
  billedCharges: number;
  estCollections: number;
  totalWrvu: number;
  collectionRate: number;
}

export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  role: ProviderRole;
  fte: number;
  visits: number;
  visitsPerScheduledDay: number;
  rvuTotal: number;
  wrvuTotal: number;
  wrvuPerDay: number;
  billedCharges: number;
  avgVisitDuration: number;
  avgWaitTime: number;
  sparklineData: SparklinePoint[];
  benchmarkStatus: 'above' | 'at' | 'below';
}

export interface SparklinePoint {
  date: string;
  value: number;
}

export interface PayerMixEntry {
  payer: string;
  charges: number;
  percentage: number;
}

export interface EmLevelEntry {
  cptCode: string;
  description: string;
  count: number;
  percentage: number;
}

// ─── Upload Pipeline Types ─────────────────────────────────────────

export interface ReportDetectionResult {
  reportType: ReportType;
  confidence: number;
  matchedHeaders: string[];
  missingOptional: string[];
}

export interface PhiScanResult {
  hasPhi: boolean;
  phiColumns: string[];
}

export interface ParsedUploadData {
  reportType: ReportType;
  fileName: string;
  fileSizeBytes: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface UploadResult {
  success: boolean;
  uploadId: string;
  rowCount: number;
  kpiDatesUpdated: string[];
  errors?: ValidationError[];
}

/**
 * AWV Tracker Module — Type Definitions
 * Types for the Annual Wellness Visit tracking module.
 * Matches the awv_ prefixed Supabase tables.
 */

// ─── Enums & Literals ──────────────────────────────────────────────

export type AwvEligibilityStatus = 'Pending Review' | 'Eligible' | 'Not Eligible';
export type AwvCompletionStatus = 'Not Started' | 'Scheduled' | 'Completed' | 'Refused' | 'Unable to Complete';
export type AwvType = 'IPPE' | 'Initial AWV' | 'Subsequent AWV';
export type MedicareStatus = 'Active' | 'Inactive' | 'Unknown';
export type AwvDateSource = 'Manual' | 'Upload' | 'PHM Auto';
export type AwvServiceLine = 'HCI Office' | 'Mobile Docs';
export type AwvUploadStatus = 'Processing' | 'Completed' | 'Completed with Warnings' | 'Failed';

export const AWV_CPT_CODES: Record<AwvType, string> = {
  'IPPE': 'G0402',
  'Initial AWV': 'G0438',
  'Subsequent AWV': 'G0439',
};

export const AWV_TYPE_FROM_CPT: Record<string, AwvType> = {
  'G0402': 'IPPE',
  'G0438': 'Initial AWV',
  'G0439': 'Subsequent AWV',
};

// ─── Table Row Types ───────────────────────────────────────────────

export interface AwvPatient {
  id: string;
  tenant_id: string;
  ecw_patient_id: string;
  last_name: string;
  assigned_provider_id: string | null;
  service_line: AwvServiceLine;
  facility_id: string | null;
  payer_name: string | null;
  medicare_status: MedicareStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AwvTracking {
  id: string;
  patient_id: string;
  eligibility_status: AwvEligibilityStatus;
  eligibility_reason: string | null;
  completion_status: AwvCompletionStatus;
  completion_date: string | null;
  awv_type: AwvType | null;
  cpt_code: string | null;
  billed_amount: number | null;
  last_awv_date: string | null;
  next_eligible_date: string | null;
  date_source: AwvDateSource;
  scheduled_date: string | null;
  notes: string | null;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface AwvUpload {
  id: string;
  tenant_id: string;
  uploaded_by: string;
  upload_date: string;
  file_name: string;
  row_count: number | null;
  new_patients: number;
  updated_patients: number;
  flagged_patients: number;
  status: AwvUploadStatus;
  validation_errors: AwvValidationError[] | null;
  created_at: string;
}

export interface AwvValidationError {
  row: number;
  field: string;
  message: string;
}

export interface AwvReimbursementRate {
  id: string;
  cpt_code: string;
  description: string;
  expected_reimbursement: number;
  effective_date: string;
  is_current: boolean;
}

export interface AwvAddon {
  id: string;
  tracking_id: string;
  cpt_code: string;
  description: string | null;
  billed_amount: number | null;
  created_at: string;
}

// ─── UI / Dashboard Types ──────────────────────────────────────────

/** Joined view: patient + their active tracking record */
export interface AwvPatientWithTracking extends AwvPatient {
  tracking: AwvTracking;
  provider_name: string | null;
  facility_name: string | null;
}

export interface AwvRegistryFilters {
  search: string;
  eligibilityStatus: AwvEligibilityStatus | 'All';
  completionStatus: AwvCompletionStatus | 'All';
  serviceLine: AwvServiceLine | 'All';
  providerId: string | 'All';
  eligibilityTiming: 'All' | 'Newly Eligible' | 'Eligible Soon' | 'Overdue';
}

export interface AwvKpiSummary {
  eligiblePatients: number;
  pendingReview: number;
  completedYtd: number;
  totalEligible: number;
  completionRate: number;
  revenueCaptured: number;
  revenueRemaining: number;
}

export interface AwvProviderMetrics {
  providerId: string;
  providerName: string;
  assignedPatients: number;
  eligiblePatients: number;
  completedYtd: number;
  completionRate: number;
  revenueCaptured: number;
  outstanding: number;
}

export interface AwvRevenueMetrics {
  revenueCapturedYtd: number;
  revenueRemaining: number;
  totalOpportunity: number;
  captureRate: number;
  avgRevenuePerAwv: number;
  providerBreakdown: AwvProviderMetrics[];
}

export interface AwvMonthlyRevenuePoint {
  month: string;
  monthNum: number;
  awvCount: number;
  revenue: number;
  addonRevenue: number;
  cumulativeRevenue: number;
}

export interface AwvServiceLineSplit {
  serviceLine: AwvServiceLine;
  completedCount: number;
  revenue: number;
  percentage: number;
}

/**
 * CCM / RPM Program Tracker — Type Definitions
 * Types for the Chronic Care Management & Remote Patient Monitoring tracking module.
 * Matches the ccm_ prefixed Supabase tables.
 */

// ─── Enums & Literals ──────────────────────────────────────────────

export type CcmEnrollmentStatus = 'Eligible' | 'Enrolled' | 'Declined' | 'Disenrolled' | 'Inactive';
export type CcmProgramType = 'CCM Only' | 'RPM Only' | 'CCM + RPM';
export type CcmDeviceType = 'Blood Pressure Monitor' | 'Pulse Oximeter' | 'Glucose Monitor' | 'Weight Scale' | 'Thermometer' | 'Other';
export type CcmDeviceStatus = 'Active' | 'Returned' | 'Lost' | 'Malfunctioning';
export type CcmMedicareStatus = 'Active' | 'Inactive' | 'Unknown';
export type CcmServiceLine = 'HCI Office' | 'Mobile Docs';
export type CcmUploadStatus = 'Processing' | 'Completed' | 'Completed with Warnings' | 'Failed';

export type CcmCptCode = '99490' | '99439' | '99491' | '99453' | '99454' | '99457' | '99458';

export type DisenrollmentReason =
  | 'Patient withdrew consent'
  | 'No longer meets clinical criteria'
  | 'Transferred to another provider'
  | 'Non-compliant with program requirements'
  | 'Insurance coverage changed'
  | 'Deceased'
  | 'Other';

// ─── CPT Code Mappings ─────────────────────────────────────────────

export const CCM_CPT_CODES: Record<CcmCptCode, { description: string; programType: 'CCM' | 'RPM' }> = {
  '99490': { description: 'CCM, initial 20 minutes/month', programType: 'CCM' },
  '99439': { description: 'CCM, each additional 20 minutes', programType: 'CCM' },
  '99491': { description: 'Complex CCM, 60 minutes/month', programType: 'CCM' },
  '99453': { description: 'RPM device setup & patient education', programType: 'RPM' },
  '99454': { description: 'RPM device supply & daily data transmission', programType: 'RPM' },
  '99457': { description: 'RPM treatment management, initial 20 min', programType: 'RPM' },
  '99458': { description: 'RPM treatment management, additional 20 min', programType: 'RPM' },
};

/** Get CPT codes applicable to a given program type */
export function getCptCodesForProgram(programType: CcmProgramType): CcmCptCode[] {
  const codes = Object.entries(CCM_CPT_CODES) as [CcmCptCode, { programType: 'CCM' | 'RPM' }][];
  switch (programType) {
    case 'CCM Only':
      return codes.filter(([, v]) => v.programType === 'CCM').map(([k]) => k);
    case 'RPM Only':
      return codes.filter(([, v]) => v.programType === 'RPM').map(([k]) => k);
    case 'CCM + RPM':
      return codes.map(([k]) => k);
  }
}

// ─── Table Row Types ───────────────────────────────────────────────

export interface CcmPatient {
  id: string;
  tenant_id: string;
  ecw_patient_id: string;
  last_name: string;
  assigned_provider_id: string | null;
  service_line: CcmServiceLine;
  facility_id: string | null;
  payer_name: string | null;
  medicare_status: CcmMedicareStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CcmEnrollment {
  id: string;
  patient_id: string;
  enrollment_status: CcmEnrollmentStatus;
  program_type: CcmProgramType | null;
  enrollment_date: string | null;
  disenrollment_date: string | null;
  disenrollment_reason: DisenrollmentReason | null;
  consent_obtained: boolean;
  consent_date: string | null;
  notes: string | null;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CcmDevice {
  id: string;
  enrollment_id: string;
  device_type: CcmDeviceType;
  device_status: CcmDeviceStatus;
  assigned_date: string;
  removed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CcmReimbursement {
  id: string;
  enrollment_id: string;
  service_month: string;
  cpt_code: CcmCptCode;
  billed_amount: number | null;
  paid_amount: number;
  adjustment_amount: number | null;
  denial_reason: string | null;
  date_entered: string;
  entered_by: string;
  notes: string | null;
  created_at: string;
}

export interface CcmUpload {
  id: string;
  tenant_id: string;
  uploaded_by: string;
  upload_date: string;
  file_name: string;
  row_count: number | null;
  new_patients: number;
  updated_patients: number;
  flagged_patients: number;
  status: CcmUploadStatus;
  validation_errors: CcmValidationError[] | null;
  created_at: string;
}

export interface CcmValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CcmReimbursementRate {
  id: string;
  cpt_code: CcmCptCode;
  description: string;
  program_type: 'CCM' | 'RPM';
  expected_reimbursement: number;
  effective_date: string;
  is_current: boolean;
}

// ─── UI / Dashboard Types ──────────────────────────────────────────

/** Joined view: patient + their active enrollment record + enriched names */
export interface CcmPatientWithEnrollment extends CcmPatient {
  enrollment: CcmEnrollment;
  provider_name: string | null;
  facility_name: string | null;
  active_device_count: number;
  last_reimbursement_month: string | null;
}

export interface CcmRegistryFilters {
  search: string;
  enrollmentStatus: CcmEnrollmentStatus | 'All';
  programType: CcmProgramType | 'All';
  serviceLine: CcmServiceLine | 'All';
  providerId: string | 'All';
  deviceFilter: 'All' | 'Has Active Devices' | 'No Devices';
}

export interface CcmKpiSummary {
  totalEligible: number;
  enrolledCount: number;
  enrollmentRate: number;
  ccmOnlyCount: number;
  rpmOnlyCount: number;
  dualCount: number;
  declinedCount: number;
  activeDevices: number;
  patientsWithDevices: number;
  monthlyRevenueActual: number;
  monthlyRevenueExpected: number;
  collectionRate: number;
  consentMissing: number;
}

export interface CcmProviderMetrics {
  providerId: string;
  providerName: string;
  assignedPatients: number;
  enrolledCount: number;
  enrollmentRate: number;
  ccmOnlyCount: number;
  dualCount: number;
  rpmOnlyCount: number;
  monthlyRevenue: number;
  revenuePerEnrolled: number;
  declinedCount: number;
}

export interface CcmRevenueMetrics {
  monthlyActual: number;
  monthlyExpected: number;
  collectionRate: number;
  revenuLeakage: number;
  revenuePerEnrolled: number;
  ytdRevenue: number;
  ccmRevenue: number;
  rpmRevenue: number;
  providerBreakdown: CcmProviderMetrics[];
}

export interface CcmMonthlyRevenuePoint {
  month: string;
  monthLabel: string;
  ccmRevenue: number;
  rpmRevenue: number;
  totalRevenue: number;
  expectedRevenue: number;
  cumulativeRevenue: number;
}

export interface CcmProgramSplit {
  program: 'CCM' | 'RPM';
  enrolledCount: number;
  revenue: number;
  percentage: number;
}

export interface CcmDeviceSummary {
  totalActive: number;
  byType: Record<CcmDeviceType, number>;
  coverageRate: number;
  nonActiveCount: number;
}

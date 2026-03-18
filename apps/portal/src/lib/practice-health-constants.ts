/**
 * Practice Health Module — Constants
 * Report signatures, PHI blacklist, benchmark targets, and configuration.
 */

// ─── Report Column Signatures ──────────────────────────────────────
// Used by report-detection.ts to auto-identify which eCW report was uploaded.

export const REPORT_SIGNATURES = {
  '371.02': {
    required: [
      'CPT Code',
      'Billed Charge',
      'Rendering Provider Name',
      'Facility POS',
    ],
    optional: [
      'CPT Description',
      'CPT Group Name',
      'Primary Payer Name',
      'Service Date',
      'Claim Date',
      'ICD1 Code',
      'Modifiers 1',
      'Payer Charge',
      'Self Charge',
      'Units',
      'Facility',
    ],
  },
  '36.14': {
    required: [
      'Contractual Adjustments',
      'Writeoff Adjustments',
      'Change in A/R',
      'Claim Count',
    ],
    optional: [
      'Payer Payments',
      'Patient Payments',
      'Charges',
      'Payments',
      'Facility',
      'Payer Withheld',
      'Refunds',
      'Patient Count',
    ],
  },
  '4.06': {
    required: [
      'Appointment Duration (scheduled)',
      'Appointment Duration (actual)',
      'Wait Time',
      'Visit Status',
    ],
    optional: [
      'Is Televisit',
      'Visit Type',
      'Facility',
      'Appointment Date',
      'Appointment Start Time',
      'Appointment End Time',
      'Appointment Arrived Time',
      'Time with Clinician',
    ],
  },
} as const;

export type ReportSignatureKey = keyof typeof REPORT_SIGNATURES;

// ─── PHI Blacklist ─────────────────────────────────────────────────
// Column headers that indicate Protected Health Information.
// If any of these are found in the uploaded file, it is immediately rejected.

export const PHI_COLUMN_BLACKLIST = [
  'patient name',
  'patient first name',
  'patient last name',
  'patient dob',
  'patient date of birth',
  'patient acct no',
  'patient account no',
  'patient account number',
  'patient ssn',
  'patient social security',
  'patient address',
  'patient address line',
  'patient street',
  'patient city',
  'patient state',
  'patient zip',
  'patient phone',
  'patient home phone',
  'patient cell phone',
  'patient mobile',
  'patient e-mail',
  'patient email',
  'insurance subscriber no',
  'subscriber no',
  'primary subscriber no',
  'secondary subscriber no',
  'member id',
  'subscriber id',
] as const;

// ─── Place of Service to Service Line Mapping ──────────────────────

export const POS_SERVICE_LINE_MAP: Record<number, 'hci_office' | 'mobile_docs'> = {
  11: 'hci_office',   // Office
  32: 'mobile_docs',  // Nursing Facility
  33: 'mobile_docs',  // Custodial Care Facility
  99: 'mobile_docs',  // Other / Home
};

// ─── Upload Limits ─────────────────────────────────────────────────

export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_UPLOAD_ROW_COUNT = 5000;
export const MIN_UPLOAD_ROW_COUNT = 1;
export const MAX_SERVICE_DATE_AGE_DAYS = 365;

// ─── Benchmark Targets ─────────────────────────────────────────────
// Default targets from the Mobile Docs financial model / PRD.

export const BENCHMARKS = {
  visitsPerDay: {
    physician: 7.0,
    np: 6.0,
    pa: 6.0,
  },
  wrvuPerMonth: {
    physician: 200,
    np: 120, // Adjusted for 0.6 FTE
    pa: 120,
  },
  collectionRate: 85,        // % — critical alert if below
  netCollectionRate: 90,     // %
  noShowRate: 20,            // % — warning if above
  avgWaitTimeMinutes: 15,    // minutes
  revenuePerEncounter: 281,  // $ — blended from financial model
  ccmPenetration: 65,        // %
  rpmPenetration: 35,        // %
  daysInAr: 45,              // days — critical alert if above
} as const;

// ─── KPI Calculation ───────────────────────────────────────────────

export const BILLABLE_CPT_PATTERN = /^(99[0-9]{3}|[A-Z][0-9]{4})$/;
export const NEW_PATIENT_CPT_RANGE = { min: 99201, max: 99205 };
export const ESTABLISHED_PATIENT_CPT_RANGE = { min: 99211, max: 99215 };
export const QUALITY_CODE_PREFIX = 'G';

// Visit statuses that count as completed
export const COMPLETED_VISIT_STATUSES = ['CHK', 'Checked Out', 'checked_out'] as const;
export const NO_SHOW_VISIT_STATUSES = ['N/S', 'No Show', 'no_show'] as const;
export const CANCELLED_VISIT_STATUSES = ['R/S', 'CAN', 'Cancelled', 'Rescheduled', 'cancelled'] as const;

// ─── Dashboard ─────────────────────────────────────────────────────

export const PH_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'providers', label: 'Providers' },
  { id: 'financial', label: 'Financial' },
  { id: 'operations', label: 'Operations' },
] as const;

export type PhTabId = typeof PH_TABS[number]['id'];

export const SERVICE_LINE_OPTIONS = [
  { value: 'all', label: 'All Service Lines' },
  { value: 'hci_office', label: 'HCI Office' },
  { value: 'mobile_docs', label: 'Mobile Docs' },
] as const;

// ─── Upload Status Config ──────────────────────────────────────────

export const PH_UPLOAD_STATUS_CONFIG = {
  processing: { color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'Processing' },
  success:    { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Success' },
  error:      { color: 'text-red-700',     bg: 'bg-red-100',     label: 'Error' },
  duplicate:  { color: 'text-yellow-700',  bg: 'bg-yellow-100',  label: 'Duplicate' },
} as const;

export const PH_REPORT_TYPE_LABELS: Record<string, string> = {
  '371.02': 'Charges at CPT Level',
  '36.14': 'Financial Analysis',
  '4.06': 'Productivity',
  'rvu': 'RVU Lookup',
};

export const PH_INSIGHT_SEVERITY_CONFIG = {
  critical: { color: 'text-red-700',    bg: 'bg-red-100',    label: 'Critical', icon: 'AlertTriangle' },
  warning:  { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Warning',  icon: 'AlertCircle' },
  info:     { color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'Info',     icon: 'Info' },
} as const;

export const PH_INSIGHT_CATEGORY_LABELS: Record<string, string> = {
  productivity: 'Productivity',
  revenue: 'Revenue',
  coding: 'Coding',
  efficiency: 'Efficiency',
};

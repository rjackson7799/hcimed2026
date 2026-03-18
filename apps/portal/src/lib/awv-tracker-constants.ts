/**
 * AWV Tracker — Constants
 * Colors, status configs, tab layout, PHI blacklist, eligibility reasons, CPT mappings.
 */

import type { AwvEligibilityStatus, AwvCompletionStatus, AwvServiceLine } from '@/types/awv-tracker';

// ─── Tab Config ──────────────────────────────────────────────────

export const AWV_TABS = [
  { id: 'registry', label: 'Patient Registry' },
  { id: 'upload', label: 'Upload' },
  { id: 'revenue', label: 'Revenue' },
] as const;

export type AwvTabId = typeof AWV_TABS[number]['id'];

// ─── Eligibility Status Config ───────────────────────────────────

export const ELIGIBILITY_STATUS_CONFIG: Record<AwvEligibilityStatus, { bg: string; text: string; dotClass: string }> = {
  'Pending Review': { bg: 'bg-amber-950/50', text: 'text-amber-300', dotClass: 'bg-amber-400' },
  'Eligible': { bg: 'bg-emerald-950/50', text: 'text-emerald-300', dotClass: 'bg-emerald-400' },
  'Not Eligible': { bg: 'bg-red-950/50', text: 'text-red-300', dotClass: 'bg-red-400' },
};

// ─── Completion Status Config ────────────────────────────────────

export const COMPLETION_STATUS_CONFIG: Record<AwvCompletionStatus, { bg: string; text: string; dotClass: string }> = {
  'Not Started': { bg: 'bg-slate-800', text: 'text-slate-300', dotClass: 'bg-slate-400' },
  'Scheduled': { bg: 'bg-blue-950/50', text: 'text-blue-300', dotClass: 'bg-blue-400' },
  'Completed': { bg: 'bg-emerald-950/50', text: 'text-emerald-300', dotClass: 'bg-emerald-400' },
  'Refused': { bg: 'bg-amber-950/50', text: 'text-amber-300', dotClass: 'bg-amber-400' },
  'Unable to Complete': { bg: 'bg-red-950/50', text: 'text-red-300', dotClass: 'bg-red-400' },
};

// ─── Service Line Config ─────────────────────────────────────────

export const SERVICE_LINE_CONFIG = {
  'HCI Office': { bg: 'bg-violet-950/50', text: 'text-violet-300' },
  'Mobile Docs': { bg: 'bg-blue-950/50', text: 'text-blue-300' },
} as const;

// ─── Medicare Status Config ──────────────────────────────────────

export const MEDICARE_STATUS_CONFIG = {
  Active: { bg: 'bg-emerald-950/50', text: 'text-emerald-300' },
  Inactive: { bg: 'bg-red-950/50', text: 'text-red-300' },
  Unknown: { bg: 'bg-slate-800', text: 'text-slate-300' },
} as const;

// ─── Service Line Chart Colors (hex for recharts) ───────────────

export const SERVICE_LINE_CHART_COLORS: Record<AwvServiceLine, string> = {
  'HCI Office': '#7c3aed',
  'Mobile Docs': '#3b82f6',
};

// ─── Completion Rate Thresholds ──────────────────────────────────

export const COMPLETION_RATE_THRESHOLDS = {
  green: 70, // ≥ 70% = green
  amber: 40, // ≥ 40% = amber
  // < 40% = red
} as const;

// ─── Eligibility Reasons ─────────────────────────────────────────

export const ELIGIBILITY_REASONS = [
  'AWV completed < 12 months ago',
  'Not enrolled in Medicare',
  'Medicare Part B enrollment < 12 months (IPPE only)',
  'Hospice enrolled',
  'Patient deceased',
  'No longer a practice patient',
  'Other',
] as const;

// ─── PHI Column Blacklist ────────────────────────────────────────

export const PHI_COLUMN_BLACKLIST = [
  'patient first name', 'first name', 'firstname', 'patient_first_name',
  'patient dob', 'dob', 'date of birth', 'birth date', 'birthdate', 'patient_dob',
  'patient ssn', 'ssn', 'social security', 'social_security',
  'patient address', 'address', 'street', 'address_line1', 'patient_address',
  'patient phone', 'phone', 'telephone', 'cell', 'mobile', 'patient_phone',
  'patient email', 'email', 'email address', 'patient_email',
  'medicare beneficiary identifier', 'mbi', 'medicare_id',
  'insurance subscriber no', 'subscriber_no', 'member_id',
  'diagnosis', 'dx', 'icd', 'diagnosis_code',
  'medication', 'medications', 'rx', 'prescription',
  'clinical notes', 'notes', 'clinical_notes',
] as const;

// ─── Upload Required Columns ─────────────────────────────────────

export const UPLOAD_REQUIRED_COLUMNS = [
  'Patient Acct No',
  'Patient Last Name',
  'Rendering Provider',
] as const;

export const UPLOAD_OPTIONAL_COLUMNS = [
  'Facility',
  'Primary Payer Name',
  'Last AWV Date',
  'Last AWV CPT',
] as const;

// ─── Reimbursement Rates (reference data) ────────────────────────

export const DEFAULT_REIMBURSEMENT_RATES = {
  'G0402': { description: 'Initial Preventive Physical Exam (IPPE)', amount: 175 },
  'G0438': { description: 'Initial Annual Wellness Visit', amount: 270 },
  'G0439': { description: 'Subsequent Annual Wellness Visit', amount: 230 },
  '99497': { description: 'Advance Care Planning (initial 30 min)', amount: 86 },
  '99498': { description: 'Advance Care Planning (additional 30 min)', amount: 75 },
  'G0444': { description: 'Depression Screening', amount: 18 },
  'G0442': { description: 'Alcohol Misuse Screening', amount: 25 },
} as const;

// ─── Eligibility Timing Labels ───────────────────────────────────

export const ELIGIBILITY_TIMING_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Newly Eligible', label: 'Newly Eligible' },
  { value: 'Eligible Soon', label: 'Eligible Soon (30 days)' },
  { value: 'Overdue', label: 'Overdue (90+ days)' },
] as const;

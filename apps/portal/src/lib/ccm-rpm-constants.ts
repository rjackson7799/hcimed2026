/**
 * CCM / RPM Tracker — Constants
 * Colors, status configs, tab layout, CPT rates, thresholds, upload validation.
 */

import type {
  CcmEnrollmentStatus,
  CcmProgramType,
  CcmDeviceType,
  CcmDeviceStatus,
  CcmServiceLine,
} from '@/types/ccm-rpm';

// ─── Tab Config ──────────────────────────────────────────────────

export const CCM_RPM_TABS = [
  { id: 'registry', label: 'Patient Registry' },
  { id: 'enrollment-devices', label: 'Enrollment & Devices' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'upload', label: 'Upload' },
] as const;

export type CcmRpmTabId = typeof CCM_RPM_TABS[number]['id'];

// ─── Enrollment Status Config ───────────────────────────────────

export const ENROLLMENT_STATUS_CONFIG: Record<CcmEnrollmentStatus, { bg: string; text: string; dotClass: string }> = {
  'Eligible': { bg: 'bg-slate-800', text: 'text-slate-300', dotClass: 'bg-slate-400' },
  'Enrolled': { bg: 'bg-emerald-950/50', text: 'text-emerald-300', dotClass: 'bg-emerald-400' },
  'Declined': { bg: 'bg-amber-950/50', text: 'text-amber-300', dotClass: 'bg-amber-400' },
  'Disenrolled': { bg: 'bg-red-950/50', text: 'text-red-300', dotClass: 'bg-red-400' },
  'Inactive': { bg: 'bg-zinc-800', text: 'text-zinc-400', dotClass: 'bg-zinc-500' },
};

// ─── Program Type Config ────────────────────────────────────────

export const PROGRAM_TYPE_CONFIG: Record<CcmProgramType, { bg: string; text: string; dotClass: string }> = {
  'CCM Only': { bg: 'bg-blue-950/50', text: 'text-blue-300', dotClass: 'bg-blue-400' },
  'RPM Only': { bg: 'bg-teal-950/50', text: 'text-teal-300', dotClass: 'bg-teal-400' },
  'CCM + RPM': { bg: 'bg-purple-950/50', text: 'text-purple-300', dotClass: 'bg-purple-400' },
};

// ─── Device Type Config ─────────────────────────────────────────

export const DEVICE_TYPE_CONFIG: Record<CcmDeviceType, { bg: string; text: string; icon: string }> = {
  'Blood Pressure Monitor': { bg: 'bg-red-950/50', text: 'text-red-300', icon: 'heart-pulse' },
  'Pulse Oximeter': { bg: 'bg-sky-950/50', text: 'text-sky-300', icon: 'activity' },
  'Glucose Monitor': { bg: 'bg-orange-950/50', text: 'text-orange-300', icon: 'droplets' },
  'Weight Scale': { bg: 'bg-violet-950/50', text: 'text-violet-300', icon: 'scale' },
  'Thermometer': { bg: 'bg-amber-950/50', text: 'text-amber-300', icon: 'thermometer' },
  'Other': { bg: 'bg-slate-800', text: 'text-slate-300', icon: 'cpu' },
};

// ─── Device Status Config ───────────────────────────────────────

export const DEVICE_STATUS_CONFIG: Record<CcmDeviceStatus, { bg: string; text: string; dotClass: string }> = {
  'Active': { bg: 'bg-emerald-950/50', text: 'text-emerald-300', dotClass: 'bg-emerald-400' },
  'Returned': { bg: 'bg-blue-950/50', text: 'text-blue-300', dotClass: 'bg-blue-400' },
  'Lost': { bg: 'bg-red-950/50', text: 'text-red-300', dotClass: 'bg-red-400' },
  'Malfunctioning': { bg: 'bg-amber-950/50', text: 'text-amber-300', dotClass: 'bg-amber-400' },
};

// ─── Service Line Config ────────────────────────────────────────

export const CCM_SERVICE_LINE_CONFIG: Record<CcmServiceLine, { bg: string; text: string }> = {
  'HCI Office': { bg: 'bg-violet-950/50', text: 'text-violet-300' },
  'Mobile Docs': { bg: 'bg-blue-950/50', text: 'text-blue-300' },
};

// ─── Medicare Status Config ─────────────────────────────────────

export const CCM_MEDICARE_STATUS_CONFIG = {
  Active: { bg: 'bg-emerald-950/50', text: 'text-emerald-300' },
  Inactive: { bg: 'bg-red-950/50', text: 'text-red-300' },
  Unknown: { bg: 'bg-slate-800', text: 'text-slate-300' },
} as const;

// ─── Chart Colors (hex for recharts) ────────────────────────────

export const CCM_CHART_COLORS = {
  ccm: '#3b82f6',      // blue-500
  rpm: '#14b8a6',      // teal-500
  expected: '#6b7280', // gray-500
  actual: '#22c55e',   // green-500
  leakage: '#ef4444',  // red-500
} as const;

export const CCM_SERVICE_LINE_CHART_COLORS: Record<CcmServiceLine, string> = {
  'HCI Office': '#7c3aed',
  'Mobile Docs': '#3b82f6',
};

// ─── CPT Reimbursement Rates ────────────────────────────────────

export const CPT_REIMBURSEMENT_RATES = {
  '99490': { description: 'CCM, initial 20 min/month', amount: 64, programType: 'CCM' as const },
  '99439': { description: 'CCM, each additional 20 min', amount: 47, programType: 'CCM' as const },
  '99491': { description: 'Complex CCM, 60 min/month', amount: 87, programType: 'CCM' as const },
  '99453': { description: 'RPM device setup & education', amount: 19, programType: 'RPM' as const },
  '99454': { description: 'RPM device supply & data', amount: 55, programType: 'RPM' as const },
  '99457': { description: 'RPM treatment mgmt, initial 20 min', amount: 51, programType: 'RPM' as const },
  '99458': { description: 'RPM treatment mgmt, addl 20 min', amount: 42, programType: 'RPM' as const },
} as const;

// ─── Thresholds ─────────────────────────────────────────────────

export const COLLECTION_RATE_THRESHOLDS = {
  green: 90, // ≥ 90% = green
  amber: 75, // ≥ 75% = amber
  // < 75% = red
} as const;

export const ENROLLMENT_RATE_TARGETS = {
  ccm: 65, // 65% CCM enrollment target
  rpm: 35, // 35% RPM enrollment target
  dual: 50, // 50% of enrolled on CCM + RPM
} as const;

// ─── Disenrollment Reasons ──────────────────────────────────────

export const DISENROLLMENT_REASONS = [
  'Patient withdrew consent',
  'No longer meets clinical criteria',
  'Transferred to another provider',
  'Non-compliant with program requirements',
  'Insurance coverage changed',
  'Deceased',
  'Other',
] as const;

// ─── PHI Column Blacklist (shared with AWV) ─────────────────────

export const CCM_PHI_COLUMN_BLACKLIST = [
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
  'clinical notes', 'clinical_notes',
] as const;

// ─── Upload Required Columns ────────────────────────────────────

export const CCM_UPLOAD_REQUIRED_COLUMNS = [
  'Patient Acct No',
  'Patient Last Name',
  'Rendering Provider',
] as const;

export const CCM_UPLOAD_OPTIONAL_COLUMNS = [
  'Facility',
  'Primary Payer Name',
] as const;

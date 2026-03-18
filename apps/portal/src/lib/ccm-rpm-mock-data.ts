/**
 * CCM / RPM Tracker — Mock Data
 * Realistic mock data for development. Uses provider/facility names consistent
 * with AWV Tracker and Mobile Docs modules.
 * Mutable arrays allow session-persistent add/update operations.
 */

import type {
  CcmPatient,
  CcmEnrollment,
  CcmDevice,
  CcmReimbursement,
  CcmUpload,
  CcmPatientWithEnrollment,
  CcmKpiSummary,
  CcmEnrollmentStatus,
  CcmProgramType,
  CcmDeviceType,
  CcmDeviceStatus,
  CcmServiceLine,
  CcmCptCode,
  CcmRevenueMetrics,
  CcmMonthlyRevenuePoint,
  CcmProviderMetrics,
  CcmProgramSplit,
  CcmDeviceSummary,
  CcmValidationError,
} from '@/types/ccm-rpm';
import { CPT_REIMBURSEMENT_RATES } from '@/lib/ccm-rpm-constants';

// ─── Providers (matching AWV Tracker seed data) ──────────────────

const PROVIDERS = [
  { id: 'prov-chen', name: 'Dr. Chen' },
  { id: 'prov-np1', name: 'NP1' },
  { id: 'prov-np2', name: 'NP2' },
];

// ─── Facilities (matching AWV Tracker seed data) ─────────────────

const FACILITIES = [
  { id: 'fac-01', name: 'Sunrise Senior Living' },
  { id: 'fac-02', name: 'Golden Oaks SNF' },
  { id: 'fac-03', name: 'Pacific Care Home' },
  { id: 'fac-04', name: 'Valley Vista Board & Care' },
  { id: 'fac-05', name: 'Mountain View SNF' },
  { id: 'fac-06', name: 'Harmony House' },
  { id: 'fac-07', name: 'Oakwood Manor' },
  { id: 'fac-08', name: 'Cedar Ridge Care' },
];

// ─── AWV Cross-Reference IDs ─────────────────────────────────────
// Patients at indices 0, 3, 7, 11, 14 share ecw_patient_ids with AWV

const AWV_SHARED_IDS = ['ECW10001', 'ECW10004', 'ECW10008', 'ECW10012', 'ECW10015'];

const TENANT_ID = '00000000-0000-0000-0000-000000000000';

// ─── Patient Registry (mutable for session persistence) ──────────

let mockCcmPatients: CcmPatient[] = [
  // HCI Office patients (8)
  { id: 'ccm-p-01', tenant_id: TENANT_ID, ecw_patient_id: 'ECW10001', last_name: 'Williams', assigned_provider_id: 'prov-chen', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-08-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-02', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80002', last_name: 'Garcia', assigned_provider_id: 'prov-np1', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-08-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-03', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80003', last_name: 'Thompson', assigned_provider_id: 'prov-chen', service_line: 'HCI Office', facility_id: null, payer_name: 'UHC Medicare Advantage', medicare_status: 'Active', is_active: true, created_at: '2025-09-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-04', tenant_id: TENANT_ID, ecw_patient_id: 'ECW10004', last_name: 'Martinez', assigned_provider_id: 'prov-np2', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-09-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-05', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80005', last_name: 'Anderson', assigned_provider_id: 'prov-np1', service_line: 'HCI Office', facility_id: null, payer_name: 'Aetna Medicare', medicare_status: 'Active', is_active: true, created_at: '2025-10-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-06', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80006', last_name: 'Taylor', assigned_provider_id: 'prov-chen', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-10-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-07', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80007', last_name: 'Thomas', assigned_provider_id: 'prov-np2', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-11-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-08', tenant_id: TENANT_ID, ecw_patient_id: 'ECW10008', last_name: 'Jackson', assigned_provider_id: 'prov-np1', service_line: 'HCI Office', facility_id: null, payer_name: 'UHC Medicare Advantage', medicare_status: 'Active', is_active: true, created_at: '2025-11-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Mobile Docs patients (9)
  { id: 'ccm-p-09', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80009', last_name: 'White', assigned_provider_id: 'prov-chen', service_line: 'Mobile Docs', facility_id: 'fac-01', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-08-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-10', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80010', last_name: 'Harris', assigned_provider_id: 'prov-np2', service_line: 'Mobile Docs', facility_id: 'fac-02', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-08-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-11', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80011', last_name: 'Clark', assigned_provider_id: 'prov-np1', service_line: 'Mobile Docs', facility_id: 'fac-03', payer_name: 'Aetna Medicare', medicare_status: 'Active', is_active: true, created_at: '2025-09-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-12', tenant_id: TENANT_ID, ecw_patient_id: 'ECW10012', last_name: 'Lewis', assigned_provider_id: 'prov-chen', service_line: 'Mobile Docs', facility_id: 'fac-04', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-09-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-13', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80013', last_name: 'Robinson', assigned_provider_id: 'prov-np2', service_line: 'Mobile Docs', facility_id: 'fac-05', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-10-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-14', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80014', last_name: 'Walker', assigned_provider_id: 'prov-np1', service_line: 'Mobile Docs', facility_id: 'fac-06', payer_name: 'UHC Medicare Advantage', medicare_status: 'Active', is_active: true, created_at: '2025-10-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-15', tenant_id: TENANT_ID, ecw_patient_id: 'ECW10015', last_name: 'Young', assigned_provider_id: 'prov-chen', service_line: 'Mobile Docs', facility_id: 'fac-07', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-11-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-16', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80016', last_name: 'Allen', assigned_provider_id: 'prov-np2', service_line: 'Mobile Docs', facility_id: 'fac-08', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2025-11-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-p-17', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80017', last_name: 'King', assigned_provider_id: 'prov-np1', service_line: 'Mobile Docs', facility_id: 'fac-02', payer_name: 'Aetna Medicare', medicare_status: 'Active', is_active: true, created_at: '2025-12-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Inactive patient
  { id: 'ccm-p-18', tenant_id: TENANT_ID, ecw_patient_id: 'ECW80018', last_name: 'Wright', assigned_provider_id: 'prov-chen', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: false, created_at: '2025-08-01T10:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
];

// ─── Enrollment Records (mutable for session persistence) ────────

let mockCcmEnrollments: CcmEnrollment[] = [
  // Enrolled — CCM Only (3)
  { id: 'ccm-e-01', patient_id: 'ccm-p-01', enrollment_status: 'Enrolled', program_type: 'CCM Only', enrollment_date: '2025-09-01', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-08-28', notes: null, updated_by: 'admin-1', created_at: '2025-09-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-02', patient_id: 'ccm-p-02', enrollment_status: 'Enrolled', program_type: 'CCM Only', enrollment_date: '2025-10-01', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-09-25', notes: null, updated_by: 'admin-1', created_at: '2025-10-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-09', patient_id: 'ccm-p-09', enrollment_status: 'Enrolled', program_type: 'CCM Only', enrollment_date: '2025-10-15', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-10-10', notes: 'Mobile Docs — facility visit schedule coordinated', updated_by: 'admin-1', created_at: '2025-10-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Enrolled — RPM Only (2)
  { id: 'ccm-e-03', patient_id: 'ccm-p-03', enrollment_status: 'Enrolled', program_type: 'RPM Only', enrollment_date: '2025-11-01', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-10-28', notes: 'Hypertension monitoring', updated_by: 'admin-1', created_at: '2025-11-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-10', patient_id: 'ccm-p-10', enrollment_status: 'Enrolled', program_type: 'RPM Only', enrollment_date: '2025-11-15', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-11-10', notes: 'COPD — pulse ox monitoring', updated_by: 'admin-1', created_at: '2025-11-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Enrolled — CCM + RPM (3)
  { id: 'ccm-e-04', patient_id: 'ccm-p-04', enrollment_status: 'Enrolled', program_type: 'CCM + RPM', enrollment_date: '2025-10-01', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-09-28', notes: 'DM + HTN dual management', updated_by: 'admin-1', created_at: '2025-10-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-12', patient_id: 'ccm-p-12', enrollment_status: 'Enrolled', program_type: 'CCM + RPM', enrollment_date: '2025-12-01', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2025-11-25', notes: 'CHF management with daily weight monitoring', updated_by: 'admin-1', created_at: '2025-12-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-15', patient_id: 'ccm-p-15', enrollment_status: 'Enrolled', program_type: 'CCM + RPM', enrollment_date: '2026-01-15', disenrollment_date: null, disenrollment_reason: null, consent_obtained: true, consent_date: '2026-01-10', notes: 'Diabetes management with glucose monitoring', updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Eligible (5)
  { id: 'ccm-e-05', patient_id: 'ccm-p-05', enrollment_status: 'Eligible', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: null, updated_by: 'admin-1', created_at: '2025-10-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-08', patient_id: 'ccm-p-08', enrollment_status: 'Eligible', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: null, updated_by: 'admin-1', created_at: '2025-11-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-11', patient_id: 'ccm-p-11', enrollment_status: 'Eligible', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: null, updated_by: 'admin-1', created_at: '2025-09-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-13', patient_id: 'ccm-p-13', enrollment_status: 'Eligible', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: null, updated_by: 'admin-1', created_at: '2025-10-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'ccm-e-17', patient_id: 'ccm-p-17', enrollment_status: 'Eligible', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: null, updated_by: 'admin-1', created_at: '2025-12-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Declined (2)
  { id: 'ccm-e-06', patient_id: 'ccm-p-06', enrollment_status: 'Declined', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: 'Patient prefers managing conditions independently', updated_by: 'admin-1', created_at: '2025-10-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: 'ccm-e-14', patient_id: 'ccm-p-14', enrollment_status: 'Declined', program_type: null, enrollment_date: null, disenrollment_date: null, disenrollment_reason: null, consent_obtained: false, consent_date: null, notes: 'Family declined on behalf of patient — revisit in 3 months', updated_by: 'admin-1', created_at: '2025-10-15T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },

  // Disenrolled (2)
  { id: 'ccm-e-07', patient_id: 'ccm-p-07', enrollment_status: 'Disenrolled', program_type: 'CCM Only', enrollment_date: '2025-09-01', disenrollment_date: '2026-01-15', disenrollment_reason: 'Patient withdrew consent', consent_obtained: true, consent_date: '2025-08-28', notes: 'Patient felt the monthly check-ins were unnecessary', updated_by: 'admin-1', created_at: '2025-09-01T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: 'ccm-e-16', patient_id: 'ccm-p-16', enrollment_status: 'Disenrolled', program_type: 'RPM Only', enrollment_date: '2025-10-01', disenrollment_date: '2026-02-01', disenrollment_reason: 'Insurance coverage changed', consent_obtained: true, consent_date: '2025-09-28', notes: 'Insurance no longer covers RPM services', updated_by: 'admin-1', created_at: '2025-10-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },

  // Inactive (matching inactive patient)
  { id: 'ccm-e-18', patient_id: 'ccm-p-18', enrollment_status: 'Inactive', program_type: 'CCM Only', enrollment_date: '2025-08-15', disenrollment_date: '2026-02-15', disenrollment_reason: 'Deceased', consent_obtained: true, consent_date: '2025-08-10', notes: 'Patient passed away 2026-02-15', updated_by: 'admin-1', created_at: '2025-08-15T10:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
];

// ─── Devices (mutable for session persistence) ───────────────────
// Only for patients with RPM: ccm-p-03 (RPM Only), ccm-p-10 (RPM Only),
// ccm-p-04 (CCM+RPM), ccm-p-12 (CCM+RPM), ccm-p-15 (CCM+RPM)

let mockCcmDevices: CcmDevice[] = [
  // ccm-p-03 — RPM Only (Thompson) — BP Monitor
  { id: 'ccm-d-01', enrollment_id: 'ccm-e-03', device_type: 'Blood Pressure Monitor', device_status: 'Active', assigned_date: '2025-11-05', removed_date: null, notes: 'Omron Platinum BP monitor', created_at: '2025-11-05T10:00:00Z', updated_at: '2025-11-05T10:00:00Z' },
  // ccm-p-10 — RPM Only (Harris) — Pulse Oximeter
  { id: 'ccm-d-02', enrollment_id: 'ccm-e-10', device_type: 'Pulse Oximeter', device_status: 'Active', assigned_date: '2025-11-20', removed_date: null, notes: 'COPD monitoring', created_at: '2025-11-20T10:00:00Z', updated_at: '2025-11-20T10:00:00Z' },
  // ccm-p-04 — CCM+RPM (Martinez) — BP Monitor + Glucose Monitor
  { id: 'ccm-d-03', enrollment_id: 'ccm-e-04', device_type: 'Blood Pressure Monitor', device_status: 'Active', assigned_date: '2025-10-10', removed_date: null, notes: null, created_at: '2025-10-10T10:00:00Z', updated_at: '2025-10-10T10:00:00Z' },
  { id: 'ccm-d-04', enrollment_id: 'ccm-e-04', device_type: 'Glucose Monitor', device_status: 'Active', assigned_date: '2025-10-10', removed_date: null, notes: 'Continuous glucose monitor', created_at: '2025-10-10T10:00:00Z', updated_at: '2025-10-10T10:00:00Z' },
  // ccm-p-12 — CCM+RPM (Lewis) — Weight Scale + Pulse Oximeter
  { id: 'ccm-d-05', enrollment_id: 'ccm-e-12', device_type: 'Weight Scale', device_status: 'Active', assigned_date: '2025-12-10', removed_date: null, notes: 'CHF daily weight monitoring', created_at: '2025-12-10T10:00:00Z', updated_at: '2025-12-10T10:00:00Z' },
  { id: 'ccm-d-06', enrollment_id: 'ccm-e-12', device_type: 'Pulse Oximeter', device_status: 'Active', assigned_date: '2025-12-10', removed_date: null, notes: null, created_at: '2025-12-10T10:00:00Z', updated_at: '2025-12-10T10:00:00Z' },
  // ccm-p-15 — CCM+RPM (Young) — BP Monitor + Thermometer
  { id: 'ccm-d-07', enrollment_id: 'ccm-e-15', device_type: 'Blood Pressure Monitor', device_status: 'Active', assigned_date: '2026-01-20', removed_date: null, notes: null, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-20T10:00:00Z' },
  // Returned device (previously assigned to ccm-p-16 before disenrollment)
  { id: 'ccm-d-08', enrollment_id: 'ccm-e-16', device_type: 'Thermometer', device_status: 'Returned', assigned_date: '2025-10-05', removed_date: '2026-02-01', notes: 'Returned upon disenrollment', created_at: '2025-10-05T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
];

// ─── Reimbursement Records (mutable for session persistence) ─────

let mockCcmReimbursements: CcmReimbursement[] = [
  // ccm-e-01 (Williams, CCM Only) — 99490 monthly
  { id: 'ccm-r-01', enrollment_id: 'ccm-e-01', service_month: '2025-10-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2025-11-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2025-11-05T10:00:00Z' },
  { id: 'ccm-r-02', enrollment_id: 'ccm-e-01', service_month: '2025-11-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2025-12-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2025-12-05T10:00:00Z' },
  { id: 'ccm-r-03', enrollment_id: 'ccm-e-01', service_month: '2025-12-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-01-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-01-05T10:00:00Z' },
  { id: 'ccm-r-04', enrollment_id: 'ccm-e-01', service_month: '2026-01-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-05', enrollment_id: 'ccm-e-01', service_month: '2026-02-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-02 (Garcia, CCM Only) — 99490 + 99439 (complex, additional 20 min)
  { id: 'ccm-r-06', enrollment_id: 'ccm-e-02', service_month: '2025-11-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2025-12-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2025-12-05T10:00:00Z' },
  { id: 'ccm-r-07', enrollment_id: 'ccm-e-02', service_month: '2025-12-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-01-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-01-05T10:00:00Z' },
  { id: 'ccm-r-08', enrollment_id: 'ccm-e-02', service_month: '2026-01-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-09', enrollment_id: 'ccm-e-02', service_month: '2026-01-01', cpt_code: '99439', billed_amount: 50, paid_amount: 47, adjustment_amount: 3, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-10', enrollment_id: 'ccm-e-02', service_month: '2026-02-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-03 (Thompson, RPM Only) — 99454 + 99457
  { id: 'ccm-r-11', enrollment_id: 'ccm-e-03', service_month: '2025-12-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-01-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-01-05T10:00:00Z' },
  { id: 'ccm-r-12', enrollment_id: 'ccm-e-03', service_month: '2025-12-01', cpt_code: '99457', billed_amount: 54, paid_amount: 51, adjustment_amount: 3, denial_reason: null, date_entered: '2026-01-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-01-05T10:00:00Z' },
  { id: 'ccm-r-13', enrollment_id: 'ccm-e-03', service_month: '2026-01-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-14', enrollment_id: 'ccm-e-03', service_month: '2026-01-01', cpt_code: '99457', billed_amount: 54, paid_amount: 51, adjustment_amount: 3, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-15', enrollment_id: 'ccm-e-03', service_month: '2026-02-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-04 (Martinez, CCM+RPM) — 99490 + 99454 + 99457
  { id: 'ccm-r-16', enrollment_id: 'ccm-e-04', service_month: '2025-11-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2025-12-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2025-12-05T10:00:00Z' },
  { id: 'ccm-r-17', enrollment_id: 'ccm-e-04', service_month: '2025-12-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-01-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-01-05T10:00:00Z' },
  { id: 'ccm-r-18', enrollment_id: 'ccm-e-04', service_month: '2026-01-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-19', enrollment_id: 'ccm-e-04', service_month: '2026-01-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-20', enrollment_id: 'ccm-e-04', service_month: '2026-02-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },
  { id: 'ccm-r-21', enrollment_id: 'ccm-e-04', service_month: '2026-02-01', cpt_code: '99457', billed_amount: 54, paid_amount: 51, adjustment_amount: 3, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-09 (White, CCM Only — Mobile Docs)
  { id: 'ccm-r-22', enrollment_id: 'ccm-e-09', service_month: '2026-01-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-23', enrollment_id: 'ccm-e-09', service_month: '2026-02-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-10 (Harris, RPM Only — Mobile Docs) — denied claim
  { id: 'ccm-r-24', enrollment_id: 'ccm-e-10', service_month: '2026-01-01', cpt_code: '99454', billed_amount: 58, paid_amount: 0, adjustment_amount: null, denial_reason: 'Insufficient documentation of daily readings', date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: 'Appealing denial', created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-25', enrollment_id: 'ccm-e-10', service_month: '2026-02-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },
  { id: 'ccm-r-26', enrollment_id: 'ccm-e-10', service_month: '2026-02-01', cpt_code: '99457', billed_amount: 54, paid_amount: 51, adjustment_amount: 3, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-12 (Lewis, CCM+RPM — Mobile Docs) — denied claim
  { id: 'ccm-r-27', enrollment_id: 'ccm-e-12', service_month: '2026-01-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-28', enrollment_id: 'ccm-e-12', service_month: '2026-01-01', cpt_code: '99454', billed_amount: 58, paid_amount: 0, adjustment_amount: null, denial_reason: 'Device data not transmitted for minimum 16 days', date_entered: '2026-02-05T10:00:00Z', entered_by: 'admin-1', notes: 'Patient had connectivity issues — resolved', created_at: '2026-02-05T10:00:00Z' },
  { id: 'ccm-r-29', enrollment_id: 'ccm-e-12', service_month: '2026-02-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },
  { id: 'ccm-r-30', enrollment_id: 'ccm-e-12', service_month: '2026-02-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },

  // ccm-e-15 (Young, CCM+RPM — Mobile Docs)
  { id: 'ccm-r-31', enrollment_id: 'ccm-e-15', service_month: '2026-02-01', cpt_code: '99490', billed_amount: 68, paid_amount: 64, adjustment_amount: 4, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },
  { id: 'ccm-r-32', enrollment_id: 'ccm-e-15', service_month: '2026-02-01', cpt_code: '99454', billed_amount: 58, paid_amount: 55, adjustment_amount: 3, denial_reason: null, date_entered: '2026-03-05T10:00:00Z', entered_by: 'admin-1', notes: null, created_at: '2026-03-05T10:00:00Z' },
];

// ─── Upload Records ──────────────────────────────────────────────

let mockCcmUploads: CcmUpload[] = [
  {
    id: 'ccm-upload-1',
    tenant_id: TENANT_ID,
    uploaded_by: 'admin-1',
    upload_date: '2026-01-15T14:30:00Z',
    file_name: 'ccm_eligible_patients_jan2026.csv',
    row_count: 35,
    new_patients: 14,
    updated_patients: 20,
    flagged_patients: 1,
    status: 'Completed',
    validation_errors: null,
    created_at: '2026-01-15T14:30:00Z',
  },
  {
    id: 'ccm-upload-2',
    tenant_id: TENANT_ID,
    uploaded_by: 'admin-1',
    upload_date: '2025-10-01T09:00:00Z',
    file_name: 'ccm_eligible_patients_oct2025.csv',
    row_count: 28,
    new_patients: 28,
    updated_patients: 0,
    flagged_patients: 0,
    status: 'Completed',
    validation_errors: null,
    created_at: '2025-10-01T09:00:00Z',
  },
];

// ─── ID Counters ─────────────────────────────────────────────────

let nextPatientNum = 19;
let nextEnrollmentNum = 19;
let nextDeviceNum = 9;
let nextReimbursementNum = 33;
let nextUploadNum = 3;

// ─── Getters ─────────────────────────────────────────────────────

export function getMockCcmPatients(): CcmPatientWithEnrollment[] {
  return mockCcmPatients
    .filter(p => p.is_active)
    .map(patient => {
      const enrollment = mockCcmEnrollments.find(e => e.patient_id === patient.id);
      if (!enrollment) return null;

      const provider = PROVIDERS.find(p => p.id === patient.assigned_provider_id);
      const facility = FACILITIES.find(f => f.id === patient.facility_id);
      const activeDeviceCount = mockCcmDevices.filter(
        d => d.enrollment_id === enrollment.id && d.device_status === 'Active'
      ).length;

      const patientReimbursements = mockCcmReimbursements
        .filter(r => r.enrollment_id === enrollment.id)
        .sort((a, b) => b.service_month.localeCompare(a.service_month));
      const lastReimbursementMonth = patientReimbursements.length > 0
        ? patientReimbursements[0].service_month
        : null;

      return {
        ...patient,
        enrollment,
        provider_name: provider?.name ?? null,
        facility_name: facility?.name ?? null,
        active_device_count: activeDeviceCount,
        last_reimbursement_month: lastReimbursementMonth,
      } satisfies CcmPatientWithEnrollment;
    })
    .filter((p): p is CcmPatientWithEnrollment => p !== null);
}

export function getMockCcmPatient(id: string): CcmPatientWithEnrollment | null {
  const patient = mockCcmPatients.find(p => p.id === id);
  if (!patient) return null;

  const enrollment = mockCcmEnrollments.find(e => e.patient_id === id);
  if (!enrollment) return null;

  const provider = PROVIDERS.find(p => p.id === patient.assigned_provider_id);
  const facility = FACILITIES.find(f => f.id === patient.facility_id);
  const activeDeviceCount = mockCcmDevices.filter(
    d => d.enrollment_id === enrollment.id && d.device_status === 'Active'
  ).length;

  const patientReimbursements = mockCcmReimbursements
    .filter(r => r.enrollment_id === enrollment.id)
    .sort((a, b) => b.service_month.localeCompare(a.service_month));
  const lastReimbursementMonth = patientReimbursements.length > 0
    ? patientReimbursements[0].service_month
    : null;

  return {
    ...patient,
    enrollment,
    provider_name: provider?.name ?? null,
    facility_name: facility?.name ?? null,
    active_device_count: activeDeviceCount,
    last_reimbursement_month: lastReimbursementMonth,
  };
}

export function getMockCcmKpiSummary(): CcmKpiSummary {
  const activePatients = getMockCcmPatients();
  const eligible = activePatients.filter(
    p => p.enrollment.enrollment_status === 'Eligible' || p.enrollment.enrollment_status === 'Enrolled'
  );
  const enrolled = activePatients.filter(p => p.enrollment.enrollment_status === 'Enrolled');
  const declined = activePatients.filter(p => p.enrollment.enrollment_status === 'Declined');
  const ccmOnly = enrolled.filter(p => p.enrollment.program_type === 'CCM Only');
  const rpmOnly = enrolled.filter(p => p.enrollment.program_type === 'RPM Only');
  const dual = enrolled.filter(p => p.enrollment.program_type === 'CCM + RPM');

  const activeDevices = mockCcmDevices.filter(d => d.device_status === 'Active').length;
  const enrollmentIdsWithDevices = new Set(
    mockCcmDevices.filter(d => d.device_status === 'Active').map(d => d.enrollment_id)
  );
  const patientsWithDevices = enrolled.filter(
    p => enrollmentIdsWithDevices.has(p.enrollment.id)
  ).length;

  const consentMissing = enrolled.filter(p => !p.enrollment.consent_obtained).length;

  // Revenue: most recent month with reimbursement data
  const allMonths = [...new Set(mockCcmReimbursements.map(r => r.service_month))].sort();
  const latestMonth = allMonths.length > 0 ? allMonths[allMonths.length - 1] : null;
  const monthlyActual = latestMonth
    ? mockCcmReimbursements
        .filter(r => r.service_month === latestMonth)
        .reduce((sum, r) => sum + r.paid_amount, 0)
    : 0;

  // Expected: sum of enrolled patients' applicable CPT rates
  let monthlyExpected = 0;
  for (const p of enrolled) {
    const programType = p.enrollment.program_type;
    if (!programType) continue;
    if (programType === 'CCM Only') {
      monthlyExpected += CPT_REIMBURSEMENT_RATES['99490'].amount;
    } else if (programType === 'RPM Only') {
      monthlyExpected += CPT_REIMBURSEMENT_RATES['99454'].amount + CPT_REIMBURSEMENT_RATES['99457'].amount;
    } else {
      // CCM + RPM
      monthlyExpected += CPT_REIMBURSEMENT_RATES['99490'].amount
        + CPT_REIMBURSEMENT_RATES['99454'].amount
        + CPT_REIMBURSEMENT_RATES['99457'].amount;
    }
  }

  const collectionRate = monthlyExpected > 0
    ? Math.round((monthlyActual / monthlyExpected) * 100)
    : 0;

  return {
    totalEligible: eligible.length,
    enrolledCount: enrolled.length,
    enrollmentRate: eligible.length > 0 ? Math.round((enrolled.length / eligible.length) * 100) : 0,
    ccmOnlyCount: ccmOnly.length,
    rpmOnlyCount: rpmOnly.length,
    dualCount: dual.length,
    declinedCount: declined.length,
    activeDevices,
    patientsWithDevices,
    monthlyRevenueActual: monthlyActual,
    monthlyRevenueExpected: monthlyExpected,
    collectionRate,
    consentMissing,
  };
}

// ─── Patient Mutations ───────────────────────────────────────────

export function addMockCcmPatient(data: {
  ecw_patient_id: string;
  last_name: string;
  medicare_status: CcmPatient['medicare_status'];
  payer_name?: string;
  service_line: CcmServiceLine;
  facility_id?: string;
  assigned_provider_id: string;
  enrollment_status?: CcmEnrollmentStatus;
  program_type?: CcmProgramType;
  enrollment_date?: string;
  consent_obtained?: boolean;
  consent_date?: string;
  notes?: string;
}): CcmPatientWithEnrollment {
  const now = new Date().toISOString();
  const patientId = `ccm-p-${String(nextPatientNum++).padStart(2, '0')}`;

  const newPatient: CcmPatient = {
    id: patientId,
    tenant_id: TENANT_ID,
    ecw_patient_id: data.ecw_patient_id,
    last_name: data.last_name,
    assigned_provider_id: data.assigned_provider_id,
    service_line: data.service_line,
    facility_id: data.facility_id ?? null,
    payer_name: data.payer_name ?? null,
    medicare_status: data.medicare_status,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  mockCcmPatients.push(newPatient);

  const enrollmentId = `ccm-e-${String(nextEnrollmentNum++).padStart(2, '0')}`;
  const enrollmentStatus = data.enrollment_status ?? 'Eligible';
  const newEnrollment: CcmEnrollment = {
    id: enrollmentId,
    patient_id: patientId,
    enrollment_status: enrollmentStatus,
    program_type: data.program_type ?? null,
    enrollment_date: data.enrollment_date ?? null,
    disenrollment_date: null,
    disenrollment_reason: null,
    consent_obtained: data.consent_obtained ?? false,
    consent_date: data.consent_date ?? null,
    notes: data.notes ?? null,
    updated_by: 'admin-1',
    created_at: now,
    updated_at: now,
  };
  mockCcmEnrollments.push(newEnrollment);

  const provider = PROVIDERS.find(p => p.id === newPatient.assigned_provider_id);
  const facility = FACILITIES.find(f => f.id === newPatient.facility_id);

  return {
    ...newPatient,
    enrollment: newEnrollment,
    provider_name: provider?.name ?? null,
    facility_name: facility?.name ?? null,
    active_device_count: 0,
    last_reimbursement_month: null,
  };
}

// ─── Enrollment Mutations ────────────────────────────────────────

export function updateMockEnrollment(enrollmentId: string, updates: Partial<CcmEnrollment>): CcmEnrollment | null {
  const idx = mockCcmEnrollments.findIndex(e => e.id === enrollmentId);
  if (idx === -1) return null;

  mockCcmEnrollments[idx] = {
    ...mockCcmEnrollments[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mockCcmEnrollments[idx];
}

// ─── Device Functions ────────────────────────────────────────────

export function getMockDevices(enrollmentId: string): CcmDevice[] {
  return mockCcmDevices.filter(d => d.enrollment_id === enrollmentId);
}

export function addMockDevice(data: {
  enrollment_id: string;
  device_type: CcmDeviceType;
  assigned_date: string;
  notes?: string;
}): CcmDevice {
  const now = new Date().toISOString();
  const id = `ccm-d-${String(nextDeviceNum++).padStart(2, '0')}`;

  const newDevice: CcmDevice = {
    id,
    enrollment_id: data.enrollment_id,
    device_type: data.device_type,
    device_status: 'Active',
    assigned_date: data.assigned_date,
    removed_date: null,
    notes: data.notes ?? null,
    created_at: now,
    updated_at: now,
  };
  mockCcmDevices.push(newDevice);
  return newDevice;
}

export function updateMockDeviceStatus(deviceId: string, status: CcmDeviceStatus): CcmDevice | null {
  const idx = mockCcmDevices.findIndex(d => d.id === deviceId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  mockCcmDevices[idx] = {
    ...mockCcmDevices[idx],
    device_status: status,
    removed_date: status !== 'Active' ? now.split('T')[0] : null,
    updated_at: now,
  };
  return mockCcmDevices[idx];
}

export function getMockDeviceSummary(): CcmDeviceSummary {
  const activeDevices = mockCcmDevices.filter(d => d.device_status === 'Active');
  const nonActive = mockCcmDevices.filter(d => d.device_status !== 'Active');

  const byType: Record<CcmDeviceType, number> = {
    'Blood Pressure Monitor': 0,
    'Pulse Oximeter': 0,
    'Glucose Monitor': 0,
    'Weight Scale': 0,
    'Thermometer': 0,
    'Other': 0,
  };
  for (const d of activeDevices) {
    byType[d.device_type]++;
  }

  // Coverage rate = RPM patients with active devices / total RPM-enrolled patients
  const rpmEnrollments = mockCcmEnrollments.filter(
    e => (e.program_type === 'RPM Only' || e.program_type === 'CCM + RPM') && e.enrollment_status === 'Enrolled'
  );
  const rpmWithDevices = rpmEnrollments.filter(
    e => activeDevices.some(d => d.enrollment_id === e.id)
  );
  const coverageRate = rpmEnrollments.length > 0
    ? Math.round((rpmWithDevices.length / rpmEnrollments.length) * 100)
    : 0;

  return {
    totalActive: activeDevices.length,
    byType,
    coverageRate,
    nonActiveCount: nonActive.length,
  };
}

// ─── Reimbursement Functions ─────────────────────────────────────

export function getMockReimbursements(enrollmentId: string): CcmReimbursement[] {
  return mockCcmReimbursements
    .filter(r => r.enrollment_id === enrollmentId)
    .sort((a, b) => b.service_month.localeCompare(a.service_month));
}

export function addMockReimbursement(data: {
  enrollment_id: string;
  service_month: string;
  cpt_code: CcmCptCode;
  billed_amount?: number;
  paid_amount: number;
  adjustment_amount?: number;
  denial_reason?: string;
  notes?: string;
}): CcmReimbursement {
  const now = new Date().toISOString();
  const id = `ccm-r-${String(nextReimbursementNum++).padStart(2, '0')}`;

  const rate = CPT_REIMBURSEMENT_RATES[data.cpt_code];
  const billedAmount = data.billed_amount ?? (rate ? rate.amount + 3 : data.paid_amount);

  const newReimbursement: CcmReimbursement = {
    id,
    enrollment_id: data.enrollment_id,
    service_month: data.service_month,
    cpt_code: data.cpt_code,
    billed_amount: billedAmount,
    paid_amount: data.paid_amount,
    adjustment_amount: data.adjustment_amount ?? null,
    denial_reason: data.denial_reason ?? null,
    date_entered: now,
    entered_by: 'admin-1',
    notes: data.notes ?? null,
    created_at: now,
  };
  mockCcmReimbursements.push(newReimbursement);
  return newReimbursement;
}

export function addMockBatchReimbursements(entries: Array<{
  enrollment_id: string;
  service_month: string;
  cpt_code: CcmCptCode;
  paid_amount: number;
  billed_amount?: number;
}>): CcmReimbursement[] {
  return entries.map(entry => addMockReimbursement(entry));
}

export function getMockBatchReimbursementPatients(serviceMonth: string): CcmPatientWithEnrollment[] {
  return getMockCcmPatients().filter(p => p.enrollment.enrollment_status === 'Enrolled');
}

// ─── Revenue Aggregation ─────────────────────────────────────────

export function getMockCcmRevenueMetrics(): CcmRevenueMetrics {
  const activePatients = getMockCcmPatients();
  const enrolled = activePatients.filter(p => p.enrollment.enrollment_status === 'Enrolled');

  // Monthly expected: sum of enrolled patients' applicable CPT base rates
  let monthlyExpected = 0;
  for (const p of enrolled) {
    const programType = p.enrollment.program_type;
    if (!programType) continue;
    if (programType === 'CCM Only') {
      monthlyExpected += CPT_REIMBURSEMENT_RATES['99490'].amount;
    } else if (programType === 'RPM Only') {
      monthlyExpected += CPT_REIMBURSEMENT_RATES['99454'].amount + CPT_REIMBURSEMENT_RATES['99457'].amount;
    } else {
      monthlyExpected += CPT_REIMBURSEMENT_RATES['99490'].amount
        + CPT_REIMBURSEMENT_RATES['99454'].amount
        + CPT_REIMBURSEMENT_RATES['99457'].amount;
    }
  }

  // Monthly actual: most recent month with reimbursement data
  const allMonths = [...new Set(mockCcmReimbursements.map(r => r.service_month))].sort();
  const latestMonth = allMonths.length > 0 ? allMonths[allMonths.length - 1] : null;
  const monthlyActual = latestMonth
    ? mockCcmReimbursements
        .filter(r => r.service_month === latestMonth)
        .reduce((sum, r) => sum + r.paid_amount, 0)
    : 0;

  const collectionRate = monthlyExpected > 0
    ? Math.round((monthlyActual / monthlyExpected) * 100)
    : 0;
  const revenuLeakage = monthlyExpected - monthlyActual;

  // YTD revenue (2026)
  const ytdRevenue = mockCcmReimbursements
    .filter(r => r.service_month >= '2026-01-01')
    .reduce((sum, r) => sum + r.paid_amount, 0);

  // CCM vs RPM split
  let ccmRevenue = 0;
  let rpmRevenue = 0;
  for (const r of mockCcmReimbursements) {
    const cptInfo = CPT_REIMBURSEMENT_RATES[r.cpt_code];
    if (cptInfo.programType === 'CCM') {
      ccmRevenue += r.paid_amount;
    } else {
      rpmRevenue += r.paid_amount;
    }
  }

  // Revenue per enrolled patient
  const revenuePerEnrolled = enrolled.length > 0
    ? Math.round(monthlyActual / enrolled.length)
    : 0;

  // Provider breakdown
  const providerMap = new Map<string, CcmProviderMetrics>();
  for (const prov of PROVIDERS) {
    providerMap.set(prov.id, {
      providerId: prov.id,
      providerName: prov.name,
      assignedPatients: 0,
      enrolledCount: 0,
      enrollmentRate: 0,
      ccmOnlyCount: 0,
      dualCount: 0,
      rpmOnlyCount: 0,
      monthlyRevenue: 0,
      revenuePerEnrolled: 0,
      declinedCount: 0,
    });
  }

  for (const p of activePatients) {
    const provId = p.assigned_provider_id;
    if (!provId || !providerMap.has(provId)) continue;
    const entry = providerMap.get(provId)!;
    entry.assignedPatients++;

    if (p.enrollment.enrollment_status === 'Enrolled') {
      entry.enrolledCount++;
      if (p.enrollment.program_type === 'CCM Only') entry.ccmOnlyCount++;
      if (p.enrollment.program_type === 'RPM Only') entry.rpmOnlyCount++;
      if (p.enrollment.program_type === 'CCM + RPM') entry.dualCount++;
    }
    if (p.enrollment.enrollment_status === 'Declined') {
      entry.declinedCount++;
    }
  }

  // Add revenue per provider from latest month
  if (latestMonth) {
    for (const r of mockCcmReimbursements.filter(x => x.service_month === latestMonth)) {
      const enrollment = mockCcmEnrollments.find(e => e.id === r.enrollment_id);
      if (!enrollment) continue;
      const patient = mockCcmPatients.find(p => p.id === enrollment.patient_id);
      if (!patient) continue;
      const provId = patient.assigned_provider_id;
      if (!provId || !providerMap.has(provId)) continue;
      providerMap.get(provId)!.monthlyRevenue += r.paid_amount;
    }
  }

  // Finalize provider metrics
  const providerBreakdown = Array.from(providerMap.values()).map(entry => ({
    ...entry,
    enrollmentRate: entry.assignedPatients > 0
      ? Math.round((entry.enrolledCount / entry.assignedPatients) * 100)
      : 0,
    revenuePerEnrolled: entry.enrolledCount > 0
      ? Math.round(entry.monthlyRevenue / entry.enrolledCount)
      : 0,
  }));

  return {
    monthlyActual,
    monthlyExpected,
    collectionRate,
    revenuLeakage: revenuLeakage,
    revenuePerEnrolled,
    ytdRevenue,
    ccmRevenue,
    rpmRevenue,
    providerBreakdown,
  };
}

export function getMockCcmMonthlyRevenue(): CcmMonthlyRevenuePoint[] {
  const MONTH_LABELS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const MONTH_KEYS = ['2025-10-01', '2025-11-01', '2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01'];

  const points: CcmMonthlyRevenuePoint[] = MONTH_KEYS.map((monthKey, i) => {
    const monthReimbursements = mockCcmReimbursements.filter(r => r.service_month === monthKey);

    let ccmRev = 0;
    let rpmRev = 0;
    for (const r of monthReimbursements) {
      const cptInfo = CPT_REIMBURSEMENT_RATES[r.cpt_code];
      if (cptInfo.programType === 'CCM') {
        ccmRev += r.paid_amount;
      } else {
        rpmRev += r.paid_amount;
      }
    }

    // Expected revenue: count enrolled patients as of this month based on enrollment_date
    let expectedRevenue = 0;
    for (const e of mockCcmEnrollments) {
      if (e.enrollment_status !== 'Enrolled' && e.enrollment_status !== 'Disenrolled' && e.enrollment_status !== 'Inactive') continue;
      if (!e.enrollment_date || e.enrollment_date > monthKey) continue;
      if (e.disenrollment_date && e.disenrollment_date <= monthKey) continue;

      if (e.program_type === 'CCM Only') {
        expectedRevenue += CPT_REIMBURSEMENT_RATES['99490'].amount;
      } else if (e.program_type === 'RPM Only') {
        expectedRevenue += CPT_REIMBURSEMENT_RATES['99454'].amount + CPT_REIMBURSEMENT_RATES['99457'].amount;
      } else if (e.program_type === 'CCM + RPM') {
        expectedRevenue += CPT_REIMBURSEMENT_RATES['99490'].amount
          + CPT_REIMBURSEMENT_RATES['99454'].amount
          + CPT_REIMBURSEMENT_RATES['99457'].amount;
      }
    }

    return {
      month: monthKey,
      monthLabel: MONTH_LABELS[i],
      ccmRevenue: ccmRev,
      rpmRevenue: rpmRev,
      totalRevenue: ccmRev + rpmRev,
      expectedRevenue,
      cumulativeRevenue: 0,
    };
  });

  // Compute cumulative
  let cumulative = 0;
  for (const point of points) {
    cumulative += point.totalRevenue;
    point.cumulativeRevenue = cumulative;
  }

  return points;
}

export function getMockCcmProviderMetrics(): CcmProviderMetrics[] {
  const metrics = getMockCcmRevenueMetrics();
  return metrics.providerBreakdown;
}

export function getMockCcmProgramSplit(): CcmProgramSplit[] {
  let ccmRevenue = 0;
  let rpmRevenue = 0;
  let ccmEnrolled = 0;
  let rpmEnrolled = 0;

  const enrolled = mockCcmEnrollments.filter(e => e.enrollment_status === 'Enrolled');
  for (const e of enrolled) {
    if (e.program_type === 'CCM Only') ccmEnrolled++;
    if (e.program_type === 'RPM Only') rpmEnrolled++;
    if (e.program_type === 'CCM + RPM') {
      ccmEnrolled++;
      rpmEnrolled++;
    }
  }

  for (const r of mockCcmReimbursements) {
    const cptInfo = CPT_REIMBURSEMENT_RATES[r.cpt_code];
    if (cptInfo.programType === 'CCM') {
      ccmRevenue += r.paid_amount;
    } else {
      rpmRevenue += r.paid_amount;
    }
  }

  const totalRevenue = ccmRevenue + rpmRevenue;

  return [
    {
      program: 'CCM',
      enrolledCount: ccmEnrolled,
      revenue: ccmRevenue,
      percentage: totalRevenue > 0 ? Math.round((ccmRevenue / totalRevenue) * 100) : 0,
    },
    {
      program: 'RPM',
      enrolledCount: rpmEnrolled,
      revenue: rpmRevenue,
      percentage: totalRevenue > 0 ? Math.round((rpmRevenue / totalRevenue) * 100) : 0,
    },
  ];
}

// ─── Upload Functions ────────────────────────────────────────────

export function getMockCcmUploads(): CcmUpload[] {
  return [...mockCcmUploads].sort((a, b) => b.upload_date.localeCompare(a.upload_date));
}

export function processMockCcmUpload(rows: Array<Record<string, string>>): {
  newPatients: number;
  updatedPatients: number;
  flaggedPatients: number;
  errors: CcmValidationError[];
  upload: CcmUpload;
} {
  const now = new Date().toISOString();
  let newCount = 0;
  let updatedCount = 0;
  const errors: CcmValidationError[] = [];
  const uploadedEcwIds = new Set<string>();

  rows.forEach((row, idx) => {
    const ecwId = row['Patient Acct No'];
    if (!ecwId) {
      errors.push({ row: idx + 2, field: 'Patient Acct No', message: 'Missing Patient Acct No' });
      return;
    }

    if (uploadedEcwIds.has(ecwId)) {
      errors.push({ row: idx + 2, field: 'Patient Acct No', message: `Duplicate Patient Acct No: ${ecwId}` });
      return;
    }
    uploadedEcwIds.add(ecwId);

    const providerName = row['Rendering Provider'];
    const provider = providerName
      ? PROVIDERS.find(p => p.name.toLowerCase() === providerName.toLowerCase())
      : null;

    const facilityName = row['Facility'];
    const facility = facilityName
      ? FACILITIES.find(f => f.name.toLowerCase() === facilityName.toLowerCase())
      : null;

    const existingPatient = mockCcmPatients.find(p => p.ecw_patient_id === ecwId);

    if (existingPatient) {
      if (row['Patient Last Name']) existingPatient.last_name = row['Patient Last Name'];
      if (provider) existingPatient.assigned_provider_id = provider.id;
      if (facilityName && facility) existingPatient.facility_id = facility.id;
      if (row['Primary Payer Name']) existingPatient.payer_name = row['Primary Payer Name'];
      existingPatient.updated_at = now;
      updatedCount++;

      if (providerName && !provider) {
        errors.push({ row: idx + 2, field: 'Rendering Provider', message: `Provider not found: "${providerName}"` });
      }
      if (facilityName && !facility) {
        errors.push({ row: idx + 2, field: 'Facility', message: `Facility not found: "${facilityName}"` });
      }
    } else {
      const lastName = row['Patient Last Name'];
      if (!lastName) {
        errors.push({ row: idx + 2, field: 'Patient Last Name', message: 'Missing Patient Last Name' });
        return;
      }

      const isMobileDocs = !!facility;
      const patientId = `ccm-p-${String(nextPatientNum++).padStart(2, '0')}`;

      const newPatient: CcmPatient = {
        id: patientId,
        tenant_id: TENANT_ID,
        ecw_patient_id: ecwId,
        last_name: lastName,
        assigned_provider_id: provider?.id ?? null,
        service_line: isMobileDocs ? 'Mobile Docs' : 'HCI Office',
        facility_id: facility?.id ?? null,
        payer_name: row['Primary Payer Name'] || null,
        medicare_status: 'Active',
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      mockCcmPatients.push(newPatient);

      const enrollmentId = `ccm-e-${String(nextEnrollmentNum++).padStart(2, '0')}`;
      const newEnrollment: CcmEnrollment = {
        id: enrollmentId,
        patient_id: patientId,
        enrollment_status: 'Eligible',
        program_type: null,
        enrollment_date: null,
        disenrollment_date: null,
        disenrollment_reason: null,
        consent_obtained: false,
        consent_date: null,
        notes: null,
        updated_by: 'admin-1',
        created_at: now,
        updated_at: now,
      };
      mockCcmEnrollments.push(newEnrollment);
      newCount++;

      if (providerName && !provider) {
        errors.push({ row: idx + 2, field: 'Rendering Provider', message: `Provider not found: "${providerName}"` });
      }
    }
  });

  const flaggedCount = mockCcmPatients.filter(
    p => p.is_active && !uploadedEcwIds.has(p.ecw_patient_id)
  ).length;

  const status: CcmUpload['status'] = errors.length > 0 ? 'Completed with Warnings' : 'Completed';
  const uploadId = `ccm-upload-${nextUploadNum++}`;

  const upload: CcmUpload = {
    id: uploadId,
    tenant_id: TENANT_ID,
    uploaded_by: 'admin-1',
    upload_date: now,
    file_name: `ccm_upload_${new Date().toISOString().split('T')[0]}.csv`,
    row_count: rows.length,
    new_patients: newCount,
    updated_patients: updatedCount,
    flagged_patients: flaggedCount,
    status,
    validation_errors: errors.length > 0 ? errors : null,
    created_at: now,
  };
  mockCcmUploads.push(upload);

  return {
    newPatients: newCount,
    updatedPatients: updatedCount,
    flaggedPatients: flaggedCount,
    errors,
    upload,
  };
}

// ─── AWV Cross-Reference ─────────────────────────────────────────

export function checkAwvCrossRef(ecwPatientId: string): boolean {
  return AWV_SHARED_IDS.includes(ecwPatientId);
}

/**
 * AWV Tracker — Mock Data
 * Realistic mock data for development. Uses provider/facility names consistent
 * with Practice Health and Mobile Docs modules.
 * Mutable arrays allow session-persistent add/update operations.
 */

import type {
  AwvPatient,
  AwvTracking,
  AwvUpload,
  AwvAddon,
  AwvReimbursementRate,
  AwvPatientWithTracking,
  AwvKpiSummary,
  AwvValidationError,
  AwvRevenueMetrics,
  AwvProviderMetrics,
  AwvMonthlyRevenuePoint,
  AwvServiceLineSplit,
  AwvServiceLine,
} from '@/types/awv-tracker';
import type { AwvUploadRow } from '@/schemas/awvUploadSchema';

// ─── Providers (matching ph_providers seed data) ─────────────────

const MOCK_PROVIDERS = [
  { id: 'prov-1', name: 'Dr. Chen' },
  { id: 'prov-2', name: 'NP1' },
  { id: 'prov-3', name: 'NP2' },
];

// ─── Facilities (matching facilities_directory seed data) ────────

const MOCK_FACILITIES = [
  { id: 'fac-1', name: 'Huntington Senior Living' },
  { id: 'fac-2', name: 'Elegant Care Villa' },
  { id: 'fac-3', name: 'Pacific Gardens SNF' },
  { id: 'fac-4', name: 'Sunset Hills SNF' },
  { id: 'fac-5', name: 'Valley Board & Care' },
  { id: 'fac-6', name: 'Rose Hills Board & Care' },
  { id: 'fac-7', name: 'Golden Oaks Board & Care' },
  { id: 'fac-8', name: 'Williams Residence' },
];

// ─── Patient Registry (mutable for session persistence) ──────────

let mockPatients: AwvPatient[] = [
  // HCI Office patients
  { id: 'awv-p-01', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '84720', last_name: 'Santos', assigned_provider_id: 'prov-1', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-02', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '73891', last_name: 'Kim', assigned_provider_id: 'prov-2', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-03', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '55210', last_name: 'Garcia', assigned_provider_id: 'prov-1', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-04', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '67432', last_name: 'Thompson', assigned_provider_id: 'prov-2', service_line: 'HCI Office', facility_id: null, payer_name: 'UHC Medicare Advantage', medicare_status: 'Active', is_active: true, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-05', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '78345', last_name: 'Lee', assigned_provider_id: 'prov-1', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-06', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '82156', last_name: 'Patel', assigned_provider_id: 'prov-2', service_line: 'HCI Office', facility_id: null, payer_name: 'Aetna Medicare', medicare_status: 'Active', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-07', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '63289', last_name: 'Rodriguez', assigned_provider_id: 'prov-1', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-08', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '90871', last_name: 'Park', assigned_provider_id: 'prov-2', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Inactive', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Mobile Docs patients
  { id: 'awv-p-09', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '91034', last_name: 'Williams', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-2', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-10', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '62104', last_name: 'Nguyen', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-1', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-11', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '45890', last_name: 'Chen', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-3', payer_name: 'UHC Medicare Advantage', medicare_status: 'Active', is_active: true, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-12', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '71456', last_name: 'Martinez', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-1', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-13', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '53278', last_name: 'Reyes', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-5', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-14', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '88432', last_name: 'Tran', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-4', payer_name: 'Aetna Medicare', medicare_status: 'Active', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-15', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '39102', last_name: 'Rivera', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-8', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'awv-p-16', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '44567', last_name: 'Yamamoto', assigned_provider_id: 'prov-3', service_line: 'Mobile Docs', facility_id: 'fac-7', payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: true, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Inactive patient
  { id: 'awv-p-17', tenant_id: '00000000-0000-0000-0000-000000000000', ecw_patient_id: '29834', last_name: 'Wilson', assigned_provider_id: 'prov-1', service_line: 'HCI Office', facility_id: null, payer_name: 'Medicare Part B', medicare_status: 'Active', is_active: false, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z' },
];

// ─── Tracking Records (mutable for session persistence) ──────────

let mockTracking: AwvTracking[] = [
  // Eligible + Not Started (overdue — eligible since Jan)
  { id: 'awv-t-01', patient_id: 'awv-p-01', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-01-20', next_eligible_date: '2026-01-20', date_source: 'Manual', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Pending Review — new patient
  { id: 'awv-t-02', patient_id: 'awv-p-02', eligibility_status: 'Pending Review', eligibility_reason: null, completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: null, next_eligible_date: null, date_source: 'Upload', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Not Eligible — AWV < 12 months
  { id: 'awv-t-03', patient_id: 'awv-p-03', eligibility_status: 'Not Eligible', eligibility_reason: 'AWV completed < 12 months ago', completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2026-02-28', next_eligible_date: '2027-02-28', date_source: 'Manual', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Eligible + Scheduled
  { id: 'awv-t-04', patient_id: 'awv-p-04', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Scheduled', completion_date: null, awv_type: 'Subsequent AWV', cpt_code: 'G0439', billed_amount: null, last_awv_date: '2025-03-15', next_eligible_date: '2026-03-15', date_source: 'Manual', scheduled_date: '2026-03-20', notes: 'Patient prefers afternoon appointments', updated_by: 'admin-1', created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  // Eligible + Not Started (eligible soon)
  { id: 'awv-t-05', patient_id: 'awv-p-05', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-04-10', next_eligible_date: '2026-04-10', date_source: 'Manual', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Eligible + Completed
  { id: 'awv-t-06', patient_id: 'awv-p-06', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Completed', completion_date: '2026-02-15', awv_type: 'Subsequent AWV', cpt_code: 'G0439', billed_amount: 230, last_awv_date: '2025-01-10', next_eligible_date: '2026-01-10', date_source: 'Manual', scheduled_date: '2026-02-15', notes: 'Completed with depression screening add-on', updated_by: 'admin-1', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
  // Eligible + Refused
  { id: 'awv-t-07', patient_id: 'awv-p-07', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Refused', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-02-20', next_eligible_date: '2026-02-20', date_source: 'Manual', scheduled_date: null, notes: 'Patient declined — says they get AWV at another provider', updated_by: 'admin-1', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Not Eligible — Inactive Medicare
  { id: 'awv-t-08', patient_id: 'awv-p-08', eligibility_status: 'Not Eligible', eligibility_reason: 'Not enrolled in Medicare', completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: null, next_eligible_date: null, date_source: 'Upload', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },

  // Mobile Docs patients
  // Eligible + Not Started (overdue)
  { id: 'awv-t-09', patient_id: 'awv-p-09', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-02-15', next_eligible_date: '2026-02-15', date_source: 'Manual', scheduled_date: null, notes: 'Combine with routine home visit at Elegant Care Villa', updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Eligible + Completed
  { id: 'awv-t-10', patient_id: 'awv-p-10', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Completed', completion_date: '2026-01-10', awv_type: 'Subsequent AWV', cpt_code: 'G0439', billed_amount: 230, last_awv_date: '2024-12-15', next_eligible_date: '2025-12-15', date_source: 'Manual', scheduled_date: '2026-01-10', notes: null, updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  // Eligible + Scheduled
  { id: 'awv-t-11', patient_id: 'awv-p-11', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Scheduled', completion_date: null, awv_type: 'Subsequent AWV', cpt_code: 'G0439', billed_amount: null, last_awv_date: '2025-03-01', next_eligible_date: '2026-03-01', date_source: 'Manual', scheduled_date: '2026-03-18', notes: 'Coordinate with facility DON', updated_by: 'admin-1', created_at: '2026-01-20T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  // Eligible + Completed
  { id: 'awv-t-12', patient_id: 'awv-p-12', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Completed', completion_date: '2026-02-20', awv_type: 'Subsequent AWV', cpt_code: 'G0439', billed_amount: 230, last_awv_date: '2025-02-01', next_eligible_date: '2026-02-01', date_source: 'Manual', scheduled_date: '2026-02-20', notes: null, updated_by: 'admin-1', created_at: '2026-01-20T10:00:00Z', updated_at: '2026-02-20T10:00:00Z' },
  // Pending Review
  { id: 'awv-t-13', patient_id: 'awv-p-13', eligibility_status: 'Pending Review', eligibility_reason: null, completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: null, next_eligible_date: null, date_source: 'Upload', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Eligible + Not Started (newly eligible)
  { id: 'awv-t-14', patient_id: 'awv-p-14', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Not Started', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-03-10', next_eligible_date: '2026-03-10', date_source: 'Manual', scheduled_date: null, notes: null, updated_by: 'admin-1', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Eligible + Completed (Initial AWV)
  { id: 'awv-t-15', patient_id: 'awv-p-15', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Completed', completion_date: '2026-03-05', awv_type: 'Initial AWV', cpt_code: 'G0438', billed_amount: 270, last_awv_date: null, next_eligible_date: null, date_source: 'Manual', scheduled_date: '2026-03-05', notes: 'First AWV for this patient. ACP also completed.', updated_by: 'admin-1', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  // Eligible + Unable to Complete
  { id: 'awv-t-16', patient_id: 'awv-p-16', eligibility_status: 'Eligible', eligibility_reason: null, completion_status: 'Unable to Complete', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-04-15', next_eligible_date: '2026-04-15', date_source: 'Manual', scheduled_date: null, notes: 'Patient hospitalized — reassess after discharge', updated_by: 'admin-1', created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  // Inactive patient — Unable to Complete
  { id: 'awv-t-17', patient_id: 'awv-p-17', eligibility_status: 'Not Eligible', eligibility_reason: 'Patient deceased', completion_status: 'Unable to Complete', completion_date: null, awv_type: null, cpt_code: null, billed_amount: null, last_awv_date: '2025-06-10', next_eligible_date: '2026-06-10', date_source: 'Manual', scheduled_date: null, notes: 'Patient passed away 2026-02-18', updated_by: 'admin-1', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z' },
];

// ─── Reimbursement Rates ─────────────────────────────────────────

const mockReimbursementRates: AwvReimbursementRate[] = [
  { id: 'rate-1', cpt_code: 'G0402', description: 'Initial Preventive Physical Exam (IPPE)', expected_reimbursement: 175, effective_date: '2026-01-01', is_current: true },
  { id: 'rate-2', cpt_code: 'G0438', description: 'Initial Annual Wellness Visit', expected_reimbursement: 270, effective_date: '2026-01-01', is_current: true },
  { id: 'rate-3', cpt_code: 'G0439', description: 'Subsequent Annual Wellness Visit', expected_reimbursement: 230, effective_date: '2026-01-01', is_current: true },
  { id: 'rate-4', cpt_code: '99497', description: 'Advance Care Planning (initial 30 min)', expected_reimbursement: 86, effective_date: '2026-01-01', is_current: true },
  { id: 'rate-5', cpt_code: '99498', description: 'Advance Care Planning (additional 30 min)', expected_reimbursement: 75, effective_date: '2026-01-01', is_current: true },
  { id: 'rate-6', cpt_code: 'G0444', description: 'Depression Screening', expected_reimbursement: 18, effective_date: '2026-01-01', is_current: true },
  { id: 'rate-7', cpt_code: 'G0442', description: 'Alcohol Misuse Screening', expected_reimbursement: 25, effective_date: '2026-01-01', is_current: true },
];

// ─── Getter Functions ────────────────────────────────────────────

export function getMockProviders() {
  return MOCK_PROVIDERS;
}

export function getMockFacilities() {
  return MOCK_FACILITIES;
}

export function getMockReimbursementRates() {
  return mockReimbursementRates;
}

export function getMockAwvPatients(): AwvPatientWithTracking[] {
  return mockPatients
    .filter(p => p.is_active)
    .map(patient => {
      const tracking = mockTracking.find(t => t.patient_id === patient.id);
      const provider = MOCK_PROVIDERS.find(p => p.id === patient.assigned_provider_id);
      const facility = MOCK_FACILITIES.find(f => f.id === patient.facility_id);
      return {
        ...patient,
        tracking: tracking!,
        provider_name: provider?.name ?? null,
        facility_name: facility?.name ?? null,
      };
    })
    .filter(p => p.tracking);
}

export function getMockAwvPatient(id: string): AwvPatientWithTracking | null {
  const patient = mockPatients.find(p => p.id === id);
  if (!patient) return null;
  const tracking = mockTracking.find(t => t.patient_id === id);
  if (!tracking) return null;
  const provider = MOCK_PROVIDERS.find(p => p.id === patient.assigned_provider_id);
  const facility = MOCK_FACILITIES.find(f => f.id === patient.facility_id);
  return {
    ...patient,
    tracking,
    provider_name: provider?.name ?? null,
    facility_name: facility?.name ?? null,
  };
}

export function getMockAwvKpiSummary(): AwvKpiSummary {
  const activePatients = getMockAwvPatients();
  const eligible = activePatients.filter(p => p.tracking.eligibility_status === 'Eligible');
  const pendingReview = activePatients.filter(p => p.tracking.eligibility_status === 'Pending Review');
  const completedYtd = activePatients.filter(p =>
    p.tracking.completion_status === 'Completed' &&
    p.tracking.completion_date &&
    p.tracking.completion_date >= '2026-01-01'
  );
  const revenueCaptured = completedYtd.reduce((sum, p) => sum + (p.tracking.billed_amount ?? 0), 0);
  const outstanding = eligible.filter(p =>
    p.tracking.completion_status === 'Not Started' || p.tracking.completion_status === 'Scheduled'
  );
  const avgReimbursement = 245; // weighted average across AWV types
  const revenueRemaining = outstanding.length * avgReimbursement;

  return {
    eligiblePatients: eligible.length,
    pendingReview: pendingReview.length,
    completedYtd: completedYtd.length,
    totalEligible: eligible.length,
    completionRate: eligible.length > 0 ? Math.round((completedYtd.length / eligible.length) * 100) : 0,
    revenueCaptured,
    revenueRemaining,
  };
}

// ─── Mutation Helpers (session-persistent) ───────────────────────

let nextPatientNum = 18;
let nextTrackingNum = 18;

export function addMockPatient(patient: Omit<AwvPatient, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): AwvPatientWithTracking {
  const id = `awv-p-${String(nextPatientNum++).padStart(2, '0')}`;
  const now = new Date().toISOString();
  const newPatient: AwvPatient = {
    ...patient,
    id,
    tenant_id: '00000000-0000-0000-0000-000000000000',
    created_at: now,
    updated_at: now,
  };
  mockPatients.push(newPatient);

  const trackingId = `awv-t-${String(nextTrackingNum++).padStart(2, '0')}`;
  const newTracking: AwvTracking = {
    id: trackingId,
    patient_id: id,
    eligibility_status: 'Pending Review',
    eligibility_reason: null,
    completion_status: 'Not Started',
    completion_date: null,
    awv_type: null,
    cpt_code: null,
    billed_amount: null,
    last_awv_date: null,
    next_eligible_date: null,
    date_source: 'Manual',
    scheduled_date: null,
    notes: null,
    updated_by: 'admin-1',
    created_at: now,
    updated_at: now,
  };
  mockTracking.push(newTracking);

  const provider = MOCK_PROVIDERS.find(p => p.id === newPatient.assigned_provider_id);
  const facility = MOCK_FACILITIES.find(f => f.id === newPatient.facility_id);

  return {
    ...newPatient,
    tracking: newTracking,
    provider_name: provider?.name ?? null,
    facility_name: facility?.name ?? null,
  };
}

export function updateMockTracking(trackingId: string, updates: Partial<AwvTracking>): AwvTracking | null {
  const idx = mockTracking.findIndex(t => t.id === trackingId);
  if (idx === -1) return null;
  mockTracking[idx] = {
    ...mockTracking[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mockTracking[idx];
}

export function createNextTrackingCycle(patientId: string, completionDate: string): AwvTracking {
  const trackingId = `awv-t-${String(nextTrackingNum++).padStart(2, '0')}`;
  const nextEligible = new Date(completionDate);
  nextEligible.setFullYear(nextEligible.getFullYear() + 1);
  const now = new Date().toISOString();

  const newTracking: AwvTracking = {
    id: trackingId,
    patient_id: patientId,
    eligibility_status: 'Not Eligible',
    eligibility_reason: 'AWV completed < 12 months ago',
    completion_status: 'Not Started',
    completion_date: null,
    awv_type: null,
    cpt_code: null,
    billed_amount: null,
    last_awv_date: completionDate,
    next_eligible_date: nextEligible.toISOString().split('T')[0],
    date_source: 'Manual',
    scheduled_date: null,
    notes: null,
    updated_by: 'admin-1',
    created_at: now,
    updated_at: now,
  };
  mockTracking.push(newTracking);
  return newTracking;
}

// ─── Add-On Services (mutable for session persistence) ──────────

let mockAddons: AwvAddon[] = [
  // Depression screening alongside Patel's completed AWV (awv-t-06)
  { id: 'addon-1', tracking_id: 'awv-t-06', cpt_code: 'G0444', description: 'Depression Screening', billed_amount: 18, created_at: '2026-02-15T10:00:00Z' },
  // ACP alongside Rivera's initial AWV (awv-t-15)
  { id: 'addon-2', tracking_id: 'awv-t-15', cpt_code: '99497', description: 'Advance Care Planning (initial 30 min)', billed_amount: 86, created_at: '2026-03-05T10:00:00Z' },
  { id: 'addon-3', tracking_id: 'awv-t-15', cpt_code: '99498', description: 'Advance Care Planning (additional 30 min)', billed_amount: 75, created_at: '2026-03-05T10:01:00Z' },
];

let nextAddonNum = 4;

export function getMockAddons(trackingId: string): AwvAddon[] {
  return mockAddons.filter(a => a.tracking_id === trackingId);
}

export function addMockAddon(addon: Omit<AwvAddon, 'id' | 'created_at'>): AwvAddon {
  const id = `addon-${nextAddonNum++}`;
  const newAddon: AwvAddon = {
    ...addon,
    id,
    created_at: new Date().toISOString(),
  };
  mockAddons.push(newAddon);
  return newAddon;
}

// ─── Tracking History ───────────────────────────────────────────

export function getMockTrackingHistory(patientId: string): AwvTracking[] {
  return mockTracking
    .filter(t => t.patient_id === patientId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ─── Upload Mock Data ────────────────────────────────────────────

let nextUploadNum = 3;

const mockUploads: AwvUpload[] = [
  {
    id: 'upload-1',
    tenant_id: '00000000-0000-0000-0000-000000000000',
    uploaded_by: 'admin-1',
    upload_date: '2026-02-01T14:30:00Z',
    file_name: 'medicare_patient_roster_feb2026.csv',
    row_count: 52,
    new_patients: 12,
    updated_patients: 38,
    flagged_patients: 2,
    status: 'Completed',
    validation_errors: null,
    created_at: '2026-02-01T14:30:00Z',
  },
  {
    id: 'upload-2',
    tenant_id: '00000000-0000-0000-0000-000000000000',
    uploaded_by: 'admin-1',
    upload_date: '2026-01-15T09:15:00Z',
    file_name: 'medicare_patient_roster_jan2026.csv',
    row_count: 48,
    new_patients: 48,
    updated_patients: 0,
    flagged_patients: 0,
    status: 'Completed',
    validation_errors: null,
    created_at: '2026-01-15T09:15:00Z',
  },
];

export function getMockAwvUploads(): AwvUpload[] {
  return [...mockUploads].sort((a, b) => b.upload_date.localeCompare(a.upload_date));
}

// ─── Upload Processing (mock upsert) ────────────────────────────

export interface MockUploadResult {
  newPatients: number;
  updatedPatients: number;
  flaggedPatients: number;
  errors: AwvValidationError[];
  totalRows: number;
  uploadRecord: AwvUpload;
}

export function processMockUpload(rows: AwvUploadRow[], fileName: string): MockUploadResult {
  const now = new Date().toISOString();
  let newCount = 0;
  let updatedCount = 0;
  const errors: AwvValidationError[] = [];
  const uploadedEcwIds = new Set<string>();

  rows.forEach((row, idx) => {
    const ecwId = row['Patient Acct No'];

    // Check for duplicate ecw_patient_id within file
    if (uploadedEcwIds.has(ecwId)) {
      errors.push({ row: idx + 2, field: 'Patient Acct No', message: `Duplicate Patient Acct No: ${ecwId}` });
      return;
    }
    uploadedEcwIds.add(ecwId);

    // Match provider by name
    const providerName = row['Rendering Provider'];
    const provider = MOCK_PROVIDERS.find(p => p.name.toLowerCase() === providerName.toLowerCase());

    // Match facility by name (optional)
    const facilityName = row['Facility'];
    const facility = facilityName ? MOCK_FACILITIES.find(f => f.name.toLowerCase() === facilityName.toLowerCase()) : null;

    // Check if patient already exists
    const existingPatient = mockPatients.find(p => p.ecw_patient_id === ecwId);

    if (existingPatient) {
      // Update existing patient
      existingPatient.last_name = row['Patient Last Name'];
      if (provider) existingPatient.assigned_provider_id = provider.id;
      if (facilityName && facility) existingPatient.facility_id = facility.id;
      if (row['Primary Payer Name']) existingPatient.payer_name = row['Primary Payer Name'];
      existingPatient.updated_at = now;
      updatedCount++;

      // Warn about unmatched provider/facility
      if (!provider) {
        errors.push({ row: idx + 2, field: 'Rendering Provider', message: `Provider not found: "${providerName}"` });
      }
      if (facilityName && !facility) {
        errors.push({ row: idx + 2, field: 'Facility', message: `Facility not found: "${facilityName}"` });
      }
    } else {
      // Create new patient
      const isMobileDocs = !!facility;
      const patientId = `awv-p-${String(nextPatientNum++).padStart(2, '0')}`;
      const newPatient: AwvPatient = {
        id: patientId,
        tenant_id: '00000000-0000-0000-0000-000000000000',
        ecw_patient_id: ecwId,
        last_name: row['Patient Last Name'],
        assigned_provider_id: provider?.id ?? null,
        service_line: isMobileDocs ? 'Mobile Docs' : 'HCI Office',
        facility_id: facility?.id ?? null,
        payer_name: row['Primary Payer Name'] || null,
        medicare_status: 'Active',
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      mockPatients.push(newPatient);

      // Create tracking record
      const trackingId = `awv-t-${String(nextTrackingNum++).padStart(2, '0')}`;
      const lastAwvDate = row['Last AWV Date'] || null;
      let nextEligibleDate: string | null = null;
      if (lastAwvDate) {
        const ned = new Date(lastAwvDate);
        ned.setFullYear(ned.getFullYear() + 1);
        nextEligibleDate = ned.toISOString().split('T')[0];
      }

      const newTracking: AwvTracking = {
        id: trackingId,
        patient_id: patientId,
        eligibility_status: 'Pending Review',
        eligibility_reason: null,
        completion_status: 'Not Started',
        completion_date: null,
        awv_type: null,
        cpt_code: row['Last AWV CPT'] || null,
        billed_amount: null,
        last_awv_date: lastAwvDate,
        next_eligible_date: nextEligibleDate,
        date_source: 'Upload',
        scheduled_date: null,
        notes: null,
        updated_by: 'admin-1',
        created_at: now,
        updated_at: now,
      };
      mockTracking.push(newTracking);
      newCount++;

      if (!provider) {
        errors.push({ row: idx + 2, field: 'Rendering Provider', message: `Provider not found: "${providerName}"` });
      }
    }
  });

  // Flag active patients not in upload
  const flaggedCount = mockPatients.filter(
    p => p.is_active && !uploadedEcwIds.has(p.ecw_patient_id)
  ).length;

  const status = errors.length > 0 ? 'Completed with Warnings' as const : 'Completed' as const;
  const uploadId = `upload-${nextUploadNum++}`;

  const uploadRecord: AwvUpload = {
    id: uploadId,
    tenant_id: '00000000-0000-0000-0000-000000000000',
    uploaded_by: 'admin-1',
    upload_date: now,
    file_name: fileName,
    row_count: rows.length,
    new_patients: newCount,
    updated_patients: updatedCount,
    flagged_patients: flaggedCount,
    status,
    validation_errors: errors.length > 0 ? errors : null,
    created_at: now,
  };
  mockUploads.push(uploadRecord);

  return {
    newPatients: newCount,
    updatedPatients: updatedCount,
    flaggedPatients: flaggedCount,
    errors,
    totalRows: rows.length,
    uploadRecord,
  };
}

// ─── Revenue Data Functions (Phase 3) ──────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AVG_REIMBURSEMENT = 245;

export function getMockAwvRevenueMetrics(): AwvRevenueMetrics {
  const patients = getMockAwvPatients();
  const completedPatients = patients.filter(
    p => p.tracking.completion_status === 'Completed' &&
      p.tracking.completion_date &&
      p.tracking.completion_date >= '2026-01-01'
  );

  // Sum billed amounts from completed AWVs
  let revenueCapturedYtd = completedPatients.reduce(
    (sum, p) => sum + (p.tracking.billed_amount ?? 0), 0
  );

  // Add addon revenue for completed AWVs
  for (const p of completedPatients) {
    const addons = getMockAddons(p.tracking.id);
    revenueCapturedYtd += addons.reduce((s, a) => s + (a.billed_amount ?? 0), 0);
  }

  // Outstanding = eligible patients not yet completed
  const eligible = patients.filter(p => p.tracking.eligibility_status === 'Eligible');
  const outstanding = eligible.filter(
    p => p.tracking.completion_status === 'Not Started' || p.tracking.completion_status === 'Scheduled'
  );
  const revenueRemaining = outstanding.length * AVG_REIMBURSEMENT;
  const totalOpportunity = revenueCapturedYtd + revenueRemaining;
  const captureRate = totalOpportunity > 0
    ? Math.round((revenueCapturedYtd / totalOpportunity) * 100)
    : 0;
  const avgRevenuePerAwv = completedPatients.length > 0
    ? Math.round(revenueCapturedYtd / completedPatients.length)
    : 0;

  // Provider breakdown
  const providerMap = new Map<string, {
    name: string;
    assigned: number;
    eligible: number;
    completed: number;
    revenue: number;
    outstanding: number;
  }>();

  for (const prov of MOCK_PROVIDERS) {
    providerMap.set(prov.id, {
      name: prov.name,
      assigned: 0,
      eligible: 0,
      completed: 0,
      revenue: 0,
      outstanding: 0,
    });
  }

  for (const p of patients) {
    const provId = p.assigned_provider_id;
    if (!provId || !providerMap.has(provId)) continue;
    const entry = providerMap.get(provId)!;
    entry.assigned++;
    if (p.tracking.eligibility_status === 'Eligible') {
      entry.eligible++;
      if (p.tracking.completion_status === 'Not Started' || p.tracking.completion_status === 'Scheduled') {
        entry.outstanding++;
      }
    }
    if (p.tracking.completion_status === 'Completed' && p.tracking.completion_date && p.tracking.completion_date >= '2026-01-01') {
      entry.completed++;
      entry.revenue += p.tracking.billed_amount ?? 0;
      const addons = getMockAddons(p.tracking.id);
      entry.revenue += addons.reduce((s, a) => s + (a.billed_amount ?? 0), 0);
    }
  }

  const providerBreakdown: AwvProviderMetrics[] = Array.from(providerMap.entries()).map(
    ([id, d]) => ({
      providerId: id,
      providerName: d.name,
      assignedPatients: d.assigned,
      eligiblePatients: d.eligible,
      completedYtd: d.completed,
      completionRate: d.eligible > 0 ? Math.round((d.completed / d.eligible) * 100) : 0,
      revenueCaptured: d.revenue,
      outstanding: d.outstanding,
    })
  );

  return {
    revenueCapturedYtd,
    revenueRemaining,
    totalOpportunity,
    captureRate,
    avgRevenuePerAwv,
    providerBreakdown,
  };
}

export function getMockAwvMonthlyRevenue(): AwvMonthlyRevenuePoint[] {
  const patients = getMockAwvPatients();
  const completedPatients = patients.filter(
    p => p.tracking.completion_status === 'Completed' &&
      p.tracking.completion_date &&
      p.tracking.completion_date >= '2026-01-01'
  );

  // Bucket by month
  const monthData = MONTH_NAMES.map((month, i) => ({
    month,
    monthNum: i + 1,
    awvCount: 0,
    revenue: 0,
    addonRevenue: 0,
    cumulativeRevenue: 0,
  }));

  for (const p of completedPatients) {
    const dateStr = p.tracking.completion_date!;
    const monthIdx = parseInt(dateStr.split('-')[1], 10) - 1;
    if (monthIdx < 0 || monthIdx > 11) continue;
    monthData[monthIdx].awvCount++;
    monthData[monthIdx].revenue += p.tracking.billed_amount ?? 0;

    const addons = getMockAddons(p.tracking.id);
    const addonSum = addons.reduce((s, a) => s + (a.billed_amount ?? 0), 0);
    monthData[monthIdx].addonRevenue += addonSum;
    monthData[monthIdx].revenue += addonSum;
  }

  // Compute cumulative
  let cumulative = 0;
  for (const m of monthData) {
    cumulative += m.revenue;
    m.cumulativeRevenue = cumulative;
  }

  return monthData;
}

export function getMockAwvServiceLineSplit(): AwvServiceLineSplit[] {
  const patients = getMockAwvPatients();
  const completedPatients = patients.filter(
    p => p.tracking.completion_status === 'Completed' &&
      p.tracking.completion_date &&
      p.tracking.completion_date >= '2026-01-01'
  );

  const lineMap = new Map<AwvServiceLine, { count: number; revenue: number }>();
  lineMap.set('HCI Office', { count: 0, revenue: 0 });
  lineMap.set('Mobile Docs', { count: 0, revenue: 0 });

  for (const p of completedPatients) {
    const entry = lineMap.get(p.service_line)!;
    entry.count++;
    entry.revenue += p.tracking.billed_amount ?? 0;
    const addons = getMockAddons(p.tracking.id);
    entry.revenue += addons.reduce((s, a) => s + (a.billed_amount ?? 0), 0);
  }

  const totalRevenue = Array.from(lineMap.values()).reduce((s, v) => s + v.revenue, 0);

  return Array.from(lineMap.entries()).map(([serviceLine, d]) => ({
    serviceLine,
    completedCount: d.count,
    revenue: d.revenue,
    percentage: totalRevenue > 0 ? Math.round((d.revenue / totalRevenue) * 100) : 0,
  }));
}

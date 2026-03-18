import { useQuery } from '@tanstack/react-query';
import {
  getMockCcmPatients,
  getMockCcmPatient,
  getMockCcmKpiSummary,
} from '@/lib/ccm-rpm-mock-data';
import type {
  CcmPatientWithEnrollment,
  CcmRegistryFilters,
  CcmKpiSummary,
} from '@/types/ccm-rpm';

// ─── Sort priority: Enrolled first, then Eligible, then others ───

const STATUS_SORT_ORDER: Record<string, number> = {
  'Enrolled': 0,
  'Eligible': 1,
  'Declined': 2,
  'Disenrolled': 3,
  'Inactive': 4,
};

// ─── Filter logic (client-side) ──────────────────────────────────

function matchesFilters(
  patient: CcmPatientWithEnrollment,
  filters: CcmRegistryFilters,
): boolean {
  // Search filter — match last_name or ecw_patient_id
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const matchesName = patient.last_name.toLowerCase().includes(q);
    const matchesEcw = patient.ecw_patient_id.toLowerCase().includes(q);
    if (!matchesName && !matchesEcw) return false;
  }

  // Enrollment status
  if (
    filters.enrollmentStatus !== 'All' &&
    patient.enrollment.enrollment_status !== filters.enrollmentStatus
  ) {
    return false;
  }

  // Program type
  if (
    filters.programType !== 'All' &&
    patient.enrollment.program_type !== filters.programType
  ) {
    return false;
  }

  // Service line
  if (
    filters.serviceLine !== 'All' &&
    patient.service_line !== filters.serviceLine
  ) {
    return false;
  }

  // Provider
  if (
    filters.providerId !== 'All' &&
    patient.assigned_provider_id !== filters.providerId
  ) {
    return false;
  }

  // Device filter
  if (filters.deviceFilter === 'Has Active Devices' && patient.active_device_count === 0) {
    return false;
  }
  if (filters.deviceFilter === 'No Devices' && patient.active_device_count > 0) {
    return false;
  }

  return true;
}

function sortPatients(
  patients: CcmPatientWithEnrollment[],
): CcmPatientWithEnrollment[] {
  return [...patients].sort((a, b) => {
    const statusDiff =
      (STATUS_SORT_ORDER[a.enrollment.enrollment_status] ?? 4) -
      (STATUS_SORT_ORDER[b.enrollment.enrollment_status] ?? 4);
    if (statusDiff !== 0) return statusDiff;

    return a.last_name.localeCompare(b.last_name);
  });
}

// ─── Hooks ───────────────────────────────────────────────────────

export function useCcmRegistry(filters: CcmRegistryFilters) {
  return useQuery<CcmPatientWithEnrollment[]>({
    queryKey: ['ccm', 'registry', filters],
    queryFn: () => {
      const all = getMockCcmPatients();
      const filtered = all.filter((p) => matchesFilters(p, filters));
      return sortPatients(filtered);
    },
    staleTime: 30_000,
  });
}

export function useCcmPatient(id: string | null) {
  return useQuery<CcmPatientWithEnrollment | null>({
    queryKey: ['ccm', 'patient', id],
    queryFn: () => getMockCcmPatient(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCcmKpiSummary() {
  return useQuery<CcmKpiSummary>({
    queryKey: ['ccm', 'kpi'],
    queryFn: () => getMockCcmKpiSummary(),
    staleTime: 30_000,
  });
}

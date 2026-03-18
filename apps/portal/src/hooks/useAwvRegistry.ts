import { useQuery } from '@tanstack/react-query';
import type {
  AwvPatientWithTracking,
  AwvRegistryFilters,
  AwvKpiSummary,
} from '@/types/awv-tracker';
import {
  getMockAwvPatients,
  getMockAwvPatient,
  getMockAwvKpiSummary,
} from '@/lib/awv-tracker-mock-data';

// ─── Filter + sort logic (client-side) ──────────────────────────────────────

function matchesFilters(
  patient: AwvPatientWithTracking,
  filters: AwvRegistryFilters,
): boolean {
  // Search filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const matchesName = patient.last_name.toLowerCase().includes(q);
    const matchesEcw = patient.ecw_patient_id.toLowerCase().includes(q);
    if (!matchesName && !matchesEcw) return false;
  }

  // Eligibility status
  if (
    filters.eligibilityStatus !== 'All' &&
    patient.tracking.eligibility_status !== filters.eligibilityStatus
  ) {
    return false;
  }

  // Completion status
  if (
    filters.completionStatus !== 'All' &&
    patient.tracking.completion_status !== filters.completionStatus
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

  // Eligibility timing
  if (filters.eligibilityTiming !== 'All') {
    const today = new Date().toISOString().split('T')[0];
    const nextEligible = patient.tracking.next_eligible_date;

    if (filters.eligibilityTiming === 'Newly Eligible') {
      if (!nextEligible) return true;
      const currentMonth = today.substring(0, 7);
      return (
        nextEligible.substring(0, 7) === currentMonth && nextEligible <= today
      );
    }

    if (filters.eligibilityTiming === 'Eligible Soon') {
      if (!nextEligible) return false;
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      return (
        nextEligible > today &&
        nextEligible <= thirtyDays.toISOString().split('T')[0]
      );
    }

    if (filters.eligibilityTiming === 'Overdue') {
      if (patient.tracking.eligibility_status !== 'Eligible') return false;
      if (patient.tracking.completion_status !== 'Not Started') return false;
      if (!nextEligible) return true;
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return nextEligible <= ninetyDaysAgo.toISOString().split('T')[0];
    }
  }

  return true;
}

function sortPatients(
  patients: AwvPatientWithTracking[],
): AwvPatientWithTracking[] {
  return [...patients].sort((a, b) => {
    const eligOrder = { Eligible: 0, 'Pending Review': 1, 'Not Eligible': 2 };
    const eligDiff =
      (eligOrder[a.tracking.eligibility_status] ?? 2) -
      (eligOrder[b.tracking.eligibility_status] ?? 2);
    if (eligDiff !== 0) return eligDiff;

    const aDate = a.tracking.next_eligible_date ?? '0000-00-00';
    const bDate = b.tracking.next_eligible_date ?? '0000-00-00';
    return aDate.localeCompare(bDate);
  });
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useAwvRegistry(filters: AwvRegistryFilters) {
  return useQuery<AwvPatientWithTracking[]>({
    queryKey: ['awv', 'registry', filters],
    queryFn: async () => {
      const all = getMockAwvPatients();
      const filtered = all.filter((p) => matchesFilters(p, filters));
      return sortPatients(filtered);
    },
    staleTime: 30_000,
  });
}

export function useAwvPatient(id: string | null) {
  return useQuery<AwvPatientWithTracking | null>({
    queryKey: ['awv', 'patient', id],
    queryFn: async () => {
      if (!id) return null;
      return getMockAwvPatient(id);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useAwvKpiSummary() {
  return useQuery<AwvKpiSummary>({
    queryKey: ['awv', 'kpi-summary'],
    queryFn: async () => getMockAwvKpiSummary(),
    staleTime: 30_000,
  });
}

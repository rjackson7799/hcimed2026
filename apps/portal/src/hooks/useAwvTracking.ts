import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { AwvPatient, AwvTracking, AwvType, AwvPatientWithTracking } from '@/types/awv-tracker';
import { AWV_CPT_CODES } from '@/types/awv-tracker';
import { DEFAULT_REIMBURSEMENT_RATES } from '@/lib/awv-tracker-constants';
import {
  addMockPatient,
  updateMockTracking,
  createNextTrackingCycle,
  getMockAwvPatient,
} from '@/lib/awv-tracker-mock-data';

export function useAwvAddPatient() {
  const queryClient = useQueryClient();

  return useMutation<AwvPatientWithTracking, Error, Omit<AwvPatient, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>({
    mutationFn: async (data) => {
      return addMockPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

interface EligibilityUpdate {
  trackingId: string;
  eligibility_status: AwvTracking['eligibility_status'];
  eligibility_reason?: string;
}

export function useAwvUpdateEligibility() {
  const queryClient = useQueryClient();

  return useMutation<AwvTracking | null, Error, EligibilityUpdate>({
    mutationFn: async ({ trackingId, eligibility_status, eligibility_reason }) => {
      return updateMockTracking(trackingId, {
        eligibility_status,
        eligibility_reason: eligibility_reason ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

interface ScheduleUpdate {
  trackingId: string;
  scheduled_date: string;
  awv_type?: AwvType;
  notes?: string;
}

export function useAwvSchedule() {
  const queryClient = useQueryClient();

  return useMutation<AwvTracking | null, Error, ScheduleUpdate>({
    mutationFn: async ({ trackingId, scheduled_date, awv_type, notes }) => {
      return updateMockTracking(trackingId, {
        completion_status: 'Scheduled',
        scheduled_date,
        awv_type: awv_type ?? null,
        cpt_code: awv_type ? AWV_CPT_CODES[awv_type] : null,
        notes: notes ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

interface CompleteUpdate {
  trackingId: string;
  patientId: string;
  completion_date: string;
  awv_type: AwvType;
  billed_amount?: number;
  notes?: string;
}

export function useAwvComplete() {
  const queryClient = useQueryClient();

  return useMutation<AwvTracking | null, Error, CompleteUpdate>({
    mutationFn: async ({ trackingId, patientId, completion_date, awv_type, billed_amount, notes }) => {
      const cpt = AWV_CPT_CODES[awv_type];
      const defaultAmount = DEFAULT_REIMBURSEMENT_RATES[cpt as keyof typeof DEFAULT_REIMBURSEMENT_RATES]?.amount ?? 0;
      const finalAmount = billed_amount ?? defaultAmount;

      // Update current tracking record to Completed
      const updated = updateMockTracking(trackingId, {
        completion_status: 'Completed',
        completion_date,
        awv_type,
        cpt_code: cpt,
        billed_amount: finalAmount,
        notes: notes ?? null,
      });

      // Create next tracking cycle
      createNextTrackingCycle(patientId, completion_date);

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

interface StatusUpdate {
  trackingId: string;
  completion_status: 'Refused' | 'Unable to Complete';
  notes?: string;
}

export function useAwvUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation<AwvTracking | null, Error, StatusUpdate>({
    mutationFn: async ({ trackingId, completion_status, notes }) => {
      return updateMockTracking(trackingId, {
        completion_status,
        notes: notes ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

export function useAwvUpdateNotes() {
  const queryClient = useQueryClient();

  return useMutation<AwvTracking | null, Error, { trackingId: string; notes: string }>({
    mutationFn: async ({ trackingId, notes }) => {
      return updateMockTracking(trackingId, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

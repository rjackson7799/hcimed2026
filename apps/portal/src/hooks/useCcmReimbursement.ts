import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMockReimbursements,
  addMockReimbursement,
  addMockBatchReimbursements,
  getMockBatchReimbursementPatients,
} from '@/lib/ccm-rpm-mock-data';
import type { CcmCptCode, CcmReimbursement, CcmPatientWithEnrollment } from '@/types/ccm-rpm';

// ─── Reimbursement Query ────────────────────────────────────────

export function useCcmReimbursements(enrollmentId: string) {
  return useQuery<CcmReimbursement[]>({
    queryKey: ['ccm', 'reimbursements', enrollmentId],
    queryFn: () => getMockReimbursements(enrollmentId),
    staleTime: 30_000,
    enabled: !!enrollmentId,
  });
}

// ─── Add Single Reimbursement ───────────────────────────────────

interface ReimbursementAdd {
  enrollment_id: string;
  service_month: string;
  cpt_code: CcmCptCode;
  paid_amount: number;
  billed_amount?: number;
  adjustment_amount?: number;
  denial_reason?: string;
  notes?: string;
}

export function useCcmAddReimbursement() {
  const queryClient = useQueryClient();

  return useMutation<CcmReimbursement, Error, ReimbursementAdd>({
    mutationFn: async (data) => {
      await new Promise((r) => setTimeout(r, 200));
      return addMockReimbursement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}

// ─── Batch Patients Query ───────────────────────────────────────

export function useCcmBatchPatients(serviceMonth: string) {
  return useQuery<CcmPatientWithEnrollment[]>({
    queryKey: ['ccm', 'batch-patients', serviceMonth],
    queryFn: () => getMockBatchReimbursementPatients(serviceMonth),
    staleTime: 30_000,
    enabled: !!serviceMonth,
  });
}

// ─── Batch Reimbursement ────────────────────────────────────────

interface BatchReimbursementEntry {
  enrollment_id: string;
  service_month: string;
  cpt_code: CcmCptCode;
  paid_amount: number;
  billed_amount?: number;
}

export function useCcmBatchReimbursement() {
  const queryClient = useQueryClient();

  return useMutation<CcmReimbursement[], Error, BatchReimbursementEntry[]>({
    mutationFn: async (entries) => {
      await new Promise((r) => setTimeout(r, 300));
      return addMockBatchReimbursements(entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}

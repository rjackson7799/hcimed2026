import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AwvAddon, AwvTracking, AwvUpload } from '@/types/awv-tracker';
import type { AwvUploadRow } from '@/schemas/awvUploadSchema';
import {
  processMockUpload,
  getMockAwvUploads,
  getMockAddons,
  addMockAddon,
  getMockTrackingHistory,
} from '@/lib/awv-tracker-mock-data';
import type { MockUploadResult } from '@/lib/awv-tracker-mock-data';

// ─── Upload Mutation ────────────────────────────────────────────

interface UploadInput {
  fileName: string;
  parsedRows: AwvUploadRow[];
}

export function useAwvUpload() {
  const queryClient = useQueryClient();

  return useMutation<MockUploadResult, Error, UploadInput>({
    mutationFn: async ({ parsedRows, fileName }) => {
      return processMockUpload(parsedRows, fileName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

// ─── Upload History Query ───────────────────────────────────────

export function useAwvUploadHistory() {
  return useQuery<AwvUpload[]>({
    queryKey: ['awv', 'uploads'],
    queryFn: async () => getMockAwvUploads(),
    staleTime: 30_000,
  });
}

// ─── Add-On Queries & Mutations ─────────────────────────────────

export function useAwvAddons(trackingId: string) {
  return useQuery<AwvAddon[]>({
    queryKey: ['awv', 'addons', trackingId],
    queryFn: async () => getMockAddons(trackingId),
    staleTime: 30_000,
    enabled: !!trackingId,
  });
}

interface AddAddonInput {
  tracking_id: string;
  cpt_code: string;
  description: string | null;
  billed_amount: number | null;
}

export function useAddAwvAddon() {
  const queryClient = useQueryClient();

  return useMutation<AwvAddon, Error, AddAddonInput>({
    mutationFn: async (data) => {
      return addMockAddon({
        tracking_id: data.tracking_id,
        cpt_code: data.cpt_code,
        description: data.description ?? '',
        billed_amount: data.billed_amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awv'] });
    },
  });
}

// ─── Tracking History Query ─────────────────────────────────────

export function useAwvTrackingHistory(patientId: string) {
  return useQuery<AwvTracking[]>({
    queryKey: ['awv', 'history', patientId],
    queryFn: async () => getMockTrackingHistory(patientId),
    staleTime: 30_000,
    enabled: !!patientId,
  });
}

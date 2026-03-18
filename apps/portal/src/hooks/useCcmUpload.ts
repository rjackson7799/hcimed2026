import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMockCcmUploads, processMockCcmUpload } from '@/lib/ccm-rpm-mock-data';
import type { CcmUpload } from '@/types/ccm-rpm';

interface CcmUploadInput {
  fileName: string;
  parsedRows: Array<Record<string, string>>;
}

export function useCcmUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileName, parsedRows }: CcmUploadInput) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return processMockCcmUpload(parsedRows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}

export function useCcmUploadHistory() {
  return useQuery<CcmUpload[]>({
    queryKey: ['ccm', 'uploads'],
    queryFn: () => getMockCcmUploads(),
    staleTime: 30_000,
  });
}

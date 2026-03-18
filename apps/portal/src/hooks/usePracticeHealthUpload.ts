/**
 * Practice Health Upload Hook — handles client-side parsing and server-side upload.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { parseReport } from '@/lib/report-parsers';
import type { ReportParseResult } from '@/lib/report-parsers';
import type { UploadResult } from '@/types/practice-health';

/**
 * Parse a report file client-side for preview/validation before upload.
 * Call this separately from the mutation to show the preview UI.
 */
export async function parseReportClientSide(file: File): Promise<ReportParseResult> {
  return parseReport(file);
}

interface UploadParams {
  parseResult: ReportParseResult;
  /** Required for 36.14 collections reports (user-supplied period dates) */
  periodStart?: string;
  /** Required for 36.14 collections reports (user-supplied period dates) */
  periodEnd?: string;
}

/**
 * Upload mutation hook. Takes a pre-parsed ReportParseResult and sends to server.
 */
export function usePracticeHealthUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parseResult, periodStart, periodEnd }: UploadParams): Promise<UploadResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // For collections reports, inject the user-supplied period dates into each row
      let rows = parseResult.validRows;
      let dateRangeStart = parseResult.dateRangeStart;
      let dateRangeEnd = parseResult.dateRangeEnd;

      if (parseResult.detection.reportType === '36.14') {
        if (!periodStart || !periodEnd) {
          throw new Error('Period start and end dates are required for Financial Analysis reports.');
        }
        dateRangeStart = periodStart;
        dateRangeEnd = periodEnd;
        rows = rows.map((row) => ({
          ...row,
          period_start: periodStart,
          period_end: periodEnd,
        }));
      }

      const response = await fetch('/api/practice-health-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reportType: parseResult.detection.reportType,
          fileName: parseResult.fileName,
          fileSizeBytes: parseResult.fileSizeBytes,
          dateRangeStart,
          dateRangeEnd,
          rows,
          rowCount: rows.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data as UploadResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ph-uploads'] });
      queryClient.invalidateQueries({ queryKey: ['ph-kpi'] });
      toast.success(`Upload complete — ${data.rowCount} rows imported successfully.`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Upload failed. Please try again.');
    },
  });
}

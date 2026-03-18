/**
 * ReportUploadHistory — Table showing recent practice health report uploads.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@hci/shared/ui/table';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@hci/shared/ui/card';
import { FileText } from 'lucide-react';
import { usePracticeHealthUploads } from '@/hooks/usePracticeHealthUploads';
import {
  PH_REPORT_TYPE_LABELS,
  PH_UPLOAD_STATUS_CONFIG,
} from '@/lib/practice-health-constants';
import { cn } from '@hci/shared/lib/utils';

export function ReportUploadHistory() {
  const { data: uploads, isLoading } = usePracticeHealthUploads();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !uploads || uploads.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No uploads yet. Upload an eCW report to get started.
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Report Type</TableHead>
                  <TableHead className="text-xs">File</TableHead>
                  <TableHead className="text-xs text-right">Rows</TableHead>
                  <TableHead className="text-xs">Date Range</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((upload) => {
                  const statusConfig =
                    PH_UPLOAD_STATUS_CONFIG[upload.status as keyof typeof PH_UPLOAD_STATUS_CONFIG];
                  return (
                    <TableRow key={upload.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(upload.upload_date || upload.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {PH_REPORT_TYPE_LABELS[upload.report_type] || upload.report_type}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={upload.file_name}>
                        {upload.file_name}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {upload.row_count ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {upload.date_range_start && upload.date_range_end
                          ? `${upload.date_range_start} – ${upload.date_range_end}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            statusConfig?.bg,
                            statusConfig?.color
                          )}
                        >
                          {statusConfig?.label || upload.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

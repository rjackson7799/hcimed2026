import { cn } from '@hci/shared/lib/utils';
import { useCcmUploadHistory } from '@/hooks/useCcmUpload';
import type { CcmUploadStatus } from '@/types/ccm-rpm';

const STATUS_CONFIG: Record<CcmUploadStatus, { bg: string; text: string }> = {
  'Processing': { bg: 'bg-blue-950/50', text: 'text-blue-300' },
  'Completed': { bg: 'bg-emerald-950/50', text: 'text-emerald-300' },
  'Completed with Warnings': { bg: 'bg-amber-950/50', text: 'text-amber-300' },
  'Failed': { bg: 'bg-red-950/50', text: 'text-red-300' },
};

export function UploadHistoryTable() {
  const { data: uploads, isLoading } = useCcmUploadHistory();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!uploads?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No uploads yet</p>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground">File</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Rows</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">New</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Updated</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Flagged</th>
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload) => {
            const statusCfg = STATUS_CONFIG[upload.status];
            return (
              <tr key={upload.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(upload.upload_date).toLocaleDateString()}
                </td>
                <td className="max-w-[180px] truncate px-3 py-2">{upload.file_name}</td>
                <td className="px-3 py-2 text-right">{upload.row_count ?? '—'}</td>
                <td className="px-3 py-2 text-right">{upload.new_patients}</td>
                <td className="px-3 py-2 text-right">{upload.updated_patients}</td>
                <td className="px-3 py-2 text-right">{upload.flagged_patients}</td>
                <td className="px-3 py-2">
                  <span className={cn('rounded px-2 py-0.5 text-xs font-medium', statusCfg.bg, statusCfg.text)}>
                    {upload.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

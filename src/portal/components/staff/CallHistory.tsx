import { useOutreachLogs } from '@/portal/hooks/useOutreach';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { formatDateTime } from '@/portal/utils/formatters';
import { Loader2 } from 'lucide-react';
import type { OutreachStatus } from '@/portal/types';

// Map disposition to outreach status for badge display
const dispositionToStatus: Record<string, OutreachStatus> = {
  no_answer: 'no_answer',
  voicemail: 'no_answer',
  needs_more_info: 'needs_more_info',
  not_interested: 'not_interested',
  will_switch: 'will_switch',
  wrong_number: 'wrong_number',
  disconnected: 'wrong_number',
};

interface CallHistoryProps {
  patientId: string;
}

export function CallHistory({ patientId }: CallHistoryProps) {
  const { data: logs, isLoading } = useOutreachLogs(patientId);

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin mx-auto my-4" />;
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No outreach attempts yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Call History ({logs.length} attempts)
      </p>
      <div className="space-y-2">
        {logs.map((log: any) => (
          <div key={log.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between mb-1">
              <StatusBadge
                status={dispositionToStatus[log.disposition] || 'no_answer'}
                type="outreach"
              />
              <span className="text-xs text-muted-foreground">
                {formatDateTime(log.call_timestamp)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              by {log.profiles?.full_name || 'Unknown'}
              {log.forwarded_to_broker && ' • Forwarded to broker'}
            </p>
            {log.notes && (
              <p className="mt-1 text-sm text-foreground">{log.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

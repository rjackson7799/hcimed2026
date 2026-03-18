import { cn } from '@hci/shared/lib/utils';
import { useAwvTrackingHistory } from '@/hooks/useAwvUpload';
import { AwvStatusBadge } from './AwvStatusBadge';
import { AWV_CPT_CODES } from '@/types/awv-tracker';

interface AwvHistorySectionProps {
  patientId: string;
}

export function AwvHistorySection({ patientId }: AwvHistorySectionProps) {
  const { data: history, isLoading } = useAwvTrackingHistory(patientId);

  if (isLoading) {
    return (
      <div className="p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AWV History</h3>
        <div className="mt-2 space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded bg-muted/30" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        AWV History
        {history && history.length > 1 && (
          <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{history.length}</span>
        )}
      </h3>

      {!history || history.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground/60">No AWV history</p>
      ) : (
        <div className="mt-3 space-y-2">
          {history.map((record, idx) => {
            const isActive = idx === 0; // newest = current active cycle
            const dateLabel = record.completion_date
              ? `Completed ${record.completion_date}`
              : record.scheduled_date
                ? `Scheduled ${record.scheduled_date}`
                : 'In progress';

            return (
              <div
                key={record.id}
                className={cn(
                  'rounded-lg border p-3',
                  isActive ? 'border-primary/30 bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AwvStatusBadge type="completion" status={record.completion_status} />
                    <AwvStatusBadge type="eligibility" status={record.eligibility_status} />
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Current</span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{dateLabel}</span>
                  {record.awv_type && (
                    <span>
                      {record.awv_type} ({AWV_CPT_CODES[record.awv_type]})
                    </span>
                  )}
                  {record.billed_amount != null && (
                    <span className="font-medium text-foreground">${record.billed_amount}</span>
                  )}
                </div>

                {record.last_awv_date && (
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Prior AWV: {record.last_awv_date}
                    {record.next_eligible_date && ` → Next eligible: ${record.next_eligible_date}`}
                  </p>
                )}

                {record.notes && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">{record.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

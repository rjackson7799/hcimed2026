import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useMobileDocsPipelineActivity } from '@/hooks/useMobileDocsPipeline';
import { PIPELINE_STATUS_COLORS } from '@/lib/mobile-docs-constants';
import type { FacilityStatus } from '@/types/mobile-docs';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PipelineActivityFeed() {
  const { data, isLoading } = useMobileDocsPipelineActivity();

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const recentItems = data.slice(0, 6);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Pipeline Activity</h3>

      <div className="divide-y divide-slate-700/50">
        {recentItems.map((item, idx) => {
          const colors = PIPELINE_STATUS_COLORS[item.toStatus as FacilityStatus];

          return (
            <div key={idx} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="text-xs text-slate-500 whitespace-nowrap pt-0.5 min-w-[3rem]">
                {formatDate(item.date)}
              </span>

              <span
                className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {item.fromStatus ? `\u2192 ${item.toStatus}` : item.toStatus}
              </span>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-200 block truncate">
                  {item.facilityName}
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  {item.reason}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

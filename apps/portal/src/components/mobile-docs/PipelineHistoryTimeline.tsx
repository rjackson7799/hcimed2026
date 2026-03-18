import { Skeleton } from "@hci/shared/ui/skeleton";
import { useFacilityPipelineHistory } from "@/hooks/useFacilityCensus";
import { PIPELINE_STATUS_COLORS } from "@/lib/mobile-docs-constants";
import type { FacilityStatus } from "@/types/mobile-docs";

interface PipelineHistoryTimelineProps {
  facilityId: string;
}

export function PipelineHistoryTimeline({ facilityId }: PipelineHistoryTimelineProps) {
  const { data, isLoading } = useFacilityPipelineHistory(facilityId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No pipeline history recorded.</p>;
  }

  return (
    <div className="space-y-0">
      {data.map((entry, idx) => {
        const colors = PIPELINE_STATUS_COLORS[entry.to_status as FacilityStatus];
        const isLast = idx === data.length - 1;
        return (
          <div key={entry.id} className="relative flex gap-3 pb-4">
            {/* Connecting line */}
            {!isLast && (
              <div className="absolute left-[4.5px] top-5 bottom-0 w-px bg-border" />
            )}
            {/* Dot */}
            <div
              className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors.fill }}
            />
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {entry.from_status ? `${entry.from_status} → ${entry.to_status}` : entry.to_status}
                </span>
              </div>
              {entry.change_reason && (
                <p className="text-xs text-muted-foreground">{entry.change_reason}</p>
              )}
              <p className="text-[10px] text-muted-foreground">
                {new Date(entry.changed_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

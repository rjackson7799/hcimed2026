import { Card } from '@hci/shared/ui/card';
import { useMobileDocsCadenceStatus } from '@/hooks/useMobileDocsOperations';
import { cn } from '@hci/shared/lib/utils';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

const STATUS_COLORS: Record<string, { dot: string; text: string }> = {
  on_track: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  due_soon: { dot: 'bg-amber-400', text: 'text-amber-400' },
  overdue: { dot: 'bg-red-400', text: 'text-red-400' },
};

function daysSince(dateStr: string): number {
  const today = new Date('2026-03-12T00:00:00');
  const visit = new Date(dateStr + 'T00:00:00');
  return Math.floor((today.getTime() - visit.getTime()) / (1000 * 60 * 60 * 24));
}

export function CadenceComplianceList() {
  const { data, isLoading } = useMobileDocsCadenceStatus();

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </Card>
    );
  }

  const counts = {
    on_track: data.filter((f) => f.status === 'on_track').length,
    due_soon: data.filter((f) => f.status === 'due_soon').length,
    overdue: data.filter((f) => f.status === 'overdue').length,
  };

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Visit Cadence Compliance
      </h3>

      <div className="space-y-2.5">
        {data.map((facility) => {
          const colors = STATUS_COLORS[facility.status];
          const days = daysSince(facility.lastVisitDate);

          return (
            <div
              key={facility.facilityId}
              className="flex items-center gap-2.5 text-sm"
            >
              <span
                className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)}
              />
              <span className="flex-1 truncate font-medium text-foreground">
                {facility.name}
              </span>
              <span className="w-20 shrink-0 text-right text-muted-foreground">
                {facility.cadence}
              </span>
              <span
                className={cn(
                  'w-28 shrink-0 text-right',
                  colors.text,
                  facility.status === 'overdue' && 'font-bold'
                )}
              >
                {facility.status === 'overdue' && (
                  <AlertTriangle className="mr-1 inline-block h-3.5 w-3.5" />
                )}
                Last: {days}d ago
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          On track: {counts.on_track}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
          Due soon: {counts.due_soon}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          Overdue: {counts.overdue}
        </span>
      </div>
    </Card>
  );
}

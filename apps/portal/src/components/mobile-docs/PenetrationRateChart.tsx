import { Card } from '@hci/shared/ui/card';
import { useMobileDocsPenetration } from '@/hooks/useMobileDocsOperations';
import { PENETRATION_THRESHOLDS } from '@/lib/mobile-docs-constants';
import { formatPercentage } from '@/utils/practice-health-formatters';
import { Skeleton } from '@hci/shared/ui/skeleton';

function getBarColor(rate: number): string {
  if (rate >= PENETRATION_THRESHOLDS.high.min) return PENETRATION_THRESHOLDS.high.color;
  if (rate >= PENETRATION_THRESHOLDS.medium.min) return PENETRATION_THRESHOLDS.medium.color;
  return PENETRATION_THRESHOLDS.low.color;
}

export function PenetrationRateChart() {
  const { data, isLoading } = useMobileDocsPenetration();

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => b.penetrationRate - a.penetrationRate);

  const avgPenetration =
    sorted.reduce((sum, f) => sum + f.penetrationRate, 0) / sorted.length;

  const growthOpportunity = sorted.reduce((sum, f) => {
    if (f.penetrationRate < 35) {
      const needed = Math.ceil(0.35 * f.totalBeds) - f.activePatients;
      return sum + Math.max(0, needed);
    }
    return sum;
  }, 0);

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Bed Penetration by Facility
      </h3>

      <div className="space-y-3">
        {sorted.map((facility) => {
          const color = getBarColor(facility.penetrationRate);
          const widthPct = Math.min(facility.penetrationRate, 100);

          return (
            <div key={facility.facilityId}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium text-foreground">
                  {facility.name}
                </span>
                <span className="ml-2 shrink-0 text-muted-foreground">
                  {formatPercentage(facility.penetrationRate)} ({facility.activePatients}/{facility.totalBeds})
                </span>
              </div>
              <div className="mt-1 h-3.5 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Avg Penetration:{' '}
          <span className="font-semibold text-foreground">
            {formatPercentage(avgPenetration)}
          </span>
        </span>
        <span>
          Growth Opportunity:{' '}
          <span className="font-semibold text-foreground">
            +{growthOpportunity} beds to 35%
          </span>
        </span>
      </div>
    </Card>
  );
}

import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useCcmProgramSplit } from '@/hooks/useCcmRevenue';
import { CCM_CHART_COLORS } from '@/lib/ccm-rpm-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';

const PROGRAM_COLORS: Record<string, string> = {
  CCM: CCM_CHART_COLORS.ccm,
  RPM: CCM_CHART_COLORS.rpm,
};

export function ProgramSplitChart() {
  const { data, isLoading } = useCcmProgramSplit();

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    );
  }

  const totalEnrolled = data.reduce((s, d) => s + d.enrolledCount, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Program Split</h3>

      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalEnrolled} total enrolled</span>
        <span>{formatCurrency(totalRevenue)} total revenue</span>
      </div>

      <div className="space-y-4">
        {data.map((split) => {
          const color = PROGRAM_COLORS[split.program] ?? CCM_CHART_COLORS.ccm;
          return (
            <div key={split.program} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-foreground">{split.program}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{split.enrolledCount} enrolled</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(split.revenue)}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(split.percentage, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">{split.percentage}%</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

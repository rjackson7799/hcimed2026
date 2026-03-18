import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { cn } from '@hci/shared/lib/utils';
import { useCcmRevenueMetrics } from '@/hooks/useCcmRevenue';
import { formatCurrency } from '@/utils/practice-health-formatters';

const TARGET_MONTHLY_PER_PROVIDER = 11_400;
const PROVIDER_COUNT = 3;
const TARGET_MONTHLY_TOTAL = TARGET_MONTHLY_PER_PROVIDER * PROVIDER_COUNT; // $34,200

export function FinancialModelComparison() {
  const { data: metrics, isLoading } = useCcmRevenueMetrics();

  if (isLoading || !metrics) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[160px] w-full rounded-lg" />
      </Card>
    );
  }

  const currentEnrolled = metrics.providerBreakdown.reduce(
    (s, p) => s + p.enrolledCount,
    0,
  );
  const targetEnrolled = metrics.providerBreakdown.reduce(
    (s, p) => s + Math.round(p.assignedPatients * 0.65),
    0,
  );
  const dollarGap = TARGET_MONTHLY_TOTAL - metrics.monthlyActual;

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Financial Model Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Scenario</th>
              <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">Enrolled</th>
              <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">Monthly Revenue</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Gap</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2.5 pr-4 font-medium text-foreground">Current State</td>
              <td className="py-2.5 pr-4 text-right text-foreground">{currentEnrolled}</td>
              <td className="py-2.5 pr-4 text-right text-foreground">
                {formatCurrency(metrics.monthlyActual)}
              </td>
              <td className="py-2.5 text-right text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-medium text-foreground">
                Target (65% CCM / 35% RPM)
              </td>
              <td className="py-2.5 pr-4 text-right text-foreground">{targetEnrolled}</td>
              <td className="py-2.5 pr-4 text-right text-foreground">
                {formatCurrency(TARGET_MONTHLY_TOTAL)}
              </td>
              <td
                className={cn(
                  'py-2.5 text-right font-semibold',
                  dollarGap > 0 ? 'text-red-400' : 'text-emerald-400',
                )}
              >
                {dollarGap > 0
                  ? `−${formatCurrency(dollarGap)}`
                  : `+${formatCurrency(Math.abs(dollarGap))}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Target based on {PROVIDER_COUNT} providers at {formatCurrency(TARGET_MONTHLY_PER_PROVIDER)}/month
        each with 65% CCM and 35% RPM penetration.
      </p>
    </Card>
  );
}

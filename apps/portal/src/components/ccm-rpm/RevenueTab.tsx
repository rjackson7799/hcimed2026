import { useCcmRevenueMetrics } from '@/hooks/useCcmRevenue';
import { formatCurrency } from '@/utils/practice-health-formatters';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { RevenueMetricsCards } from './RevenueMetricsCards';
import { RevenueTrendChart } from './RevenueTrendChart';
import { ProgramSplitChart } from './ProgramSplitChart';
import { ProviderComparisonTable } from './ProviderComparisonTable';
import { FinancialModelComparison } from './FinancialModelComparison';

export function RevenueTab() {
  const { data: metrics, isLoading } = useCcmRevenueMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[108px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[44px] rounded-lg" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-lg" />
          <Skeleton className="h-[320px] rounded-lg" />
        </div>
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[160px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RevenueMetricsCards metrics={metrics} />

      {/* YTD Summary Banner */}
      <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Year-to-date:{' '}
          <span className="font-semibold text-foreground">
            {formatCurrency(metrics.ytdRevenue)}
          </span>
          {' — '}CCM:{' '}
          <span className="font-semibold text-foreground">
            {formatCurrency(metrics.ccmRevenue)}
          </span>
          {' / '}RPM:{' '}
          <span className="font-semibold text-foreground">
            {formatCurrency(metrics.rpmRevenue)}
          </span>
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueTrendChart />
        <ProgramSplitChart />
      </div>

      {/* Provider Comparison */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Provider Comparison</h3>
        <ProviderComparisonTable providers={metrics.providerBreakdown} showRevenue />
      </div>

      {/* Financial Model */}
      <FinancialModelComparison />
    </div>
  );
}

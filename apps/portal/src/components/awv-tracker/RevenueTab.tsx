import { useAuth } from '@/context/AuthContext';
import { useAwvRevenueMetrics } from '@/hooks/useAwvRevenue';
import { COMPLETION_RATE_THRESHOLDS } from '@/lib/awv-tracker-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';
import { cn } from '@hci/shared/lib/utils';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { DollarSign, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { RevenueTrendChart } from './RevenueTrendChart';
import { ServiceLineSplitChart } from './ServiceLineSplitChart';
import { ProviderCompletionTable } from './ProviderCompletionTable';

function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  valueColor,
  progress,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  valueColor?: string;
  progress?: { value: number; color: string };
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={cn('mt-2 text-2xl font-bold', valueColor ?? 'text-foreground')}>
        {value}
      </div>
      {progress && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(progress.value, 100)}%`, backgroundColor: progress.color }}
          />
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

function getCompletionRateColor(rate: number): string {
  if (rate >= COMPLETION_RATE_THRESHOLDS.green) return '#22c55e';
  if (rate >= COMPLETION_RATE_THRESHOLDS.amber) return '#f59e0b';
  return '#ef4444';
}

export function RevenueTab() {
  const { canViewRevenue } = useAuth();
  const { data: metrics, isLoading } = useAwvRevenueMetrics();

  const showDollars = canViewRevenue;

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[108px] rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[320px] rounded-lg" />
          <Skeleton className="h-[320px] rounded-lg" />
        </div>
        <Skeleton className="h-[200px] rounded-lg" />
      </div>
    );
  }

  const rateColor = getCompletionRateColor(metrics.captureRate);

  // Revenue projection
  const currentMonth = new Date().getMonth() + 1; // 1-based
  const projectedYearEnd = currentMonth > 0
    ? Math.round((metrics.revenueCapturedYtd / currentMonth) * 12)
    : 0;
  const revenueAt80 = Math.round(metrics.totalOpportunity * 0.8);
  const additionalAt80 = Math.max(0, revenueAt80 - metrics.revenueCapturedYtd);

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className={cn('grid gap-4', showDollars ? 'grid-cols-4' : 'grid-cols-3')}>
        {showDollars ? (
          <>
            <KpiCard
              title="Revenue Captured (YTD)"
              value={formatCurrency(metrics.revenueCapturedYtd)}
              subtext={`Avg ${formatCurrency(metrics.avgRevenuePerAwv)} per AWV`}
              icon={DollarSign}
              valueColor="text-emerald-400"
            />
            <KpiCard
              title="Revenue Remaining"
              value={formatCurrency(metrics.revenueRemaining)}
              subtext="From eligible not-yet-completed"
              icon={DollarSign}
            />
            <KpiCard
              title="Total Opportunity"
              value={formatCurrency(metrics.totalOpportunity)}
              subtext="Captured + Remaining"
              icon={TrendingUp}
            />
          </>
        ) : (
          <>
            <KpiCard
              title="Completed (YTD)"
              value={String(metrics.providerBreakdown.reduce((s, p) => s + p.completedYtd, 0))}
              subtext={`Avg ${formatCurrency(metrics.avgRevenuePerAwv)} per AWV`}
              icon={BarChart3}
              valueColor="text-emerald-400"
            />
            <KpiCard
              title="Outstanding"
              value={String(metrics.providerBreakdown.reduce((s, p) => s + p.outstanding, 0))}
              subtext="Eligible, not yet completed"
              icon={Target}
            />
          </>
        )}
        <KpiCard
          title="Capture Rate"
          value={`${metrics.captureRate}%`}
          subtext={metrics.captureRate >= 70 ? 'On target' : metrics.captureRate >= 40 ? 'Needs improvement' : 'Below target'}
          icon={Target}
          progress={{ value: metrics.captureRate, color: rateColor }}
        />
      </div>

      {/* Revenue Projection (admin only) */}
      {showDollars && (
        <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            If the current completion rate continues, projected year-end AWV revenue is{' '}
            <span className="font-semibold text-foreground">{formatCurrency(projectedYearEnd)}</span>.
            {additionalAt80 > 0 && (
              <>
                {' '}Reaching 80% completion would generate an additional{' '}
                <span className="font-semibold text-foreground">{formatCurrency(additionalAt80)}</span>.
              </>
            )}
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueTrendChart />
        <ServiceLineSplitChart showDollars={showDollars} />
      </div>

      {/* Provider Completion Table */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Provider Breakdown</h3>
        <ProviderCompletionTable
          providers={metrics.providerBreakdown}
          showRevenue={showDollars}
        />
      </div>
    </div>
  );
}

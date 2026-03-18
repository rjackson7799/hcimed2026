import { useAuth } from '@/context/AuthContext';
import { useAwvKpiSummary } from '@/hooks/useAwvRegistry';
import { COMPLETION_RATE_THRESHOLDS } from '@/lib/awv-tracker-constants';
import { cn } from '@hci/shared/lib/utils';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { Users, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

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

export function AwvKpiStrip() {
  const { canViewRevenue } = useAuth();
  const { data: kpi, isLoading } = useAwvKpiSummary();

  if (isLoading || !kpi) {
    return (
      <div className={cn('grid gap-4', canViewRevenue ? 'grid-cols-4' : 'grid-cols-3')}>
        {Array.from({ length: canViewRevenue ? 4 : 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[108px] rounded-lg" />
        ))}
      </div>
    );
  }

  const rateColor = getCompletionRateColor(kpi.completionRate);

  return (
    <div className={cn('grid gap-4', canViewRevenue ? 'grid-cols-4' : 'grid-cols-3')}>
      <KpiCard
        title="Eligible Patients"
        value={String(kpi.eligiblePatients)}
        subtext={`${kpi.pendingReview} pending review`}
        icon={Users}
      />
      <KpiCard
        title="Completed (YTD)"
        value={String(kpi.completedYtd)}
        subtext={`of ${kpi.totalEligible} eligible`}
        icon={CheckCircle}
        valueColor="text-emerald-400"
      />
      <KpiCard
        title="Completion Rate"
        value={`${kpi.completionRate}%`}
        subtext={kpi.completionRate >= 70 ? 'On target' : kpi.completionRate >= 40 ? 'Needs improvement' : 'Below target'}
        icon={TrendingUp}
        progress={{ value: kpi.completionRate, color: rateColor }}
      />
      {canViewRevenue && (
        <KpiCard
          title="Revenue Captured"
          value={`$${kpi.revenueCaptured.toLocaleString()}`}
          subtext={`~$${kpi.revenueRemaining.toLocaleString()} remaining`}
          icon={DollarSign}
        />
      )}
    </div>
  );
}

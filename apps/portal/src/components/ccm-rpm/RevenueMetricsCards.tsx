import { DollarSign, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import { formatCurrency } from '@/utils/practice-health-formatters';
import { COLLECTION_RATE_THRESHOLDS } from '@/lib/ccm-rpm-constants';
import type { CcmRevenueMetrics } from '@/types/ccm-rpm';

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
            style={{
              width: `${Math.min(progress.value, 100)}%`,
              backgroundColor: progress.color,
            }}
          />
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

function getCollectionRateColor(rate: number): string {
  if (rate >= COLLECTION_RATE_THRESHOLDS.green) return '#22c55e';
  if (rate >= COLLECTION_RATE_THRESHOLDS.amber) return '#f59e0b';
  return '#ef4444';
}

function getCollectionRateSubtext(rate: number): string {
  if (rate >= COLLECTION_RATE_THRESHOLDS.green) return 'On target';
  if (rate >= COLLECTION_RATE_THRESHOLDS.amber) return 'Needs improvement';
  return 'Below target';
}

export function RevenueMetricsCards({ metrics }: { metrics: CcmRevenueMetrics }) {
  const rateColor = getCollectionRateColor(metrics.collectionRate);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Monthly Revenue (Actual)"
        value={formatCurrency(metrics.monthlyActual)}
        subtext={`Avg ${formatCurrency(metrics.revenuePerEnrolled)} per enrolled`}
        icon={DollarSign}
        valueColor="text-emerald-400"
      />
      <KpiCard
        title="Monthly Expected"
        value={formatCurrency(metrics.monthlyExpected)}
        subtext="Based on enrolled CPT codes"
        icon={Target}
      />
      <KpiCard
        title="Collection Rate"
        value={`${metrics.collectionRate}%`}
        subtext={getCollectionRateSubtext(metrics.collectionRate)}
        icon={TrendingUp}
        progress={{ value: metrics.collectionRate, color: rateColor }}
      />
      <KpiCard
        title="Revenue Leakage"
        value={formatCurrency(metrics.revenuLeakage)}
        subtext="Expected minus actual"
        icon={AlertTriangle}
        valueColor={metrics.revenuLeakage > 0 ? 'text-red-400' : 'text-foreground'}
      />
    </div>
  );
}

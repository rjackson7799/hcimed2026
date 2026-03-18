import { useCcmKpiSummary } from '@/hooks/useCcmRegistry';
import { cn } from '@hci/shared/lib/utils';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { Users, TrendingUp, Cpu, DollarSign } from 'lucide-react';

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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className={cn('mt-1 text-2xl font-bold', valueColor ?? 'text-foreground')}>
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
      <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>
    </div>
  );
}

function getEnrollmentRateColor(rate: number): string {
  if (rate >= 65) return '#22c55e';
  if (rate >= 40) return '#f59e0b';
  return '#ef4444';
}

export function CcmRpmKpiStrip() {
  const { data: kpi, isLoading } = useCcmKpiSummary();

  if (isLoading || !kpi) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-lg" />
        ))}
      </div>
    );
  }

  const rateColor = getEnrollmentRateColor(kpi.enrollmentRate);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard
        title="Enrolled Patients"
        value={String(kpi.enrolledCount)}
        subtext={`${kpi.totalEligible - kpi.enrolledCount} eligible not yet enrolled`}
        icon={Users}
      />
      <KpiCard
        title="Enrollment Rate"
        value={`${kpi.enrollmentRate}%`}
        subtext={
          kpi.enrollmentRate >= 65
            ? 'On target'
            : kpi.enrollmentRate >= 40
              ? 'Needs improvement'
              : 'Below target'
        }
        icon={TrendingUp}
        progress={{ value: kpi.enrollmentRate, color: rateColor }}
      />
      <KpiCard
        title="Active RPM Devices"
        value={String(kpi.activeDevices)}
        subtext={`${kpi.patientsWithDevices} patients with devices`}
        icon={Cpu}
      />
      <KpiCard
        title="Monthly Revenue"
        value={`$${kpi.monthlyRevenueActual.toLocaleString()}`}
        subtext={`Expected: $${kpi.monthlyRevenueExpected.toLocaleString()}`}
        icon={DollarSign}
      />
    </div>
  );
}

import { KpiMetricCard } from '@/components/practice-health/KpiMetricCard';
import { useMobileDocsKpi } from '@/hooks/useMobileDocsKpi';
import { formatCurrency, formatNumber } from '@/utils/practice-health-formatters';
import { Skeleton } from '@hci/shared/ui/skeleton';

export function MobileDocsKpiStrip() {
  const { data: kpi, isLoading } = useMobileDocsKpi();

  if (isLoading || !kpi) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const pipelineLabel = `${kpi.pipelineBreakdown.prospecting} prospect · ${kpi.pipelineBreakdown.onboarding} onboard`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiMetricCard
        label="Monthly Revenue"
        value={formatCurrency(kpi.monthlyRevenue, true)}
        trend={kpi.trends.revenue}
      />
      <KpiMetricCard
        label="Revenue / Visit"
        value={formatCurrency(kpi.revenuePerVisit)}
        trend={kpi.trends.revenuePerVisit}
      />
      <KpiMetricCard
        label="Active Facilities"
        value={formatNumber(kpi.activeFacilities)}
        trend={kpi.trends.facilities}
      />
      <KpiMetricCard
        label="Total Patients"
        value={formatNumber(kpi.totalPatients)}
        trend={kpi.trends.patients}
      />
      <KpiMetricCard
        label="In Pipeline"
        value={formatNumber(kpi.pipelineCount)}
        trend={{ direction: 'flat', percentage: 0, label: pipelineLabel }}
      />
    </div>
  );
}

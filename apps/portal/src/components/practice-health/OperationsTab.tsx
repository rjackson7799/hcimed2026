import { VisitVolumeChart } from './VisitVolumeChart';
import { NoShowTrendChart } from './NoShowTrendChart';
import { WaitTimeDurationChart } from './WaitTimeDurationChart';
import { ScheduleUtilizationChart } from './ScheduleUtilizationChart';
import { useOperationalMetrics } from '@/hooks/useOperationalMetrics';
import type { KpiFilters } from '@/types/practice-health';

interface OperationsTabProps {
  filters: KpiFilters;
}

export function OperationsTab({ filters }: OperationsTabProps) {
  const { data } = useOperationalMetrics(filters);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <VisitVolumeChart data={data?.visitVolume ?? []} />
        <NoShowTrendChart data={data?.noShowTrend ?? []} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <WaitTimeDurationChart data={data?.waitTimes ?? []} />
        <ScheduleUtilizationChart data={data?.scheduleUtilization ?? []} />
      </div>
    </div>
  );
}

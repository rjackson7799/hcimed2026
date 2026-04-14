import { Skeleton } from '@hci/shared/ui/skeleton';
import { KpiMetricCard } from './KpiMetricCard';
import { useIncomeStreams } from '@/hooks/useIncomeStreams';
import { formatCurrency } from '@/utils/practice-health-formatters';
import type { KpiFilters } from '@/types/practice-health';

interface IncomeStreamsRowProps {
  filters: KpiFilters;
  ecwEstCollections: number;
  ecwEstCollectionsPrevious: number;
}

export function IncomeStreamsRow({ filters, ecwEstCollections, ecwEstCollectionsPrevious }: IncomeStreamsRowProps) {
  const { data, isLoading } = useIncomeStreams(filters, ecwEstCollections, ecwEstCollectionsPrevious);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Income Streams</p>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Income Streams</p>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiMetricCard
          label="AWV Revenue"
          value={formatCurrency(data.awv.current, true)}
          trend={data.awv.trend}
        />
        <KpiMetricCard
          label="CCM Revenue"
          value={formatCurrency(data.ccm.current, true)}
          trend={data.ccm.trend}
        />
        <KpiMetricCard
          label="RPM Revenue"
          value={formatCurrency(data.rpm.current, true)}
          trend={data.rpm.trend}
        />
        <KpiMetricCard
          label="Total Practice Revenue"
          value={formatCurrency(data.total.current, true)}
          trend={data.total.trend}
        />
      </div>
    </div>
  );
}

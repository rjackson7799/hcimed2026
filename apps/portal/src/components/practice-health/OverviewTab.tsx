import { ReportUploadHistory } from './ReportUploadHistory';
import { VisitVolumeChart } from './VisitVolumeChart';
import { ChargesCollectionsChart } from './ChargesCollectionsChart';
import { AiInsightsCard } from './AiInsightsCard';
import { useOperationalMetrics } from '@/hooks/useOperationalMetrics';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import type { KpiFilters } from '@/types/practice-health';

interface OverviewTabProps {
  filters: KpiFilters;
}

export function OverviewTab({ filters }: OverviewTabProps) {
  const { data: operational } = useOperationalMetrics(filters);
  const { data: financial } = useFinancialMetrics(filters);

  return (
    <div className="space-y-6">
      <AiInsightsCard filters={filters} />
      <div className="grid gap-6 lg:grid-cols-2">
        <VisitVolumeChart data={operational?.visitVolume ?? []} />
        <ChargesCollectionsChart data={financial?.chargesCollections ?? []} />
      </div>
      <ReportUploadHistory />
    </div>
  );
}

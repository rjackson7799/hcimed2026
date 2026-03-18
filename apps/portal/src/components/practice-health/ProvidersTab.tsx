import { ProviderProductivityTable } from './ProviderProductivityTable';
import { EmLevelDistribution } from './EmLevelDistribution';
import { useProviderProductivity } from '@/hooks/useProviderProductivity';
import type { KpiFilters } from '@/types/practice-health';

interface ProvidersTabProps {
  filters: KpiFilters;
}

export function ProvidersTab({ filters }: ProvidersTabProps) {
  const { data: providers } = useProviderProductivity(filters);

  return (
    <div className="space-y-6">
      <ProviderProductivityTable data={providers ?? []} />
      <EmLevelDistribution filters={filters} />
    </div>
  );
}

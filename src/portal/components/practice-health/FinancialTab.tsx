import { ChargesCollectionsChart } from './ChargesCollectionsChart';
import { PayerMixChart } from './PayerMixChart';
import { RevenueCycleLagChart } from './RevenueCycleLagChart';
import { useFinancialMetrics } from '@/portal/hooks/useFinancialMetrics';
import type { KpiFilters } from '@/portal/types/practice-health';

interface FinancialTabProps {
  filters: KpiFilters;
}

export function FinancialTab({ filters }: FinancialTabProps) {
  const { data } = useFinancialMetrics(filters);

  return (
    <div className="space-y-6">
      <ChargesCollectionsChart data={data?.chargesCollections ?? []} />
      <div className="grid gap-6 lg:grid-cols-2">
        <PayerMixChart data={data?.payerMix ?? []} />
        <RevenueCycleLagChart data={data?.revenueCycleLag ?? []} />
      </div>
    </div>
  );
}

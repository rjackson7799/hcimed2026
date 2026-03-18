import { Card } from '@hci/shared/ui/card';
import { RevenueTrendChart } from './RevenueTrendChart';
import { RevenueMetrics } from './RevenueMetrics';
import { FacilityRevenueTable } from './FacilityRevenueTable';

export function RevenueSection() {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Revenue &amp; Financial Health
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueTrendChart />
        <RevenueMetrics />
      </div>

      <div className="mt-4">
        <FacilityRevenueTable />
      </div>
    </Card>
  );
}

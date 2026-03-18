import { PenetrationRateChart } from './PenetrationRateChart';
import { CensusTrendChart } from './CensusTrendChart';
import { CadenceComplianceList } from './CadenceComplianceList';
import { AttentionAlerts } from './AttentionAlerts';

export function OperationsTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <PenetrationRateChart />
        <CensusTrendChart />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CadenceComplianceList />
        <AttentionAlerts />
      </div>
    </div>
  );
}

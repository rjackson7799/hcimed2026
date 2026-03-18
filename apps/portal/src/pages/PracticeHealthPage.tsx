import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@hci/shared/ui/tabs';
import { Activity } from 'lucide-react';
import { SummaryHeader } from '@/components/practice-health/SummaryHeader';
import { OverviewTab } from '@/components/practice-health/OverviewTab';
import { ProvidersTab } from '@/components/practice-health/ProvidersTab';
import { FinancialTab } from '@/components/practice-health/FinancialTab';
import { OperationsTab } from '@/components/practice-health/OperationsTab';
import { PH_TABS } from '@/lib/practice-health-constants';
import type { PhTabId } from '@/lib/practice-health-constants';
import type { KpiFilters } from '@/types/practice-health';

function getDefaultFilters(): KpiFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    dateRange: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      preset: 'month',
    },
    serviceLine: 'all',
  };
}

export function PracticeHealthPage() {
  const [tab, setTab] = useState<PhTabId>('overview');
  const [filters, setFilters] = useState<KpiFilters>(getDefaultFilters);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-display">Practice Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Analytics dashboard for practice performance</p>
        </div>
      </div>

      <SummaryHeader filters={filters} onFiltersChange={setFilters} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as PhTabId)}>
        <TabsList>
          {PH_TABS.map(t => (
            <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <OverviewTab filters={filters} />
        </TabsContent>
        <TabsContent value="providers" className="mt-4">
          <ProvidersTab filters={filters} />
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <FinancialTab filters={filters} />
        </TabsContent>
        <TabsContent value="operations" className="mt-4">
          <OperationsTab filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

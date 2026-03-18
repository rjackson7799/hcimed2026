import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hci/shared/ui/tabs';
import { AWV_TABS, type AwvTabId } from '@/lib/awv-tracker-constants';
import { RegistryTab } from './RegistryTab';
import { UploadTab } from './UploadTab';
import { RevenueTab } from './RevenueTab';

export function AwvTrackerPage() {
  const [activeTab, setActiveTab] = useState<AwvTabId>('registry');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AWV Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Track Annual Wellness Visit eligibility, completion, and revenue
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AwvTabId)}>
        <TabsList>
          {AWV_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="registry" className="mt-4">
          <RegistryTab />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <UploadTab />
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <RevenueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

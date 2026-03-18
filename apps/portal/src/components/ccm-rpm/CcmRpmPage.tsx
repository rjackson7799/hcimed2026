import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hci/shared/ui/tabs';
import { CCM_RPM_TABS, type CcmRpmTabId } from '@/lib/ccm-rpm-constants';
import { RegistryTab } from './RegistryTab';
import { RevenueTab } from './RevenueTab';
import { UploadTab } from './UploadTab';
import { EnrollmentDevicesTab } from './EnrollmentDevicesTab';

export function CcmRpmPage() {
  const [activeTab, setActiveTab] = useState<CcmRpmTabId>('registry');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CCM / RPM Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Track chronic care management &amp; remote patient monitoring enrollment, devices, and revenue
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CcmRpmTabId)}>
        <TabsList>
          {CCM_RPM_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="registry" className="mt-4">
          <RegistryTab />
        </TabsContent>

        <TabsContent value="enrollment-devices" className="mt-4">
          <EnrollmentDevicesTab />
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <RevenueTab />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <UploadTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

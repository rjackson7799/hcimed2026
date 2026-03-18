import { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hci/shared/ui/tabs';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { MobileDocsKpiStrip } from './MobileDocsKpiStrip';
import { RevenueSection } from './RevenueSection';
import { GrowthTab } from './GrowthTab';
import { OperationsTab } from './OperationsTab';
import { FacilityDirectory } from './FacilityDirectory';
import { MOBILE_DOCS_TABS, type MobileDocsTabId } from '@/lib/mobile-docs-constants';

const MapTab = lazy(() =>
  import('./MapTab').then((m) => ({ default: m.MapTab }))
);

export function MobileDocsPage() {
  const [activeTab, setActiveTab] = useState<MobileDocsTabId>('directory');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Mobile Docs</h1>
        <p className="text-sm text-muted-foreground">Program health &amp; operational intelligence</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MobileDocsTabId)}>
        <TabsList>
          {MOBILE_DOCS_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="directory">
          <FacilityDirectory />
        </TabsContent>
        <TabsContent value="growth">
          <MobileDocsKpiStrip />
          <div className="mt-6">
            <RevenueSection />
          </div>
          <div className="mt-6">
            <GrowthTab />
          </div>
        </TabsContent>
        <TabsContent value="operations">
          <MobileDocsKpiStrip />
          <div className="mt-6">
            <RevenueSection />
          </div>
          <div className="mt-6">
            <OperationsTab />
          </div>
        </TabsContent>
        <TabsContent value="map" className="mt-0">
          <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
            <MapTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

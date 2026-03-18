import { useState, useMemo } from 'react';
import { useFacilities } from '@/hooks/useFacilities';
import { FacilityMap } from './FacilityMap';
import { FacilityDetailPanel } from './FacilityDetailPanel';
import { Skeleton } from '@hci/shared/ui/skeleton';
import type { FacilityCensus } from '@/types/mobile-docs';
import { getMockFacilityCensus } from '@/lib/mobile-docs-mock-data';

export function MapTab() {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const { data: facilities, isLoading } = useFacilities();

  // Build census lookup map for pin sizing
  const censusMap = useMemo(() => {
    const map = new Map<string, FacilityCensus>();
    if (facilities) {
      for (const f of facilities) {
        const census = getMockFacilityCensus(f.id);
        if (census) map.set(f.id, census);
      }
    }
    return map;
  }, [facilities]);

  if (isLoading || !facilities) {
    return <Skeleton className="h-[500px] w-full rounded-lg" />;
  }

  return (
    <>
      <FacilityMap
        facilities={facilities}
        censusMap={censusMap}
        onFacilityClick={setSelectedFacilityId}
      />
      <FacilityDetailPanel
        facilityId={selectedFacilityId}
        onClose={() => setSelectedFacilityId(null)}
      />
    </>
  );
}

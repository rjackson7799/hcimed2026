import { PipelineFunnelChart } from '@/components/mobile-docs/PipelineFunnelChart';
import { FacilityGrowthChart } from '@/components/mobile-docs/FacilityGrowthChart';
import { FacilityMixDonut } from '@/components/mobile-docs/FacilityMixDonut';
import { PipelineActivityFeed } from '@/components/mobile-docs/PipelineActivityFeed';

export function GrowthTab() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <PipelineFunnelChart />
        <FacilityGrowthChart />
      </div>
      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <FacilityMixDonut />
        <PipelineActivityFeed />
      </div>
    </div>
  );
}

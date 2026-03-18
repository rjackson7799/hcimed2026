import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useMobileDocsPipelineStages, useMobileDocsPipelineMetrics } from '@/hooks/useMobileDocsPipeline';
import { PIPELINE_STATUS_COLORS } from '@/lib/mobile-docs-constants';
import type { FacilityStatus } from '@/types/mobile-docs';

export function PipelineFunnelChart() {
  const { data: stages, isLoading: stagesLoading } = useMobileDocsPipelineStages();
  const { data: metrics, isLoading: metricsLoading } = useMobileDocsPipelineMetrics();

  if (stagesLoading || metricsLoading || !stages || !metrics) {
    return (
      <Card className="p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Pipeline Status</h3>

      <div className="space-y-4">
        {stages.map((stage) => {
          const colors = PIPELINE_STATUS_COLORS[stage.stage as FacilityStatus];
          const widthPct = (stage.count / maxCount) * 100;

          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors.fill }}
                  />
                  <span className="text-sm text-slate-300">{stage.stage}</span>
                </div>
                <span className="text-sm font-medium text-slate-200">{stage.count}</span>
              </div>

              <div className="relative h-7 rounded bg-slate-800">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: colors.fill,
                    opacity: 0.3,
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center px-2 overflow-hidden"
                  style={{ maxWidth: `${widthPct}%` }}
                >
                  <span className="text-xs text-slate-300 truncate">
                    {stage.facilities.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{metrics.conversionRate}%</p>
          <p className="text-xs text-slate-400">Conversion Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">{metrics.avgDaysToActive} days</p>
          <p className="text-xs text-slate-400">Avg Days to Active</p>
        </div>
      </div>
    </Card>
  );
}

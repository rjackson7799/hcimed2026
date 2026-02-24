import { Card } from '@/components/ui/card';
import type { ProjectSummary } from '@/portal/types';

interface PipelineFunnelProps {
  summary: ProjectSummary;
}

const FUNNEL_STAGES = [
  { key: 'total_patients', label: 'Total Patients', color: 'bg-blue-500' },
  { key: 'called', label: 'Called', color: 'bg-sky-500' },
  { key: 'will_switch', label: 'Will Switch', color: 'bg-green-500' },
  { key: 'forwarded_to_broker', label: 'Forwarded to Broker', color: 'bg-purple-500' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-500' },
] as const;

export function PipelineFunnel({ summary }: PipelineFunnelProps) {
  const maxValue = Math.max(summary.total_patients, 1);

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Pipeline Funnel</p>
      <div className="space-y-3">
        {FUNNEL_STAGES.map((stage) => {
          const value = Number(summary[stage.key as keyof ProjectSummary]) || 0;
          const percentage = Math.round((value / maxValue) * 100);
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{stage.label}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-6 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

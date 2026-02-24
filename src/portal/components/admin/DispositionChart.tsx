import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import type { ProjectSummary } from '@/portal/types';

interface DispositionChartProps {
  summary: ProjectSummary;
}

const CHART_DATA_MAP: { key: keyof ProjectSummary; label: string; color: string }[] = [
  { key: 'uncalled', label: 'Not Called', color: '#3b82f6' },
  { key: 'no_answer', label: 'No Answer', color: '#9ca3af' },
  { key: 'needs_more_info', label: 'Needs Info', color: '#eab308' },
  { key: 'not_interested', label: 'Not Interested', color: '#f97316' },
  { key: 'will_switch', label: 'Will Switch', color: '#22c55e' },
  { key: 'forwarded_to_broker', label: 'Forwarded', color: '#a855f7' },
  { key: 'wrong_number', label: 'Wrong Number', color: '#ef4444' },
  { key: 'completed', label: 'Completed', color: '#10b981' },
  { key: 'unable_to_complete', label: 'Unable', color: '#dc2626' },
];

export function DispositionChart({ summary }: DispositionChartProps) {
  const data = CHART_DATA_MAP
    .map((item) => ({
      name: item.label,
      value: Number(summary[item.key]) || 0,
      color: item.color,
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Disposition Breakdown</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Disposition Breakdown</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, 'Patients']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

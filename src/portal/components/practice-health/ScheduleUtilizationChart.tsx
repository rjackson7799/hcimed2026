import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import type { UtilizationPoint } from '@/portal/hooks/useOperationalMetrics';

interface ScheduleUtilizationChartProps {
  data: UtilizationPoint[];
}

export function ScheduleUtilizationChart({ data }: ScheduleUtilizationChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Schedule Utilization</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Schedule Utilization</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="%" domain={[0, 100]} />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']} />
          <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#22c55e' }} />
          <Bar dataKey="utilization" name="Utilization" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

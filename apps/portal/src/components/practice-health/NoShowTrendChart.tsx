import { Card } from '@hci/shared/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { BENCHMARKS } from '@/lib/practice-health-constants';
import type { NoShowPoint } from '@/hooks/useOperationalMetrics';

interface NoShowTrendChartProps {
  data: NoShowPoint[];
}

export function NoShowTrendChart({ data }: NoShowTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">No-Show Rate</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">No-Show Rate</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="%" />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'No-Show Rate']} />
          <ReferenceLine y={BENCHMARKS.noShowRate} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Threshold', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          <Line type="monotone" dataKey="noShowRate" name="No-Show Rate" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

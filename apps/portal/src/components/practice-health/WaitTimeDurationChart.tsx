import { Card } from '@hci/shared/ui/card';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { BENCHMARKS } from '@/lib/practice-health-constants';
import type { WaitTimePoint } from '@/hooks/useOperationalMetrics';

interface WaitTimeDurationChartProps {
  data: WaitTimePoint[];
}

export function WaitTimeDurationChart({ data }: WaitTimeDurationChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Wait Time & Visit Duration</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Wait Time & Visit Duration</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" unit=" min" />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} min`]} />
          <Legend />
          <ReferenceLine y={BENCHMARKS.avgWaitTimeMinutes} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Wait Target', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          <Bar dataKey="avgWaitTime" name="Avg Wait Time" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="avgDuration" name="Avg Duration" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

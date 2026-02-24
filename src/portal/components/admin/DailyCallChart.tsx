import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import type { DailyCallVolume } from '@/portal/types';

interface DailyCallChartProps {
  data: DailyCallVolume[];
}

export function DailyCallChart({ data }: DailyCallChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Daily Call Volume</p>
        <p className="text-sm text-muted-foreground text-center py-8">No call data yet</p>
      </Card>
    );
  }

  // Aggregate by date, summing call_count and positive_outcomes
  const aggregated = data.reduce<Record<string, { date: string; calls: number; positive: number }>>((acc, d) => {
    const dateStr = new Date(d.call_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, calls: 0, positive: 0 };
    }
    acc[dateStr].calls += d.call_count;
    acc[dateStr].positive += d.positive_outcomes;
    return acc;
  }, {});

  const chartData = Object.values(aggregated).slice(-14); // Last 14 days

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Daily Call Volume (Last 14 Days)</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            allowDecimals={false}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="calls" name="Total Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="positive" name="Positive Outcomes" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

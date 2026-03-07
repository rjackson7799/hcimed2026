import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { BENCHMARKS } from '@/portal/lib/practice-health-constants';
import type { LagEntry } from '@/portal/hooks/useFinancialMetrics';

interface RevenueCycleLagChartProps {
  data: LagEntry[];
}

export function RevenueCycleLagChart({ data }: RevenueCycleLagChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Revenue Cycle Lag</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Revenue Cycle Lag (Avg Days to Claim)</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <Tooltip formatter={(value: number) => [`${value} days`, 'Avg Lag']} />
          <ReferenceLine y={BENCHMARKS.daysInAr} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          <Bar dataKey="avgLagDays" name="Avg Days" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatPercentage } from '@/portal/utils/practice-health-formatters';
import type { PayerMixEntry } from '@/portal/types/practice-health';

interface PayerMixChartProps {
  data: PayerMixEntry[];
}

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#eab308', '#ef4444', '#06b6d4', '#ec4899'];

export function PayerMixChart({ data }: PayerMixChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Payer Mix</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  const chartData = data.slice(0, 8).map((d, i) => ({
    name: d.payer,
    value: d.charges,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Payer Mix</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => <span className="text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

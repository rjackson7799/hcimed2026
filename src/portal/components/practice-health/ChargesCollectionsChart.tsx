import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/portal/utils/practice-health-formatters';
import type { TimeSeriesPoint } from '@/portal/hooks/useFinancialMetrics';

interface ChargesCollectionsChartProps {
  data: TimeSeriesPoint[];
}

export function ChargesCollectionsChart({ data }: ChargesCollectionsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium mb-4">Charges vs. Collections</p>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium mb-4">Charges vs. Collections</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => formatCurrency(v, true)} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="billed" name="Billed Charges" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="collections" name="Est. Collections" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

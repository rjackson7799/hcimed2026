import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useAwvMonthlyRevenue } from '@/hooks/useAwvRevenue';
import { formatCurrency } from '@/utils/practice-health-formatters';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p: any) => p.dataKey === 'revenue');
  const count = payload.find((p: any) => p.dataKey === 'awvCount');
  const addonRev = payload.find((p: any) => p.dataKey === 'addonRevenue');

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      {revenue && (
        <p className="text-muted-foreground">
          Revenue: <span className="font-semibold text-foreground">{formatCurrency(revenue.value)}</span>
        </p>
      )}
      {addonRev && addonRev.value > 0 && (
        <p className="text-muted-foreground">
          Add-on: <span className="font-semibold text-foreground">{formatCurrency(addonRev.value)}</span>
        </p>
      )}
      {count && (
        <p className="text-muted-foreground">
          AWVs: <span className="font-semibold text-foreground">{count.value}</span>
        </p>
      )}
    </div>
  );
}

export function RevenueTrendChart() {
  const { data, isLoading } = useAwvMonthlyRevenue();

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Monthly Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => formatCurrency(v, true)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="#7c3aed"
            radius={[4, 4, 0, 0]}
            name="Revenue"
          />
          <Line
            yAxisId="right"
            dataKey="awvCount"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 3 }}
            name="AWV Count"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

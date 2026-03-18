import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useAwvServiceLineSplit } from '@/hooks/useAwvRevenue';
import { SERVICE_LINE_CHART_COLORS } from '@/lib/awv-tracker-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const { serviceLine, revenue, completedCount, percentage } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{serviceLine}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">{formatCurrency(revenue)}</span>
      </p>
      <p className="text-muted-foreground">
        Completed: <span className="font-semibold text-foreground">{completedCount}</span> ({percentage}%)
      </p>
    </div>
  );
}

export function ServiceLineSplitChart({ showDollars = true }: { showDollars?: boolean }) {
  const { data, isLoading } = useAwvServiceLineSplit();

  if (isLoading || !data) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    );
  }

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalCount = data.reduce((s, d) => s + d.completedCount, 0);

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Service Line Split</h3>
      <div className="relative" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="serviceLine"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.serviceLine}
                  fill={SERVICE_LINE_CHART_COLORS[entry.serviceLine]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {showDollars ? formatCurrency(totalRevenue, true) : totalCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {showDollars ? 'Total' : 'AWVs'}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-6">
        {data.map((entry) => (
          <div key={entry.serviceLine} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SERVICE_LINE_CHART_COLORS[entry.serviceLine] }}
            />
            <span className="text-muted-foreground">{entry.serviceLine}</span>
            <span className="font-medium text-foreground">
              {showDollars ? formatCurrency(entry.revenue, true) : entry.completedCount}
            </span>
            <span className="text-muted-foreground">({entry.percentage}%)</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

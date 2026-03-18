import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useCcmMonthlyRevenue } from '@/hooks/useCcmRevenue';
import { CCM_CHART_COLORS } from '@/lib/ccm-rpm-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;

  const ccm = payload.find((p: any) => p.dataKey === 'ccmRevenue');
  const rpm = payload.find((p: any) => p.dataKey === 'rpmRevenue');
  const total = payload.find((p: any) => p.dataKey === 'totalRevenue');
  const expected = payload.find((p: any) => p.dataKey === 'expectedRevenue');

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      {ccm && (
        <p className="text-muted-foreground">
          CCM Revenue: <span className="font-semibold text-foreground">{formatCurrency(ccm.value)}</span>
        </p>
      )}
      {rpm && (
        <p className="text-muted-foreground">
          RPM Revenue: <span className="font-semibold text-foreground">{formatCurrency(rpm.value)}</span>
        </p>
      )}
      {total && (
        <p className="text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatCurrency(total.value)}</span>
        </p>
      )}
      {expected && (
        <p className="text-muted-foreground">
          Expected: <span className="font-semibold text-foreground">{formatCurrency(expected.value)}</span>
        </p>
      )}
    </div>
  );
}

export function RevenueTrendChart() {
  const { data, isLoading } = useCcmMonthlyRevenue();

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
            dataKey="monthLabel"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => formatCurrency(v, true)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="ccmRevenue"
            stackId="revenue"
            fill={CCM_CHART_COLORS.ccm}
            fillOpacity={0.3}
            stroke={CCM_CHART_COLORS.ccm}
            strokeWidth={2}
            name="CCM Revenue"
          />
          <Area
            type="monotone"
            dataKey="rpmRevenue"
            stackId="revenue"
            fill={CCM_CHART_COLORS.rpm}
            fillOpacity={0.3}
            stroke={CCM_CHART_COLORS.rpm}
            strokeWidth={2}
            name="RPM Revenue"
          />
          <Line
            type="monotone"
            dataKey="expectedRevenue"
            stroke={CCM_CHART_COLORS.expected}
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name="Expected Revenue"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CCM_CHART_COLORS.ccm }} />
          <span className="text-muted-foreground">CCM</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CCM_CHART_COLORS.rpm }} />
          <span className="text-muted-foreground">RPM</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2.5 w-6 border-t-2 border-dashed" style={{ borderColor: CCM_CHART_COLORS.expected }} />
          <span className="text-muted-foreground">Expected</span>
        </div>
      </div>
    </Card>
  );
}

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { useFacilityCensusTrend } from '@/hooks/useFacilityCensus';
import { PENETRATION_THRESHOLDS } from '@/lib/mobile-docs-constants';

interface PenetrationTrendChartProps {
  facilityId: string;
  totalBeds: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">
        {payload[0].value}% penetration
      </p>
    </div>
  );
}

export function PenetrationTrendChart({ facilityId, totalBeds }: PenetrationTrendChartProps) {
  const { data: censusEntries, isLoading } = useFacilityCensusTrend(facilityId);

  if (isLoading || !censusEntries) {
    return <Skeleton className="h-[160px] w-full rounded-lg" />;
  }

  const chartData = censusEntries.map((entry) => ({
    date: new Date(entry.snapshot_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    penetration: Math.round((entry.active_patients / totalBeds) * 1000) / 10,
  }));

  const latestPenetration = chartData[chartData.length - 1]?.penetration ?? 0;
  const chartColor =
    latestPenetration >= PENETRATION_THRESHOLDS.high.min
      ? PENETRATION_THRESHOLDS.high.color
      : latestPenetration >= PENETRATION_THRESHOLDS.medium.min
        ? PENETRATION_THRESHOLDS.medium.color
        : PENETRATION_THRESHOLDS.low.color;

  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2">Penetration Rate</h4>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="penetrationGradientFacility" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="penetration"
            stroke={chartColor}
            strokeWidth={2}
            fill="url(#penetrationGradientFacility)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

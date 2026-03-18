import { Card } from '@hci/shared/ui/card';
import { Skeleton } from '@hci/shared/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMobileDocsFacilityGrowth } from '@/hooks/useMobileDocsPipeline';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((entry: { dataKey: string; color: string; name: string; value: number }) => (
        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function FacilityGrowthChart() {
  const { data, isLoading } = useMobileDocsFacilityGrowth();

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[240px] rounded" />
      </Card>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    month: new Date(point.date + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
  }));

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Facility Growth</h3>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={28}
            wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#60a5fa"
            strokeDasharray="5 5"
            fill="#60a5fa"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="active"
            name="Active"
            stroke="#34d399"
            fill="#34d399"
            fillOpacity={0.4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

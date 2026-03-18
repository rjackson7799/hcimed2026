import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useFacilityCensusTrend } from '@/hooks/useFacilityCensus';
import { formatNumber } from '@/utils/practice-health-formatters';
import { Skeleton } from '@hci/shared/ui/skeleton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{formatNumber(payload[0].value)} patients</p>
    </div>
  );
}

export function FacilityCensusTrendChart({ facilityId }: { facilityId: string }) {
  const { data: censusEntries, isLoading } = useFacilityCensusTrend(facilityId);

  if (isLoading) {
    return <Skeleton className="h-[180px] w-full rounded-lg" />;
  }

  const chartData = (censusEntries ?? []).map((entry) => ({
    date: new Date(entry.snapshot_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    patients: entry.active_patients,
  }));

  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2">Active Patients</h4>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="censusGradientFacility" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="patients" stroke="#34d399" strokeWidth={2} fill="url(#censusGradientFacility)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

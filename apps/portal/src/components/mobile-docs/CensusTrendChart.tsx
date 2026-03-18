import { Card } from '@hci/shared/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useMobileDocsCensusTrend,
  useMobileDocsEnrollment,
} from '@/hooks/useMobileDocsOperations';
import { formatNumber, formatPercentage } from '@/utils/practice-health-formatters';
import { ANCILLARY_COLORS } from '@/lib/mobile-docs-constants';
import { Skeleton } from '@hci/shared/ui/skeleton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">
        {formatNumber(payload[0].value)} patients
      </p>
    </div>
  );
}

interface EnrollmentMiniCardProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function EnrollmentMiniCard({ label, count, total, color }: EnrollmentMiniCardProps) {
  const pct = total > 0 ? count / total : 0;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color }}>
        {formatNumber(count)}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatPercentage(pct)} of patients
      </p>
    </div>
  );
}

export function CensusTrendChart() {
  const { data: censusData, isLoading: censusLoading } = useMobileDocsCensusTrend();
  const { data: enrollment, isLoading: enrollmentLoading } = useMobileDocsEnrollment();

  if (censusLoading || enrollmentLoading || !censusData || !enrollment) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Patient Census Trend
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={censusData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="censusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalPatients"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#censusGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <EnrollmentMiniCard
          label="CCM Enrolled"
          count={enrollment.ccmEnrolled}
          total={enrollment.totalPatients}
          color={ANCILLARY_COLORS.ccm}
        />
        <EnrollmentMiniCard
          label="RPM Enrolled"
          count={enrollment.rpmEnrolled}
          total={enrollment.totalPatients}
          color={ANCILLARY_COLORS.rpm}
        />
        <EnrollmentMiniCard
          label="AWV Eligible"
          count={enrollment.awvEligible}
          total={enrollment.totalPatients}
          color={ANCILLARY_COLORS.awv}
        />
      </div>
    </Card>
  );
}

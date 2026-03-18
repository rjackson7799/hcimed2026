import { Card } from '@hci/shared/ui/card';
import { useMobileDocsKpi } from '@/hooks/useMobileDocsKpi';
import { useMobileDocsAncillaryRevenue } from '@/hooks/useMobileDocsRevenue';
import { formatCurrency, formatNumber } from '@/utils/practice-health-formatters';
import { ANCILLARY_COLORS } from '@/lib/mobile-docs-constants';
import { Skeleton } from '@hci/shared/ui/skeleton';

interface MetricBlockProps {
  label: string;
  value: string;
}

function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-muted/50 p-3">
      <span className="text-xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

interface AncillaryCardProps {
  label: string;
  value: string;
  accentColor: string;
}

function AncillaryCard({ label, value, accentColor }: AncillaryCardProps) {
  return (
    <div
      className="rounded-lg bg-muted/50 p-3"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function RevenueMetrics() {
  const { data: kpi, isLoading: kpiLoading } = useMobileDocsKpi();
  const { data: ancillary, isLoading: ancillaryLoading } = useMobileDocsAncillaryRevenue();

  if (kpiLoading || ancillaryLoading || !kpi || !ancillary) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    );
  }

  const revenuePerPatient = kpi.totalPatients > 0
    ? kpi.monthlyRevenue / kpi.totalPatients
    : 0;

  const visitsThisMonth = kpi.revenuePerVisit > 0
    ? Math.round(kpi.monthlyRevenue / kpi.revenuePerVisit)
    : 0;

  return (
    <Card className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold text-foreground">Revenue Metrics</h3>

      <div className="grid grid-cols-3 gap-3">
        <MetricBlock label="Per Visit" value={formatCurrency(kpi.revenuePerVisit)} />
        <MetricBlock label="Per Patient" value={formatCurrency(revenuePerPatient)} />
        <MetricBlock label="Visits This Mo." value={formatNumber(visitsThisMonth)} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AncillaryCard
          label="CCM Revenue"
          value={formatCurrency(ancillary.ccm)}
          accentColor={ANCILLARY_COLORS.ccm}
        />
        <AncillaryCard
          label="RPM Revenue"
          value={formatCurrency(ancillary.rpm)}
          accentColor={ANCILLARY_COLORS.rpm}
        />
        <AncillaryCard
          label="AWV Revenue"
          value={formatCurrency(ancillary.awv)}
          accentColor={ANCILLARY_COLORS.awv}
        />
      </div>
    </Card>
  );
}

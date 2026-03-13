import type { FacilityCensus } from "@/portal/types/mobile-docs";
import { ANCILLARY_COLORS } from "@/portal/lib/mobile-docs-constants";
import { formatNumber, formatPercentage } from "@/portal/utils/practice-health-formatters";

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

export function EnrollmentBreakdownCard({ census }: { census: FacilityCensus }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <EnrollmentMiniCard
        label="CCM"
        count={census.ccm_enrolled}
        total={census.active_patients}
        color={ANCILLARY_COLORS.ccm}
      />
      <EnrollmentMiniCard
        label="RPM"
        count={census.rpm_enrolled}
        total={census.active_patients}
        color={ANCILLARY_COLORS.rpm}
      />
      <EnrollmentMiniCard
        label="AWV"
        count={census.awv_eligible}
        total={census.active_patients}
        color={ANCILLARY_COLORS.awv}
      />
    </div>
  );
}

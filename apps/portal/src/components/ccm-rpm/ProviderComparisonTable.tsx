import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@hci/shared/ui/table';
import { COLLECTION_RATE_THRESHOLDS } from '@/lib/ccm-rpm-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';
import type { CcmProviderMetrics } from '@/types/ccm-rpm';

function getEnrollmentRateColor(rate: number): string {
  if (rate >= COLLECTION_RATE_THRESHOLDS.green) return '#22c55e';
  if (rate >= COLLECTION_RATE_THRESHOLDS.amber) return '#f59e0b';
  return '#ef4444';
}

export function ProviderComparisonTable({
  providers,
  showRevenue = true,
}: {
  providers: CcmProviderMetrics[];
  showRevenue?: boolean;
}) {
  const sorted = [...providers].sort((a, b) => b.enrollmentRate - a.enrollmentRate);

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">Assigned</TableHead>
            <TableHead className="text-right">Enrolled</TableHead>
            <TableHead className="w-[140px]">Rate %</TableHead>
            <TableHead className="text-right">CCM Only</TableHead>
            <TableHead className="text-right">Dual</TableHead>
            <TableHead className="text-right">RPM Only</TableHead>
            <TableHead className="text-right">Declined</TableHead>
            {showRevenue && <TableHead className="text-right">Monthly Revenue</TableHead>}
            {showRevenue && <TableHead className="text-right">Rev/Enrolled</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => {
            const rateColor = getEnrollmentRateColor(p.enrollmentRate);
            return (
              <TableRow key={p.providerId}>
                <TableCell className="font-medium">{p.providerName}</TableCell>
                <TableCell className="text-right">{p.assignedPatients}</TableCell>
                <TableCell className="text-right">{p.enrolledCount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(p.enrollmentRate, 100)}%`,
                          backgroundColor: rateColor,
                        }}
                      />
                    </div>
                    <span
                      className="w-10 text-right text-xs font-medium"
                      style={{ color: rateColor }}
                    >
                      {p.enrollmentRate}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{p.ccmOnlyCount}</TableCell>
                <TableCell className="text-right">{p.dualCount}</TableCell>
                <TableCell className="text-right">{p.rpmOnlyCount}</TableCell>
                <TableCell className="text-right">{p.declinedCount}</TableCell>
                {showRevenue && (
                  <TableCell className="text-right">{formatCurrency(p.monthlyRevenue)}</TableCell>
                )}
                {showRevenue && (
                  <TableCell className="text-right">
                    {formatCurrency(p.revenuePerEnrolled)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

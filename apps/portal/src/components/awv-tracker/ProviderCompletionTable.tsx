import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@hci/shared/ui/table';
import type { AwvProviderMetrics } from '@/types/awv-tracker';
import { COMPLETION_RATE_THRESHOLDS } from '@/lib/awv-tracker-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';

function getCompletionRateColor(rate: number): string {
  if (rate >= COMPLETION_RATE_THRESHOLDS.green) return '#22c55e';
  if (rate >= COMPLETION_RATE_THRESHOLDS.amber) return '#f59e0b';
  return '#ef4444';
}

export function ProviderCompletionTable({
  providers,
  showRevenue,
}: {
  providers: AwvProviderMetrics[];
  showRevenue: boolean;
}) {
  const sorted = [...providers].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">Assigned</TableHead>
            <TableHead className="text-right">Eligible</TableHead>
            <TableHead className="text-right">Completed</TableHead>
            <TableHead className="w-[160px]">Completion Rate</TableHead>
            {showRevenue && <TableHead className="text-right">Revenue</TableHead>}
            {showRevenue && <TableHead className="text-right">Outstanding</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => {
            const rateColor = getCompletionRateColor(p.completionRate);
            return (
              <TableRow key={p.providerId}>
                <TableCell className="font-medium">{p.providerName}</TableCell>
                <TableCell className="text-right">{p.assignedPatients}</TableCell>
                <TableCell className="text-right">{p.eligiblePatients}</TableCell>
                <TableCell className="text-right">{p.completedYtd}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(p.completionRate, 100)}%`,
                          backgroundColor: rateColor,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium" style={{ color: rateColor }}>
                      {p.completionRate}%
                    </span>
                  </div>
                </TableCell>
                {showRevenue && (
                  <TableCell className="text-right">{formatCurrency(p.revenueCaptured)}</TableCell>
                )}
                {showRevenue && (
                  <TableCell className="text-right">{p.outstanding}</TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

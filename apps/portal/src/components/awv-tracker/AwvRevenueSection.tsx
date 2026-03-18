import type { AwvCompletionStatus } from '@/types/awv-tracker';
import { useAwvAddons } from '@/hooks/useAwvUpload';
import { DEFAULT_REIMBURSEMENT_RATES } from '@/lib/awv-tracker-constants';
import { formatCurrency } from '@/utils/practice-health-formatters';
import { Skeleton } from '@hci/shared/ui/skeleton';

export function AwvRevenueSection({
  trackingId,
  billedAmount,
  completionStatus,
}: {
  trackingId: string;
  billedAmount: number | null;
  completionStatus: AwvCompletionStatus;
}) {
  const { data: addons, isLoading } = useAwvAddons(trackingId);

  const isCompleted = completionStatus === 'Completed';

  return (
    <div className="border-b border-border p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</h3>

      {!isCompleted && (
        <p className="mt-2 text-xs italic text-muted-foreground/60">
          Revenue details available after AWV is completed
        </p>
      )}

      {isCompleted && isLoading && (
        <Skeleton className="mt-2 h-20 w-full rounded" />
      )}

      {isCompleted && !isLoading && (
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">AWV Billed</span>
            <span className="font-medium text-foreground">{formatCurrency(billedAmount ?? 0)}</span>
          </div>

          {addons && addons.length > 0 && (
            <>
              {addons.map((addon) => (
                <div key={addon.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {addon.cpt_code} {addon.description}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(addon.billed_amount ?? 0)}
                  </span>
                </div>
              ))}
            </>
          )}

          <div className="border-t border-border pt-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">
                {formatCurrency(
                  (billedAmount ?? 0) +
                  (addons?.reduce((s, a) => s + (a.billed_amount ?? 0), 0) ?? 0)
                )}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Reimbursement Reference
            </p>
            <div className="space-y-0.5">
              {Object.entries(DEFAULT_REIMBURSEMENT_RATES).map(([code, info]) => (
                <div key={code} className="flex justify-between text-[10px] text-muted-foreground/60">
                  <span>{code} — {info.description}</span>
                  <span>{formatCurrency(info.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

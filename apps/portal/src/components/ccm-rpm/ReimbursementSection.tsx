import { useState } from 'react';
import { Button } from '@hci/shared/ui/button';
import { DollarSign, Plus } from 'lucide-react';
import { useCcmReimbursements } from '@/hooks/useCcmReimbursement';
import { CCM_CPT_CODES } from '@/types/ccm-rpm';
import type { CcmProgramType } from '@/types/ccm-rpm';
import { AddReimbursementDialog } from './AddReimbursementDialog';

interface ReimbursementSectionProps {
  enrollmentId: string;
  programType: CcmProgramType | null;
}

function formatMonth(serviceMonth: string): string {
  return new Date(serviceMonth + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function ReimbursementSection({ enrollmentId, programType }: ReimbursementSectionProps) {
  const { data: reimbursements = [], isLoading } = useCcmReimbursements(enrollmentId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = [...reimbursements].sort(
    (a, b) => b.service_month.localeCompare(a.service_month),
  );

  const totalCollected = sorted.reduce((sum, r) => sum + r.paid_amount, 0);

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5" />
          Reimbursement History
        </h3>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading...</p>
      )}

      {!isLoading && sorted.length === 0 && (
        <p className="text-xs text-muted-foreground">No reimbursement data logged yet</p>
      )}

      {!isLoading && sorted.length > 0 && (
        <>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-1.5 text-left font-medium">Month</th>
                <th className="pb-1.5 text-left font-medium">CPT</th>
                <th className="pb-1.5 text-right font-medium">Billed</th>
                <th className="pb-1.5 text-right font-medium">Paid</th>
                <th className="pb-1.5 text-right font-medium">Adj.</th>
                <th className="pb-1.5 text-left font-medium">Denial</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const isDenied = !!r.denial_reason;
                const rowClass = isDenied ? 'text-amber-400' : '';

                return (
                  <tr key={r.id} className={`border-b border-border/50 ${rowClass}`}>
                    <td className="py-1.5">{formatMonth(r.service_month)}</td>
                    <td className="py-1.5" title={CCM_CPT_CODES[r.cpt_code]?.description}>
                      {r.cpt_code}
                    </td>
                    <td className="py-1.5 text-right">
                      {r.billed_amount != null ? formatCurrency(r.billed_amount) : '--'}
                    </td>
                    <td className="py-1.5 text-right">{formatCurrency(r.paid_amount)}</td>
                    <td className="py-1.5 text-right">
                      {r.adjustment_amount != null ? formatCurrency(r.adjustment_amount) : '--'}
                    </td>
                    <td className={`py-1.5 truncate max-w-[100px] ${isDenied ? 'text-red-400' : ''}`}>
                      {r.denial_reason || '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Total collected: {formatCurrency(totalCollected)}
          </p>
        </>
      )}

      <AddReimbursementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        enrollmentId={enrollmentId}
        programType={programType}
      />
    </div>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@hci/shared/ui/dialog';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import { Label } from '@hci/shared/ui/label';
import { Textarea } from '@hci/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { useCcmAddReimbursement } from '@/hooks/useCcmReimbursement';
import { getCptCodesForProgram, CCM_CPT_CODES } from '@/types/ccm-rpm';
import type { CcmProgramType, CcmCptCode } from '@/types/ccm-rpm';

interface AddReimbursementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  programType: CcmProgramType | null;
}

export function AddReimbursementDialog({
  open,
  onOpenChange,
  enrollmentId,
  programType,
}: AddReimbursementDialogProps) {
  const addReimbursement = useCcmAddReimbursement();

  const [serviceMonth, setServiceMonth] = useState('');
  const [cptCode, setCptCode] = useState<CcmCptCode | ''>('');
  const [billedAmount, setBilledAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [notes, setNotes] = useState('');

  const availableCodes = programType ? getCptCodesForProgram(programType) : [];

  const paid = parseFloat(paidAmount) || 0;
  const billed = parseFloat(billedAmount) || 0;
  const showDenialField = billedAmount !== '' && paidAmount !== '' && paid < billed;

  function resetForm(): void {
    setServiceMonth('');
    setCptCode('');
    setBilledAmount('');
    setPaidAmount('');
    setAdjustmentAmount('');
    setDenialReason('');
    setNotes('');
  }

  async function handleSubmit(): Promise<void> {
    if (!serviceMonth || !cptCode || !paidAmount) return;

    await addReimbursement.mutateAsync({
      enrollment_id: enrollmentId,
      service_month: serviceMonth,
      cpt_code: cptCode,
      paid_amount: paid,
      billed_amount: billedAmount ? billed : undefined,
      adjustment_amount: adjustmentAmount ? parseFloat(adjustmentAmount) : undefined,
      denial_reason: denialReason || undefined,
      notes: notes || undefined,
    });

    resetForm();
    onOpenChange(false);
  }

  const isValid = !!serviceMonth && !!cptCode && !!paidAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Reimbursement Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Service Month */}
          <div>
            <Label className="text-xs text-muted-foreground">Service Month *</Label>
            <Input
              type="month"
              className="mt-1"
              value={serviceMonth}
              onChange={(e) => setServiceMonth(e.target.value)}
            />
          </div>

          {/* CPT Code */}
          <div>
            <Label className="text-xs text-muted-foreground">CPT Code *</Label>
            <Select value={cptCode} onValueChange={(v) => setCptCode(v as CcmCptCode)}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select CPT code..." />
              </SelectTrigger>
              <SelectContent>
                {availableCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code} — {CCM_CPT_CODES[code].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Billed Amount */}
          <div>
            <Label className="text-xs text-muted-foreground">Billed Amount</Label>
            <Input
              type="number"
              className="mt-1"
              placeholder="0.00"
              value={billedAmount}
              onChange={(e) => setBilledAmount(e.target.value)}
            />
          </div>

          {/* Paid Amount */}
          <div>
            <Label className="text-xs text-muted-foreground">Paid Amount *</Label>
            <Input
              type="number"
              className="mt-1"
              placeholder="0.00"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>

          {/* Adjustment Amount */}
          <div>
            <Label className="text-xs text-muted-foreground">Adjustment Amount</Label>
            <Input
              type="number"
              className="mt-1"
              placeholder="0.00"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
            />
          </div>

          {/* Denial Reason — shown only when paid < billed */}
          {showDenialField && (
            <div>
              <Label className="text-xs text-muted-foreground">Denial Reason</Label>
              <Input
                className="mt-1"
                placeholder="Reason for partial or full denial..."
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              className="mt-1"
              rows={2}
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || addReimbursement.isPending}>
            {addReimbursement.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

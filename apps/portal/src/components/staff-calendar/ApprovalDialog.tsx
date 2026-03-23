import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@hci/shared/ui/dialog';
import { Button } from '@hci/shared/ui/button';
import { Textarea } from '@hci/shared/ui/textarea';
import { Label } from '@hci/shared/ui/label';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: 'approved' | 'denied';
  requesterName: string;
  onConfirm: (notes: string) => void;
  isPending: boolean;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  decision,
  requesterName,
  onConfirm,
  isPending,
}: ApprovalDialogProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {decision === 'approved' ? 'Approve' : 'Deny'} Request
          </DialogTitle>
          <DialogDescription>
            {decision === 'approved'
              ? `Approve ${requesterName}'s time off request?`
              : `Deny ${requesterName}'s time off request?`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for the requester…"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={decision === 'denied' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending
              ? 'Processing…'
              : decision === 'approved'
                ? 'Approve'
                : 'Deny'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

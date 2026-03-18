import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hci/shared/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { Textarea } from '@hci/shared/ui/textarea';
import { Button } from '@hci/shared/ui/button';
import { Label } from '@hci/shared/ui/label';
import { useToast } from '@hci/shared/hooks/use-toast';
import { useChangeFacilityStatus } from '@/hooks/useFacilityCensus';
import type { FacilityStatus } from '@/types/mobile-docs';
import { PIPELINE_STATUS_COLORS } from '@/lib/mobile-docs-constants';

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilityName: string;
  currentStatus: FacilityStatus;
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  currentStatus,
}: ChangeStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<FacilityStatus | ''>('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const changeFacilityStatus = useChangeFacilityStatus();

  const handleSubmit = async () => {
    if (!newStatus || !reason.trim()) return;
    try {
      await changeFacilityStatus.mutateAsync({
        facilityId,
        fromStatus: currentStatus,
        toStatus: newStatus as FacilityStatus,
        reason: reason.trim(),
      });
      toast({ title: 'Status updated', description: `${facilityName} is now ${newStatus}.` });
      setNewStatus('');
      setReason('');
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current status badge */}
          <div>
            <Label className="text-xs text-muted-foreground">Current Status</Label>
            <div className="mt-1">
              <span
                className="inline-flex items-center rounded px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: PIPELINE_STATUS_COLORS[currentStatus].bg,
                  color: PIPELINE_STATUS_COLORS[currentStatus].text,
                }}
              >
                {currentStatus}
              </span>
            </div>
          </div>

          {/* New status selector */}
          <div>
            <Label>New Status <span className="text-destructive">*</span></Label>
            <Select onValueChange={(v) => setNewStatus(v as FacilityStatus)} value={newStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {(['Prospecting', 'Onboarding', 'Active', 'Inactive'] as FacilityStatus[])
                  .filter((s) => s !== currentStatus)
                  .map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason textarea */}
          <div>
            <Label>Reason <span className="text-destructive">*</span></Label>
            <Textarea
              className="mt-1"
              placeholder="Reason for status change..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newStatus || !reason.trim() || changeFacilityStatus.isPending}
              onClick={handleSubmit}
            >
              {changeFacilityStatus.isPending ? 'Updating...' : 'Change Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

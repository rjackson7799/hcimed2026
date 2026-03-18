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
import { useCcmAddDevice } from '@/hooks/useCcmEnrollment';
import type { CcmDeviceType } from '@/types/ccm-rpm';

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
}

const DEVICE_TYPES: CcmDeviceType[] = [
  'Blood Pressure Monitor',
  'Pulse Oximeter',
  'Glucose Monitor',
  'Weight Scale',
  'Thermometer',
  'Other',
];

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function AddDeviceDialog({ open, onOpenChange, enrollmentId }: AddDeviceDialogProps) {
  const addDevice = useCcmAddDevice();

  const [deviceType, setDeviceType] = useState<CcmDeviceType | ''>('');
  const [assignedDate, setAssignedDate] = useState(todayString);
  const [notes, setNotes] = useState('');

  function resetForm(): void {
    setDeviceType('');
    setAssignedDate(todayString());
    setNotes('');
  }

  async function handleSubmit(): Promise<void> {
    if (!deviceType) return;

    await addDevice.mutateAsync({
      enrollment_id: enrollmentId,
      device_type: deviceType,
      assigned_date: assignedDate,
      notes: notes.trim() || undefined,
    });

    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add RPM Device</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground">Device Type *</Label>
            <Select value={deviceType} onValueChange={(v) => setDeviceType(v as CcmDeviceType)}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select device type..." />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Assigned Date *</Label>
            <Input
              type="date"
              className="mt-1"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
            <Textarea
              className="mt-1"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Serial number, model, special instructions..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!deviceType || !assignedDate || addDevice.isPending}
          >
            {addDevice.isPending ? 'Adding...' : 'Add Device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

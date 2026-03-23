import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@hci/shared/ui/dialog';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import { Label } from '@hci/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hci/shared/ui/select';
import { Textarea } from '@hci/shared/ui/textarea';
import { Switch } from '@hci/shared/ui/switch';
import { toast } from 'sonner';
import { useCreateOverride } from '@/hooks/useStaffCalendarMutations';
import { useActiveUsers } from '@/hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import type { Profile } from '@/types/database';

interface ScheduleOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
}

export function ScheduleOverrideDialog({ open, onOpenChange, defaultDate }: ScheduleOverrideDialogProps) {
  const { profile } = useAuth();
  const { data: users } = useActiveUsers(['admin', 'staff', 'provider']);
  const createOverride = useCreateOverride();

  const [profileId, setProfileId] = useState('');
  const [overrideDate, setOverrideDate] = useState(defaultDate ?? '');
  const [isWorking, setIsWorking] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!profileId || !overrideDate || !profile) return;

    try {
      await createOverride.mutateAsync({
        profile_id: profileId,
        override_date: overrideDate,
        is_working: isWorking,
        reason: reason || undefined,
        created_by: profile.id,
      });
      toast.success('Schedule override added');
      onOpenChange(false);
      // Reset form
      setProfileId('');
      setOverrideDate('');
      setIsWorking(false);
      setReason('');
    } catch (err) {
      toast.error('Failed to add override');
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Schedule Override</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Staff Member</Label>
            <Select value={profileId} onValueChange={setProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {(users ?? []).map((u: Profile) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Working this day?</Label>
            <Switch checked={isWorking} onCheckedChange={setIsWorking} />
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Holiday coverage, office closed"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!profileId || !overrideDate || createOverride.isPending}>
            {createOverride.isPending ? 'Saving…' : 'Add Override'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

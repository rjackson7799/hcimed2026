import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@hci/shared/ui/dialog';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import { Label } from '@hci/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hci/shared/ui/select';
import { Textarea } from '@hci/shared/ui/textarea';
import { toast } from 'sonner';
import { timeOffRequestSchema, type TimeOffRequestFormData } from '@/schemas/timeOffRequestSchema';
import { useSubmitTimeOffRequest } from '@/hooks/useStaffCalendarMutations';
import { useAuth } from '@/context/AuthContext';
import { TIME_OFF_TYPE_LABELS } from '@/types/staff-calendar';

interface TimeOffRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeOffRequestForm({ open, onOpenChange }: TimeOffRequestFormProps) {
  const { profile } = useAuth();
  const submitRequest = useSubmitTimeOffRequest();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TimeOffRequestFormData>({
    resolver: zodResolver(timeOffRequestSchema),
    defaultValues: {
      start_date: '',
      end_date: '',
      time_off_type: 'vacation',
      notes: '',
    },
  });

  const timeOffType = watch('time_off_type');

  const onSubmit = async (data: TimeOffRequestFormData) => {
    if (!profile) return;

    try {
      await submitRequest.mutateAsync({
        formData: data,
        requesterId: profile.id,
        requesterName: profile.full_name,
      });
      toast.success('Time off request submitted');
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to submit request');
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" {...register('start_date')} />
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...register('end_date')} />
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={timeOffType}
              onValueChange={(val) => setValue('time_off_type', val as TimeOffRequestFormData['time_off_type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TIME_OFF_TYPE_LABELS) as [string, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register('notes')}
              placeholder="Any additional details…"
              rows={3}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitRequest.isPending}>
              {submitRequest.isPending ? 'Submitting…' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

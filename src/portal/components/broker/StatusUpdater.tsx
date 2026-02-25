import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/portal/context/AuthContext';
import { useCreateBrokerUpdate, useBrokerUpdates } from '@/portal/hooks/useBrokerUpdates';
import { StatusBadge } from '@/portal/components/shared/StatusBadge';
import { formatDateTime } from '@/portal/utils/formatters';
import { BROKER_STATUS_CONFIG, MAX_NOTE_LENGTH } from '@/portal/utils/constants';
import type { Patient, BrokerStatus } from '@/portal/types';

const STATUS_OPTIONS: { value: BrokerStatus; label: string; color: string }[] = [
  { value: 'received', label: 'Received', color: 'border-blue-300 hover:bg-blue-50' },
  { value: 'in_progress', label: 'In Progress', color: 'border-yellow-300 hover:bg-yellow-50' },
  { value: 'completed', label: 'Completed', color: 'border-green-300 hover:bg-green-50' },
  { value: 'unable_to_complete', label: 'Unable to Complete', color: 'border-red-300 hover:bg-red-50' },
];

interface StatusUpdaterProps {
  patient: Patient;
}

export function StatusUpdater({ patient }: StatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<BrokerStatus | null>(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const createUpdate = useCreateBrokerUpdate();
  const { data: updates, isLoading: updatesLoading } = useBrokerUpdates(patient.id);

  const handleSubmit = async () => {
    if (!selectedStatus || !user) return;

    try {
      await createUpdate.mutateAsync({
        patient_id: patient.id,
        project_id: patient.project_id,
        broker_id: user.id,
        status: selectedStatus,
        notes: notes.trim() || undefined,
      });
      toast.success('Status updated');
      setSelectedStatus(null);
      setNotes('');
    } catch {
      toast.error('Failed to update status. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Previous updates */}
      {updatesLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}
      {!updatesLoading && updates && updates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Update History</p>
          {updates.map((update: any) => (
            <div key={update.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status={update.status} type="broker" />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(update.created_at)}
                </span>
              </div>
              {update.notes && (
                <p className="text-sm text-foreground mt-1">{update.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Update form — only show if patient isn't completed */}
      {patient.outreach_status !== 'completed' && patient.outreach_status !== 'unable_to_complete' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Update Status:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                className={cn(
                  'rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors',
                  option.color,
                  selectedStatus === option.value
                    ? 'ring-2 ring-primary ring-offset-2 border-primary bg-primary/5'
                    : ''
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Notes (optional)</label>
              <span className="text-xs text-muted-foreground">
                {notes.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <Textarea
              placeholder="e.g., Patient confirmed appointment for next week"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              rows={2}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedStatus || createUpdate.isPending}
            className="w-full"
          >
            {createUpdate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </div>
      )}
    </div>
  );
}

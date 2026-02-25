import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/portal/context/AuthContext';
import { useCreateBrokerUpdate } from '@/portal/hooks/useBrokerUpdates';
import { MAX_NOTE_LENGTH } from '@/portal/utils/constants';
import type { Patient, BrokerStatus } from '@/portal/types';

const CALL_DISPOSITIONS: { value: BrokerStatus; label: string }[] = [
  { value: 'received', label: 'Reached' },
  { value: 'in_progress', label: 'No Answer' },
  { value: 'unable_to_complete', label: 'Wrong Number' },
];

const AUTO_DISMISS_MS = 60_000;

interface CallLogPromptProps {
  patient: Patient;
  onDismiss: () => void;
}

export function CallLogPrompt({ patient, onDismiss }: CallLogPromptProps) {
  const [selectedStatus, setSelectedStatus] = useState<BrokerStatus | null>(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const createUpdate = useCreateBrokerUpdate();

  // Auto-dismiss after 60 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleSubmit = async () => {
    if (!selectedStatus || !user) return;

    try {
      await createUpdate.mutateAsync({
        patient_id: patient.id,
        project_id: patient.project_id,
        broker_id: user.id,
        status: selectedStatus,
        notes: notes.trim() ? `[Call log] ${notes.trim()}` : '[Call log]',
      });
      toast.success('Call logged');
      onDismiss();
    } catch {
      toast.error('Failed to log call');
    }
  };

  return (
    <div className="border-t bg-blue-50/50 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
          <PhoneCall className="h-4 w-4" />
          Just called {patient.first_name}?
        </div>
        <button
          onClick={onDismiss}
          className="rounded-md p-1.5 hover:bg-blue-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-blue-600" />
        </button>
      </div>

      <div className="flex gap-2">
        {CALL_DISPOSITIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setSelectedStatus(d.value)}
            className={cn(
              'flex-1 rounded-lg border-2 p-2.5 text-xs font-medium transition-colors min-h-[44px]',
              selectedStatus === d.value
                ? 'border-blue-500 bg-blue-100 text-blue-800'
                : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {selectedStatus && (
        <>
          <Textarea
            placeholder="Brief notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTE_LENGTH))}
            rows={1}
            className="text-sm resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={createUpdate.isPending}
            size="sm"
            className="w-full min-h-[44px]"
          >
            {createUpdate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Call
          </Button>
        </>
      )}
    </div>
  );
}

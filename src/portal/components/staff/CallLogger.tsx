import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLogOutreach } from '@/portal/hooks/useOutreach';
import { useAuth } from '@/portal/context/AuthContext';
import { DISPOSITION_OPTIONS, MAX_NOTE_LENGTH } from '@/portal/utils/constants';
import type { Patient } from '@/portal/types';

interface CallLoggerProps {
  patient: Patient;
  onComplete?: () => void;
}

export function CallLogger({ patient, onComplete }: CallLoggerProps) {
  const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const logOutreach = useLogOutreach();

  const handleSubmit = async () => {
    if (!selectedDisposition || !user) return;

    try {
      await logOutreach.mutateAsync({
        patient_id: patient.id,
        project_id: patient.project_id,
        staff_id: user.id,
        disposition: selectedDisposition,
        notes: notes.trim() || undefined,
      });
      toast.success('Call logged successfully');
      setSelectedDisposition(null);
      setNotes('');
      onComplete?.();
    } catch {
      toast.error('Failed to log call. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">Select disposition:</p>

      {/* Disposition buttons - large, one-tap, color-coded */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {DISPOSITION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedDisposition(option.value)}
            className={cn(
              'rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors touch-target',
              option.color,
              selectedDisposition === option.value
                ? 'ring-2 ring-primary ring-offset-2 border-primary bg-primary/5'
                : ''
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">Notes (optional)</label>
          <span className="text-xs text-muted-foreground">
            {notes.length}/{MAX_NOTE_LENGTH}
          </span>
        </div>
        <Textarea
          placeholder="e.g., Patient asked about copay differences"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedDisposition || logOutreach.isPending}
        className="w-full"
      >
        {logOutreach.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log Call
      </Button>
    </div>
  );
}

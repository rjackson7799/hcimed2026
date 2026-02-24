import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useForwardToBroker } from '@/portal/hooks/useForwardToBroker';
import { useAuth } from '@/portal/context/AuthContext';
import { formatPatientName, formatPhone } from '@/portal/utils/formatters';
import type { Patient } from '@/portal/types';

interface BrokerForwardProps {
  patient: Patient;
}

export function BrokerForward({ patient }: BrokerForwardProps) {
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const forwardToBroker = useForwardToBroker();

  const handleForward = async () => {
    if (!user) return;

    try {
      await forwardToBroker.mutateAsync({
        patient_id: patient.id,
        project_id: patient.project_id,
        staff_id: user.id,
        notes: notes.trim() || undefined,
      });
      toast.success('Patient forwarded to broker');
      setNotes('');
      setOpen(false);
    } catch {
      toast.error('Failed to forward patient. Please try again.');
    }
  };

  // Don't show if already forwarded or completed
  if (patient.outreach_status === 'forwarded_to_broker' || patient.outreach_status === 'completed') {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          Forward to Broker
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Forward to Broker</AlertDialogTitle>
          <AlertDialogDescription>
            This will forward{' '}
            <strong>{formatPatientName(patient.first_name, patient.last_name)}</strong>{' '}
            ({formatPhone(patient.phone_primary)}) to the assigned broker and send an email notification.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes for broker (optional)</label>
          <Textarea
            placeholder="e.g., Patient prefers afternoon calls, speaks Spanish..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={forwardToBroker.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleForward}
            disabled={forwardToBroker.isPending}
          >
            {forwardToBroker.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Forward Patient
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

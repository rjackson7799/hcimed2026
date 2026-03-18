import { useState, useEffect } from 'react';
import { Mail, X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@hci/shared/ui/dialog';
import { useEmailSummary } from '@/hooks/usePracticeHealthSummary';
import { useToast } from '@hci/shared/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface EmailSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: { start: string; end: string };
}

export function EmailSummaryModal({ open, onOpenChange, dateRange }: EmailSummaryModalProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const emailMutation = useEmailSummary();
  const { toast } = useToast();

  // Pre-fill with admin emails on open
  useEffect(() => {
    if (!open) return;
    async function loadAdmins() {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')
        .eq('is_active', true);
      if (data && data.length > 0) {
        setRecipients(data.map((p: { email: string }) => p.email));
      }
    }
    loadAdmins();
  }, [open]);

  const addRecipient = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (recipients.includes(email)) return;
    setRecipients([...recipients, email]);
    setNewEmail('');
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleSend = () => {
    if (recipients.length === 0) return;

    emailMutation.mutate(
      { dateRange, recipients },
      {
        onSuccess: (data) => {
          toast({
            title: 'Summary emailed',
            description: `Sent to ${data.sent} recipient${data.sent !== 1 ? 's' : ''}.`,
          });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({
            title: 'Failed to send',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Executive Summary
          </DialogTitle>
          <DialogDescription>
            Send the Practice Health Executive Summary PDF to the selected recipients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-xs text-muted-foreground">
            Period: <span className="font-medium text-foreground">{dateRange.start} to {dateRange.end}</span>
          </div>

          {/* Recipient list */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients</label>
            <div className="flex flex-wrap gap-1.5">
              {recipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add new email */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Add email address..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                className="text-sm"
              />
              <Button size="sm" variant="outline" onClick={addRecipient}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={recipients.length === 0 || emailMutation.isPending}
          >
            {emailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { cn } from '@hci/shared/lib/utils';
import { toast } from 'sonner';
import {
  outreachPatientSchema,
  outreachStepFields,
  type OutreachPatientFormData,
} from '@/schemas/outreachPatientSchema';
import { useAddPatient } from '@/hooks/usePatients';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const STEPS = ['Patient Info', 'Insurance & ID'] as const;

export function AddPatientDialog({ open, onOpenChange, projectId }: AddPatientDialogProps) {
  const [step, setStep] = useState(0);
  const addPatient = useAddPatient();

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<OutreachPatientFormData>({
    resolver: zodResolver(outreachPatientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone_primary: '',
      phone_secondary: '',
      current_insurance: '',
      target_insurance: '',
      member_id: '',
      import_notes: '',
    },
  });

  async function goNext() {
    const valid = await trigger(outreachStepFields[step]);
    if (valid) setStep((s) => s + 1);
  }

  function goBack() {
    setStep((s) => s - 1);
  }

  function handleClose() {
    reset();
    setStep(0);
    onOpenChange(false);
  }

  async function onSubmit(data: OutreachPatientFormData) {
    try {
      await addPatient.mutateAsync({ ...data, project_id: projectId });
      toast.success('Patient added successfully');
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to add patient: ${msg}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Patient</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 pb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  i === step
                    ? 'bg-primary text-primary-foreground'
                    : i < step
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {i < step ? '\u2713' : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs',
                  i === step ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Patient Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" {...register('first_name')} />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" {...register('last_name')} />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
                {errors.date_of_birth && (
                  <p className="mt-1 text-xs text-destructive">{errors.date_of_birth.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone_primary">Primary Phone *</Label>
                  <Input
                    id="phone_primary"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('phone_primary')}
                  />
                  {errors.phone_primary && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone_primary.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone_secondary">Secondary Phone</Label>
                  <Input
                    id="phone_secondary"
                    type="tel"
                    placeholder="Optional"
                    {...register('phone_secondary')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Insurance & Identifiers */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="current_insurance">Current Insurance</Label>
                  <Input id="current_insurance" placeholder="e.g., Optum" {...register('current_insurance')} />
                </div>
                <div>
                  <Label htmlFor="target_insurance">Target Insurance</Label>
                  <Input id="target_insurance" placeholder="e.g., Regal IPA" {...register('target_insurance')} />
                </div>
              </div>
              <div>
                <Label htmlFor="member_id">Member ID</Label>
                <Input id="member_id" {...register('member_id')} />
              </div>
              <div>
                <Label htmlFor="import_notes">Notes</Label>
                <Textarea
                  id="import_notes"
                  placeholder="Optional notes about this patient"
                  rows={3}
                  {...register('import_notes')}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={addPatient.isPending}>
                {addPatient.isPending ? 'Adding...' : 'Add Patient'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

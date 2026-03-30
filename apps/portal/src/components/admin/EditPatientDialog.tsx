import { useEffect } from 'react';
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
import { toast } from 'sonner';
import {
  outreachPatientSchema,
  type OutreachPatientFormData,
} from '@/schemas/outreachPatientSchema';
import { useUpdatePatient } from '@/hooks/usePatients';
import type { Patient } from '@/types';

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export function EditPatientDialog({ open, onOpenChange, patient }: EditPatientDialogProps) {
  const updatePatient = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OutreachPatientFormData>({
    resolver: zodResolver(outreachPatientSchema),
    defaultValues: {
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth,
      phone_primary: patient.phone_primary,
      phone_secondary: patient.phone_secondary ?? '',
      current_insurance: patient.current_insurance ?? '',
      target_insurance: patient.target_insurance ?? '',
      member_id: patient.member_id ?? '',
      import_notes: patient.import_notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth,
      phone_primary: patient.phone_primary,
      phone_secondary: patient.phone_secondary ?? '',
      current_insurance: patient.current_insurance ?? '',
      target_insurance: patient.target_insurance ?? '',
      member_id: patient.member_id ?? '',
      import_notes: patient.import_notes ?? '',
    });
  }, [patient, reset]);

  function handleClose() {
    onOpenChange(false);
  }

  async function onSubmit(data: OutreachPatientFormData) {
    try {
      await updatePatient.mutateAsync({
        patientId: patient.id,
        projectId: patient.project_id,
        data,
      });
      toast.success('Patient updated');
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update patient: ${msg}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input id="edit_first_name" {...register('first_name')} />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input id="edit_last_name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edit_date_of_birth">Date of Birth *</Label>
              <Input id="edit_date_of_birth" type="date" {...register('date_of_birth')} />
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-destructive">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit_phone_primary">Primary Phone *</Label>
                <Input
                  id="edit_phone_primary"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register('phone_primary')}
                />
                {errors.phone_primary && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone_primary.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit_phone_secondary">Secondary Phone</Label>
                <Input
                  id="edit_phone_secondary"
                  type="tel"
                  placeholder="Optional"
                  {...register('phone_secondary')}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit_current_insurance">Current Insurance</Label>
                <Input
                  id="edit_current_insurance"
                  placeholder="e.g., Optum"
                  {...register('current_insurance')}
                />
              </div>
              <div>
                <Label htmlFor="edit_target_insurance">Target Insurance</Label>
                <Input
                  id="edit_target_insurance"
                  placeholder="e.g., Regal IPA"
                  {...register('target_insurance')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_member_id">Member ID</Label>
              <Input id="edit_member_id" {...register('member_id')} />
            </div>

            <div>
              <Label htmlFor="edit_import_notes">Notes</Label>
              <Textarea
                id="edit_import_notes"
                placeholder="Optional notes about this patient"
                rows={3}
                {...register('import_notes')}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePatient.isPending}>
              {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

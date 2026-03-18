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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { cn } from '@hci/shared/lib/utils';
import { awvPatientSchema, type AwvPatientFormData } from '@/schemas/awvPatientSchema';
import { useAwvProviders } from '@/hooks/useAwvProviders';
import { useAwvFacilities } from '@/hooks/useAwvFacilities';
import { useAwvAddPatient } from '@/hooks/useAwvTracking';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ['Patient ID', 'Assignment', 'AWV History'] as const;

export function AddPatientDialog({ open, onOpenChange }: AddPatientDialogProps) {
  const [step, setStep] = useState(0);
  const addPatient = useAwvAddPatient();
  const { data: providers = [] } = useAwvProviders();
  const { data: facilities = [] } = useAwvFacilities();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<AwvPatientFormData>({
    resolver: zodResolver(awvPatientSchema),
    defaultValues: {
      ecw_patient_id: '',
      last_name: '',
      medicare_status: 'Active',
      payer_name: '',
      service_line: 'HCI Office',
      facility_id: '',
      assigned_provider_id: '',
      last_awv_date: '',
      last_awv_type: undefined,
    },
  });

  const serviceLine = watch('service_line');

  const stepFields: (keyof AwvPatientFormData)[][] = [
    ['ecw_patient_id', 'last_name', 'medicare_status', 'payer_name'],
    ['service_line', 'facility_id', 'assigned_provider_id'],
    ['last_awv_date', 'last_awv_type'],
  ];

  async function goNext() {
    const valid = await trigger(stepFields[step]);
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

  async function onSubmit(data: AwvPatientFormData) {
    await addPatient.mutateAsync({
      ecw_patient_id: data.ecw_patient_id,
      last_name: data.last_name,
      medicare_status: data.medicare_status,
      payer_name: data.payer_name || null,
      service_line: data.service_line,
      facility_id: data.service_line === 'Mobile Docs' ? (data.facility_id || null) : null,
      assigned_provider_id: data.assigned_provider_id,
      last_awv_date: data.last_awv_date || null,
      last_awv_type: data.last_awv_type ?? null,
    });
    handleClose();
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
          {/* Step 1: Patient Identification */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ecw_patient_id">eCW Patient ID *</Label>
                <Input id="ecw_patient_id" {...register('ecw_patient_id')} />
                {errors.ecw_patient_id && (
                  <p className="mt-1 text-xs text-destructive">{errors.ecw_patient_id.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
                )}
              </div>
              <div>
                <Label>Medicare Status</Label>
                <Select
                  value={watch('medicare_status')}
                  onValueChange={(v) => setValue('medicare_status', v as AwvPatientFormData['medicare_status'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payer_name">Payer Name</Label>
                <Input id="payer_name" {...register('payer_name')} placeholder="e.g., Medicare FFS" />
              </div>
            </div>
          )}

          {/* Step 2: Assignment */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Service Line *</Label>
                <Select
                  value={watch('service_line')}
                  onValueChange={(v) => {
                    setValue('service_line', v as AwvPatientFormData['service_line']);
                    if (v !== 'Mobile Docs') setValue('facility_id', '');
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HCI Office">HCI Office</SelectItem>
                    <SelectItem value="Mobile Docs">Mobile Docs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {serviceLine === 'Mobile Docs' && (
                <div>
                  <Label>Facility *</Label>
                  <Select
                    value={watch('facility_id') || ''}
                    onValueChange={(v) => setValue('facility_id', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                    <SelectContent>
                      {facilities.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.facility_id && (
                    <p className="mt-1 text-xs text-destructive">{errors.facility_id.message}</p>
                  )}
                </div>
              )}
              <div>
                <Label>Provider *</Label>
                <Select
                  value={watch('assigned_provider_id') || ''}
                  onValueChange={(v) => setValue('assigned_provider_id', v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assigned_provider_id && (
                  <p className="mt-1 text-xs text-destructive">{errors.assigned_provider_id.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: AWV History */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="last_awv_date">Last AWV Date</Label>
                <Input id="last_awv_date" type="date" {...register('last_awv_date')} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank if no prior AWV on file
                </p>
              </div>
              <div>
                <Label>Last AWV Type</Label>
                <Select
                  value={watch('last_awv_type') || ''}
                  onValueChange={(v) =>
                    setValue('last_awv_type', v as AwvPatientFormData['last_awv_type'])
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select type (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IPPE">IPPE (G0402)</SelectItem>
                    <SelectItem value="Initial AWV">Initial AWV (G0438)</SelectItem>
                    <SelectItem value="Subsequent AWV">Subsequent AWV (G0439)</SelectItem>
                  </SelectContent>
                </Select>
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

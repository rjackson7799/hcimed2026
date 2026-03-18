import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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
import { Checkbox } from '@hci/shared/ui/checkbox';
import { Textarea } from '@hci/shared/ui/textarea';
import { cn } from '@hci/shared/lib/utils';
import {
  ccmPatientSchema,
  ccmPatientStep1Schema,
  ccmPatientStep2Schema,
  ccmPatientStep3Schema,
  type CcmPatientFormData,
} from '@/schemas/ccmPatientSchema';
import { addMockCcmPatient } from '@/lib/ccm-rpm-mock-data';

interface AddCcmPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ['Patient ID', 'Assignment', 'Enrollment'] as const;

const PROVIDERS = [
  { id: 'prov-chen', name: 'Dr. Chen' },
  { id: 'prov-np1', name: 'NP1' },
  { id: 'prov-np2', name: 'NP2' },
];

const FACILITIES = [
  { id: 'fac-01', name: 'Sunrise Senior Living' },
  { id: 'fac-02', name: 'Golden Oaks SNF' },
  { id: 'fac-03', name: 'Pacific Care Home' },
  { id: 'fac-04', name: 'Valley Vista Board & Care' },
  { id: 'fac-05', name: 'Mountain View SNF' },
  { id: 'fac-06', name: 'Harmony House' },
  { id: 'fac-07', name: 'Oakwood Manor' },
  { id: 'fac-08', name: 'Cedar Ridge Care' },
];

export function AddCcmPatientDialog({ open, onOpenChange }: AddCcmPatientDialogProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<CcmPatientFormData>({
    resolver: zodResolver(ccmPatientSchema),
    defaultValues: {
      ecw_patient_id: '',
      last_name: '',
      medicare_status: 'Active',
      payer_name: '',
      service_line: 'HCI Office',
      facility_id: '',
      assigned_provider_id: '',
      enrollment_status: 'Eligible',
      program_type: '',
      enrollment_date: '',
      consent_obtained: false,
      consent_date: '',
      notes: '',
    },
  });

  const serviceLine = watch('service_line');
  const enrollmentStatus = watch('enrollment_status');
  const consentObtained = watch('consent_obtained');

  const stepFields: (keyof CcmPatientFormData)[][] = [
    ['ecw_patient_id', 'last_name', 'medicare_status', 'payer_name'],
    ['service_line', 'facility_id', 'assigned_provider_id'],
    ['enrollment_status', 'program_type', 'enrollment_date', 'consent_obtained', 'consent_date', 'notes'],
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

  async function onSubmit(data: CcmPatientFormData) {
    setIsSubmitting(true);
    addMockCcmPatient({
      ecw_patient_id: data.ecw_patient_id,
      last_name: data.last_name,
      medicare_status: data.medicare_status,
      payer_name: data.payer_name || null,
      service_line: data.service_line,
      facility_id: data.service_line === 'Mobile Docs' ? (data.facility_id || null) : null,
      assigned_provider_id: data.assigned_provider_id,
      enrollment_status: data.enrollment_status,
      program_type: data.enrollment_status === 'Enrolled' ? (data.program_type as CcmPatientFormData['program_type']) || null : null,
      enrollment_date: data.enrollment_date || null,
      consent_obtained: data.consent_obtained,
      consent_date: data.consent_date || null,
      notes: data.notes || null,
    });
    await queryClient.invalidateQueries({ queryKey: ['ccm'] });
    setIsSubmitting(false);
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add CCM/RPM Patient</DialogTitle>
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
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {i < step ? '\u2713' : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs',
                  i === step ? 'font-medium text-foreground' : 'text-muted-foreground',
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
                  onValueChange={(v) => setValue('medicare_status', v as CcmPatientFormData['medicare_status'])}
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
                <Label htmlFor="payer_name">Primary Payer</Label>
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
                    setValue('service_line', v as CcmPatientFormData['service_line']);
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
                      {FACILITIES.map((f) => (
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
                <Label>Assigned Provider *</Label>
                <Select
                  value={watch('assigned_provider_id') || ''}
                  onValueChange={(v) => setValue('assigned_provider_id', v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
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

          {/* Step 3: Initial Enrollment */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Enrollment Status</Label>
                <Select
                  value={watch('enrollment_status')}
                  onValueChange={(v) => {
                    setValue('enrollment_status', v as CcmPatientFormData['enrollment_status']);
                    if (v !== 'Enrolled') {
                      setValue('program_type', '');
                      setValue('enrollment_date', '');
                      setValue('consent_obtained', false);
                      setValue('consent_date', '');
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eligible">Eligible</SelectItem>
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {enrollmentStatus === 'Enrolled' && (
                <>
                  <div>
                    <Label>Program Type *</Label>
                    <Select
                      value={watch('program_type') || ''}
                      onValueChange={(v) => setValue('program_type', v as CcmPatientFormData['program_type'])}
                    >
                      <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CCM Only">CCM Only</SelectItem>
                        <SelectItem value="RPM Only">RPM Only</SelectItem>
                        <SelectItem value="CCM + RPM">CCM + RPM</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.program_type && (
                      <p className="mt-1 text-xs text-destructive">{errors.program_type.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="enrollment_date">Enrollment Date</Label>
                    <Input id="enrollment_date" type="date" {...register('enrollment_date')} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="consent_obtained"
                      checked={consentObtained}
                      onCheckedChange={(checked) => {
                        setValue('consent_obtained', !!checked);
                        if (!checked) setValue('consent_date', '');
                      }}
                    />
                    <Label htmlFor="consent_obtained" className="cursor-pointer">
                      Consent Obtained
                    </Label>
                  </div>
                  {consentObtained && (
                    <div>
                      <Label htmlFor="consent_date">Consent Date</Label>
                      <Input id="consent_date" type="date" {...register('consent_date')} />
                    </div>
                  )}
                </>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Optional notes..."
                  rows={3}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Patient'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hci/shared/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@hci/shared/ui/form';
import { Input } from '@hci/shared/ui/input';
import { Button } from '@hci/shared/ui/button';
import { Textarea } from '@hci/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { Progress } from '@hci/shared/ui/progress';
import { Check } from 'lucide-react';
import { cn } from '@hci/shared/lib/utils';
import { useCreateFacility, useCreateContact, useCreateNote } from '@/hooks/useFacilities';
import { facilitySchema, contactSchema } from '@/schemas/facilitySchema';
import { useToast } from '@hci/shared/hooks/use-toast';

// Combined schema for the full create flow
const createFormSchema = z.object({
  // Step 1 — Facility Info
  name: facilitySchema.innerType().shape.name,
  type: facilitySchema.innerType().shape.type,
  address_line1: facilitySchema.innerType().shape.address_line1,
  address_line2: facilitySchema.innerType().shape.address_line2,
  city: facilitySchema.innerType().shape.city,
  state: facilitySchema.innerType().shape.state,
  zip: facilitySchema.innerType().shape.zip,
  phone: facilitySchema.innerType().shape.phone,
  total_beds: facilitySchema.innerType().shape.total_beds,
  pos_code: facilitySchema.innerType().shape.pos_code,
  // Step 2 — Primary Contact
  contact_name: z.string().optional().or(z.literal('')),
  contact_role: contactSchema.shape.role.optional(),
  contact_type: contactSchema.shape.contact_type.optional(),
  contact_phone: z.string().optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  // Step 3 — Operations
  status: facilitySchema.innerType().shape.status,
  visit_cadence: facilitySchema.innerType().shape.visit_cadence,
  assigned_provider_id: facilitySchema.innerType().shape.assigned_provider_id,
  initial_census: z.coerce.number().int().min(0).optional(),
  initial_note: z.string().optional().or(z.literal('')),
});

type CreateFormData = z.infer<typeof createFormSchema>;

const STEP_LABELS = ['Facility Info', 'Primary Contact', 'Operations'];
const STEP_FIELDS: (keyof CreateFormData)[][] = [
  ['name', 'type', 'address_line1', 'city', 'state', 'zip'],
  ['contact_name'],
  ['status', 'visit_cadence'],
];

interface CreateFacilityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFacilityForm({ open, onOpenChange }: CreateFacilityFormProps) {
  const [step, setStep] = useState(0);
  const createFacility = useCreateFacility();
  const createContact = useCreateContact();
  const createNote = useCreateNote();
  const { toast } = useToast();

  const form = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      name: '',
      type: 'SNF',
      address_line1: '',
      address_line2: '',
      city: '',
      state: 'CA',
      zip: '',
      phone: '',
      total_beds: undefined,
      pos_code: undefined,
      contact_name: '',
      contact_role: 'Administrator',
      contact_type: 'Administrative',
      contact_phone: '',
      contact_email: '',
      status: 'Prospecting',
      visit_cadence: 'TBD',
      assigned_provider_id: '',
      initial_census: undefined,
      initial_note: '',
    },
  });

  const facilityType = form.watch('type');
  const totalSteps = STEP_LABELS.length;
  const progressValue = ((step + 1) / totalSteps) * 100;

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: CreateFormData) => {
    try {
      const facility = await createFacility.mutateAsync({
        name: data.name,
        type: data.type,
        address_line1: data.address_line1,
        address_line2: data.address_line2 || '',
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone || '',
        total_beds: data.type === 'Homebound' ? null : (data.total_beds ?? null),
        pos_code: data.pos_code ?? null,
        status: data.status,
        visit_cadence: data.visit_cadence,
        assigned_provider_id: data.assigned_provider_id || '',
      });

      // Create contact if provided
      if (data.contact_name) {
        await createContact.mutateAsync({
          facilityId: facility.id,
          data: {
            name: data.contact_name,
            role: data.contact_role || 'Administrator',
            contact_type: data.contact_type || 'Administrative',
            phone: data.contact_phone || '',
            email: data.contact_email || '',
          },
        });
      }

      // Create initial note if provided
      if (data.initial_note) {
        await createNote.mutateAsync({
          facilityId: facility.id,
          data: {
            note_type: 'General',
            content: data.initial_note,
          },
        });
      }

      toast({ title: 'Facility created', description: `${data.name} has been added to the directory.` });
      form.reset();
      setStep(0);
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to create facility.', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    form.reset();
    setStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Facility</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div>
          <Progress value={progressValue} className="h-1.5 mb-4" />
          <div className="flex justify-between mb-6">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                    i < step && 'bg-primary text-primary-foreground',
                    i === step && 'bg-secondary text-secondary-foreground ring-2 ring-offset-2 ring-secondary',
                    i > step && 'bg-muted text-muted-foreground'
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('text-[10px] mt-1 text-center', i === step ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Facility Info */}
            {step === 0 && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Sunrise Senior Living" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Type <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="SNF">SNF</SelectItem>
                        <SelectItem value="Board & Care">Board & Care</SelectItem>
                        <SelectItem value="Homebound">Homebound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address_line1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address_line2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suite / Unit</FormLabel>
                    <FormControl><Input placeholder="Suite 100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Pasadena" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input placeholder="CA" maxLength={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="zip" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="91101" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="(626) 555-0100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {facilityType !== 'Homebound' && (
                  <FormField control={form.control} name="total_beds" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Beds <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" min={1} placeholder="e.g. 60" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </>
            )}

            {/* Step 2: Primary Contact */}
            {step === 1 && (
              <>
                <p className="text-sm text-muted-foreground">Add a primary contact for this facility. You can skip this step.</p>
                <FormField control={form.control} name="contact_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['DON', 'Administrator', 'Owner', 'Discharge Planner', 'Social Worker', 'Caregiver', 'MA Plan Coordinator', 'Other'].map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Administrative', 'Clinical', 'Caregiver', 'Referral'].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="(626) 555-0100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Step 3: Operations */}
            {step === 2 && (
              <>
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Prospecting">Prospecting</SelectItem>
                        <SelectItem value="Onboarding">Onboarding</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="visit_cadence" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Cadence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'As Needed', 'TBD'].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="initial_census" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Patient Census</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="initial_note" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Note</FormLabel>
                    <FormControl><Textarea placeholder="Optional note about this facility..." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" onClick={step === 0 ? handleClose : handleBack}>
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              {step < totalSteps - 1 ? (
                <Button type="button" onClick={handleNext}>
                  {step === 1 ? (form.watch('contact_name') ? 'Next' : 'Skip') : 'Next'}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createFacility.isPending}
                >
                  {createFacility.isPending ? 'Creating...' : 'Create Facility'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

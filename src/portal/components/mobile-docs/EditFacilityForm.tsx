import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateFacility } from '@/portal/hooks/useFacilities';
import { facilitySchema, type FacilityFormData } from '@/portal/schemas/facilitySchema';
import type { Facility } from '@/portal/types/mobile-docs';
import { useToast } from '@/hooks/use-toast';
import { ChangeStatusDialog } from './ChangeStatusDialog';

interface EditFacilityFormProps {
  facility: Facility;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFacilityForm({ facility, open, onOpenChange }: EditFacilityFormProps) {
  const updateFacility = useUpdateFacility();
  const { toast } = useToast();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: facility.name,
      type: facility.type,
      address_line1: facility.address_line1,
      address_line2: facility.address_line2 || '',
      city: facility.city,
      state: facility.state,
      zip: facility.zip,
      phone: facility.phone || '',
      total_beds: facility.total_beds,
      pos_code: facility.pos_code,
      status: facility.status,
      visit_cadence: facility.visit_cadence,
      assigned_provider_id: facility.assigned_provider_id || '',
    },
  });

  const facilityType = form.watch('type');

  const onSubmit = async (data: FacilityFormData) => {
    try {
      await updateFacility.mutateAsync({
        id: facility.id,
        data: {
          name: data.name,
          type: data.type,
          address_line1: data.address_line1,
          address_line2: data.address_line2 || undefined,
          city: data.city,
          state: data.state,
          zip: data.zip,
          phone: data.phone || undefined,
          total_beds: data.type === 'Homebound' ? undefined : (data.total_beds ?? undefined),
          pos_code: data.pos_code ?? undefined,
          status: data.status,
          visit_cadence: data.visit_cadence,
          assigned_provider_id: data.assigned_provider_id || undefined,
        },
      });
      toast({ title: 'Facility updated', description: `${data.name} has been saved.` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to update facility.', variant: 'destructive' });
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Facility Name <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
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
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address_line2" render={({ field }) => (
              <FormItem>
                <FormLabel>Suite / Unit</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input maxLength={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="zip" render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {facilityType !== 'Homebound' && (
              <FormField control={form.control} name="total_beds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Beds <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" min={1} {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Prospecting">Prospecting</SelectItem>
                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Status changes are tracked in the pipeline audit trail.
              </p>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setStatusDialogOpen(true)}
              >
                Change Status
              </Button>
            </div>

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

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateFacility.isPending}>
                {updateFacility.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <ChangeStatusDialog
      open={statusDialogOpen}
      onOpenChange={setStatusDialogOpen}
      facilityId={facility.id}
      facilityName={facility.name}
      currentStatus={facility.status}
    />
    </>
  );
}

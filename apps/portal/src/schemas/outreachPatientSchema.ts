import { z } from 'zod';

// ─── Add Outreach Patient Form ─────────────────────────

export const outreachPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  phone_primary: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => val.replace(/\D/g, '').length >= 10,
      'Must contain at least 10 digits',
    ),
  phone_secondary: z.string().optional().or(z.literal('')),
  current_insurance: z.string().optional().or(z.literal('')),
  target_insurance: z.string().optional().or(z.literal('')),
  member_id: z.string().optional().or(z.literal('')),
  import_notes: z.string().optional().or(z.literal('')),
});

export type OutreachPatientFormData = z.infer<typeof outreachPatientSchema>;

import { z } from 'zod';

// ─── Add Outreach Patient Form (3-step) ─────────────────────────

export const outreachPatientSchema = z.object({
  // Step 1 — Patient Info
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  phone_primary: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/\d{10,}/, 'Must contain at least 10 digits'),
  phone_secondary: z.string().optional().or(z.literal('')),

  // Step 2 — Insurance & Identifiers
  current_insurance: z.string().optional().or(z.literal('')),
  target_insurance: z.string().optional().or(z.literal('')),
  member_id: z.string().optional().or(z.literal('')),
  import_notes: z.string().optional().or(z.literal('')),
});

export type OutreachPatientFormData = z.infer<typeof outreachPatientSchema>;

export const outreachStepFields: (keyof OutreachPatientFormData)[][] = [
  ['first_name', 'last_name', 'date_of_birth', 'phone_primary', 'phone_secondary'],
  ['current_insurance', 'target_insurance', 'member_id', 'import_notes'],
];

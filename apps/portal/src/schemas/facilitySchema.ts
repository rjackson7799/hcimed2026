import { z } from 'zod';

export const facilitySchema = z
  .object({
    name: z.string().min(2, 'Facility name is required').max(255),
    type: z.enum(['SNF', 'Board & Care', 'Homebound']),
    address_line1: z.string().min(3, 'Street address is required'),
    address_line2: z.string().optional().or(z.literal('')),
    city: z.string().min(2, 'City is required'),
    state: z.string().length(2, 'Use 2-letter state code').default('CA'),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    phone: z.string().optional().or(z.literal('')),
    total_beds: z.coerce.number().int().positive('Must be at least 1').optional().nullable(),
    pos_code: z.coerce.number().int().optional().nullable(),
    status: z.enum(['Prospecting', 'Onboarding', 'Active', 'Inactive']),
    visit_cadence: z.enum(['Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'As Needed', 'TBD']),
    assigned_provider_id: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => d.type === 'Homebound' || (d.total_beds != null && d.total_beds > 0),
    { message: 'Bed count is required for SNF and Board & Care', path: ['total_beds'] }
  );

export type FacilityFormData = z.infer<typeof facilitySchema>;

export const contactSchema = z.object({
  name: z.string().min(2, 'Contact name is required').max(100),
  role: z.enum([
    'DON',
    'Administrator',
    'Owner',
    'Discharge Planner',
    'Social Worker',
    'Caregiver',
    'MA Plan Coordinator',
    'Other',
  ]),
  contact_type: z.enum(['Administrative', 'Clinical', 'Caregiver', 'Referral']),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const noteSchema = z.object({
  note_type: z.enum([
    'General',
    'Visit Summary',
    'Outreach',
    'Partnership',
    'Clinical',
    'Administrative',
  ]),
  content: z.string().min(1, 'Note content is required').max(5000),
});

export type NoteFormData = z.infer<typeof noteSchema>;

export const censusSchema = z.object({
  active_patients: z.coerce.number().int().min(0, 'Required'),
  new_admissions: z.coerce.number().int().min(0).optional().default(0),
  discharges: z.coerce.number().int().min(0).optional().default(0),
  ccm_enrolled: z.coerce.number().int().min(0).optional().default(0),
  rpm_enrolled: z.coerce.number().int().min(0).optional().default(0),
  awv_eligible: z.coerce.number().int().min(0).optional().default(0),
});

export type CensusFormData = z.infer<typeof censusSchema>;

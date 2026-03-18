import { z } from 'zod';

// ─── Step 1 — Patient Identification ────────────────────────────

export const ccmPatientStep1Schema = z.object({
  ecw_patient_id: z.string().min(1, 'eCW Patient ID is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(100),
  medicare_status: z.enum(['Active', 'Inactive', 'Unknown']).default('Active'),
  payer_name: z.string().optional().or(z.literal('')),
});

// ─── Step 2 — Assignment ────────────────────────────────────────

export const ccmPatientStep2Schema = z
  .object({
    service_line: z.enum(['HCI Office', 'Mobile Docs']),
    facility_id: z.string().optional().or(z.literal('')),
    assigned_provider_id: z.string().min(1, 'Provider is required'),
  })
  .refine(
    (d) => d.service_line !== 'Mobile Docs' || (d.facility_id && d.facility_id.length > 0),
    { message: 'Facility is required for Mobile Docs patients', path: ['facility_id'] },
  );

// ─── Step 3 — Initial Enrollment ────────────────────────────────

export const ccmPatientStep3Schema = z
  .object({
    enrollment_status: z.enum(['Eligible', 'Enrolled', 'Declined']).default('Eligible'),
    program_type: z.enum(['CCM Only', 'RPM Only', 'CCM + RPM']).optional().or(z.literal('')),
    enrollment_date: z.string().optional().or(z.literal('')),
    consent_obtained: z.boolean().default(false),
    consent_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => d.enrollment_status !== 'Enrolled' || (d.program_type && d.program_type.length > 0),
    { message: 'Program type is required when enrolling a patient', path: ['program_type'] },
  );

// ─── Combined Schema ────────────────────────────────────────────

export const ccmPatientSchema = z
  .object({
    // Step 1 — Patient Identification
    ecw_patient_id: z.string().min(1, 'eCW Patient ID is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(100),
    medicare_status: z.enum(['Active', 'Inactive', 'Unknown']).default('Active'),
    payer_name: z.string().optional().or(z.literal('')),

    // Step 2 — Assignment
    service_line: z.enum(['HCI Office', 'Mobile Docs']),
    facility_id: z.string().optional().or(z.literal('')),
    assigned_provider_id: z.string().min(1, 'Provider is required'),

    // Step 3 — Initial Enrollment
    enrollment_status: z.enum(['Eligible', 'Enrolled', 'Declined']).default('Eligible'),
    program_type: z.enum(['CCM Only', 'RPM Only', 'CCM + RPM']).optional().or(z.literal('')),
    enrollment_date: z.string().optional().or(z.literal('')),
    consent_obtained: z.boolean().default(false),
    consent_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => d.service_line !== 'Mobile Docs' || (d.facility_id && d.facility_id.length > 0),
    { message: 'Facility is required for Mobile Docs patients', path: ['facility_id'] },
  )
  .refine(
    (d) => d.enrollment_status !== 'Enrolled' || (d.program_type && d.program_type.length > 0),
    { message: 'Program type is required when enrolling a patient', path: ['program_type'] },
  );

export type CcmPatientFormData = z.infer<typeof ccmPatientSchema>;

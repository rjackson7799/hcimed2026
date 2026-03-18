import { z } from 'zod';

// ─── Add Patient Form (3-step) ───────────────────────────────────

export const awvPatientSchema = z
  .object({
    // Step 1 — Patient Identification
    ecw_patient_id: z.string().min(1, 'eCW Patient ID is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(100),
    medicare_status: z.enum(['Active', 'Inactive', 'Unknown']),
    payer_name: z.string().optional().or(z.literal('')),

    // Step 2 — Assignment
    service_line: z.enum(['HCI Office', 'Mobile Docs']),
    facility_id: z.string().optional().or(z.literal('')),
    assigned_provider_id: z.string().min(1, 'Provider is required'),

    // Step 3 — AWV History
    last_awv_date: z.string().optional().or(z.literal('')),
    last_awv_type: z.enum(['IPPE', 'Initial AWV', 'Subsequent AWV']).optional(),
  })
  .refine(
    (d) => d.service_line !== 'Mobile Docs' || (d.facility_id && d.facility_id.length > 0),
    { message: 'Facility is required for Mobile Docs patients', path: ['facility_id'] }
  );

export type AwvPatientFormData = z.infer<typeof awvPatientSchema>;

// ─── Eligibility Update ──────────────────────────────────────────

export const awvEligibilityUpdateSchema = z
  .object({
    eligibility_status: z.enum(['Pending Review', 'Eligible', 'Not Eligible']),
    eligibility_reason: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => d.eligibility_status !== 'Not Eligible' || (d.eligibility_reason && d.eligibility_reason.length > 0),
    { message: 'Reason is required when marking Not Eligible', path: ['eligibility_reason'] }
  );

export type AwvEligibilityUpdateData = z.infer<typeof awvEligibilityUpdateSchema>;

// ─── Completion Update ───────────────────────────────────────────

export const awvScheduleSchema = z.object({
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  awv_type: z.enum(['IPPE', 'Initial AWV', 'Subsequent AWV']).optional(),
  notes: z.string().optional().or(z.literal('')),
});

export type AwvScheduleData = z.infer<typeof awvScheduleSchema>;

export const awvCompleteSchema = z.object({
  completion_date: z.string().min(1, 'Completion date is required'),
  awv_type: z.enum(['IPPE', 'Initial AWV', 'Subsequent AWV']),
  billed_amount: z.coerce.number().min(0, 'Amount must be positive').optional(),
  notes: z.string().optional().or(z.literal('')),
});

export type AwvCompleteData = z.infer<typeof awvCompleteSchema>;

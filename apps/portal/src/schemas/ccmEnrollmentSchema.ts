import { z } from 'zod';

// ─── Enrollment Update ──────────────────────────────────────────

export const enrollmentUpdateSchema = z
  .object({
    enrollment_status: z.enum(['Eligible', 'Enrolled', 'Declined', 'Disenrolled', 'Inactive']),
    program_type: z.enum(['CCM Only', 'RPM Only', 'CCM + RPM']).optional().or(z.literal('')),
    enrollment_date: z.string().optional().or(z.literal('')),
    disenrollment_date: z.string().optional().or(z.literal('')),
    disenrollment_reason: z.string().optional().or(z.literal('')),
    consent_obtained: z.boolean().default(false),
    consent_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => d.enrollment_status !== 'Enrolled' || (d.program_type && d.program_type.length > 0),
    { message: 'Program type is required when enrolling', path: ['program_type'] }
  )
  .refine(
    (d) => d.enrollment_status !== 'Enrolled' || (d.enrollment_date && d.enrollment_date.length > 0),
    { message: 'Enrollment date is required when enrolling', path: ['enrollment_date'] }
  )
  .refine(
    (d) => d.enrollment_status !== 'Disenrolled' || (d.disenrollment_date && d.disenrollment_date.length > 0),
    { message: 'Disenrollment date is required when disenrolling', path: ['disenrollment_date'] }
  )
  .refine(
    (d) => d.enrollment_status !== 'Disenrolled' || (d.disenrollment_reason && d.disenrollment_reason.length > 0),
    { message: 'Reason is required when disenrolling', path: ['disenrollment_reason'] }
  );

export type EnrollmentUpdateData = z.infer<typeof enrollmentUpdateSchema>;

// ─── Device Add ─────────────────────────────────────────────────

export const deviceAddSchema = z.object({
  device_type: z.enum([
    'Blood Pressure Monitor',
    'Pulse Oximeter',
    'Glucose Monitor',
    'Weight Scale',
    'Thermometer',
    'Other',
  ]),
  assigned_date: z.string().min(1, 'Assigned date is required'),
  notes: z.string().optional().or(z.literal('')),
});

export type DeviceAddData = z.infer<typeof deviceAddSchema>;

// ─── Device Status ──────────────────────────────────────────────

export const deviceStatusSchema = z.object({
  device_status: z.enum(['Active', 'Returned', 'Lost', 'Malfunctioning']),
});

export type DeviceStatusData = z.infer<typeof deviceStatusSchema>;

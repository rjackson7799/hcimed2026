import { z } from 'zod';

export const timeOffRequestSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time_off_type: z.enum(['vacation', 'sick', 'personal', 'cme']),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional().or(z.literal('')),
}).refine(
  (data) => data.end_date >= data.start_date,
  { message: 'End date must be on or after start date', path: ['end_date'] }
);

export type TimeOffRequestFormData = z.infer<typeof timeOffRequestSchema>;

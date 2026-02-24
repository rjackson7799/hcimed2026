import { z } from 'zod';
import { DISPOSITION } from '@/portal/types/enums';

const dispositionValues = Object.values(DISPOSITION) as [string, ...string[]];

export const callLogSchema = z.object({
  disposition: z.enum(dispositionValues, {
    required_error: 'Please select a call disposition',
  }),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional().or(z.literal('')),
});

export type CallLogFormData = z.infer<typeof callLogSchema>;

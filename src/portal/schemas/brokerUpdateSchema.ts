import { z } from 'zod';
import { BROKER_STATUS } from '@/portal/types/enums';

const brokerStatusValues = Object.values(BROKER_STATUS) as [string, ...string[]];

export const brokerUpdateSchema = z.object({
  status: z.enum(brokerStatusValues, {
    required_error: 'Please select a status',
  }),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),
});

export type BrokerUpdateFormData = z.infer<typeof brokerUpdateSchema>;

import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  target_start: z.string().optional().or(z.literal('')),
  target_end: z.string().optional().or(z.literal('')),
  broker_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

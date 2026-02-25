import { z } from 'zod';

export const inviteUserSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be under 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  role: z.enum(['admin', 'staff', 'provider', 'broker'], {
    required_error: 'Please select a role',
  }),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

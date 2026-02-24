import { z } from 'zod';
import { MAX_MESSAGE_LENGTH } from '@/portal/utils/constants';

export const messageSchema = z.object({
  body: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message must be ${MAX_MESSAGE_LENGTH} characters or less`),
});

export type MessageFormData = z.infer<typeof messageSchema>;

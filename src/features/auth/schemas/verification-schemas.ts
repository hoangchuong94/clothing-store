import { z } from 'zod';

import { routing } from '@/i18n/routing';

const localeSchema = z.enum(routing.locales);

export const VerifyEmailTokenSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'validation.required' })
    .max(256, { message: 'validation.required' }),
});

export const ResendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.required' })
    .email({ message: 'validation.emailInvalid' })
    .toLowerCase(),
  locale: localeSchema,
});

export type VerifyEmailTokenInput = z.infer<typeof VerifyEmailTokenSchema>;
export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;

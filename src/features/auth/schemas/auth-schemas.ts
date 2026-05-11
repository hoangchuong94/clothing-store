import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.required' })
    .email({ message: 'validation.emailInvalid' }),
  password: z.string().min(6, { message: 'validation.passwordMin' }),
  remember: z.boolean().optional(),
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2, { message: 'validation.nameRequired' }),
  passwordConfirm: z.string().min(1, { message: 'validation.confirmPassword' }),
}).superRefine((data, ctx) => {
  if (data.password !== data.passwordConfirm) {
    ctx.addIssue({
      code: 'custom',
      path: ['passwordConfirm'],
      message: 'validation.passwordMismatch',
    });
  }
});

export type LoginSchema = z.infer<typeof LoginSchema>;
export type RegisterSchema = z.infer<typeof RegisterSchema>;

import { z } from 'zod';
import { passwordValidator, passwordMatchValidator } from '../lib/password-validators';
import { PASSWORD_ERROR_MESSAGES } from '../lib/password-constants';

/**
 * LOGIN SCHEMA
 * Validation cho authentication login
 *
 * Security notes:
 * - Không expose password requirements ở client
 * - Server phải rate-limit login attempts
 * - Implement account lockout sau N failed attempts
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.required' })
    .email({ message: 'validation.emailInvalid' }),
  password: z.string().min(1, { message: 'validation.passwordRequired' }),
  remember: z.boolean().optional(),
});

/**
 * REGISTER SCHEMA
 * Validation cho user registration - enforce strong password policy
 *
 * Security notes:
 * - Password phải meet production standards (8+ char, diverse charset)
 * - Email phải verified trước activate account
 * - Rate-limit registration endpoint
 * - Check email không duplicate
 * - Store password hashed (bcrypt 12+ rounds)
 * - Never log/expose password anywhere
 */
export const RegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'validation.required' })
      .email({ message: 'validation.emailInvalid' })
      .toLowerCase(),
    name: z
      .string()
      .min(2, { message: 'validation.nameRequired' })
      .max(100, { message: 'validation.nameTooLong' })
      .trim(),
    password: passwordValidator(),
    passwordConfirm: passwordValidator(),
  })
  .superRefine((data, ctx) => {
    // Validate password confirmation match
    if (!passwordMatchValidator(data.password, data.passwordConfirm, ctx)) {
      return; // Error already added by validator
    }
  });

/**
 * RESET PASSWORD SCHEMA
 * Validation khi user reset password qua email link
 *
 * Security notes:
 * - Token phải expire sau 1 hour
 * - Token chỉ dùng được 1 lần
 * - Email user phải verified
 * - Password phải different từ old password (check server-side)
 */
export const ResetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'validation.required' })
      .email({ message: 'validation.emailInvalid' })
      .toLowerCase(),
    token: z.string().min(1, { message: 'validation.required' }),
    password: passwordValidator(),
    passwordConfirm: passwordValidator(),
  })
  .superRefine((data, ctx) => {
    // Validate password confirmation match
    if (!passwordMatchValidator(data.password, data.passwordConfirm, ctx)) {
      return;
    }
  });

/**
 * CHANGE PASSWORD SCHEMA
 * Validation khi authenticated user muốn change password
 *
 * Security notes:
 * - Require current password (prevent CSRF)
 * - New password phải different từ current password
 * - Invalidate tất cả existing sessions sau change
 * - Send notification email về password change
 * - Implement rate-limit (max N changes per day)
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'validation.required' }),
    password: passwordValidator(),
    passwordConfirm: passwordValidator(),
  })
  .superRefine((data, ctx) => {
    // Check password và confirm match
    if (!passwordMatchValidator(data.password, data.passwordConfirm, ctx)) {
      return;
    }

    // Kiểm tra new password khác current password
    if (data.currentPassword === data.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: PASSWORD_ERROR_MESSAGES.SAME_AS_PREVIOUS,
      });
    }
  });

/**
 * PASSWORD ONLY SCHEMA
 * Reusable schema cho validation password standalone
 * (dùng khi chỉ cần validate password, không cần email/confirm)
 */
export const PasswordOnlySchema = z.object({
  password: passwordValidator(),
});

// Type exports
export type LoginSchema = z.infer<typeof LoginSchema>;
export type RegisterSchema = z.infer<typeof RegisterSchema>;
export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;
export type PasswordOnlySchema = z.infer<typeof PasswordOnlySchema>;

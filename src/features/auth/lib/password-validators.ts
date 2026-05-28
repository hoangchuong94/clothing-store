import { z } from 'zod';
import {
  PASSWORD_CONSTRAINTS,
  PASSWORD_PATTERNS,
  PASSWORD_ERROR_MESSAGES,
} from './password-constants';

/**
 * Hàm validate password theo production standards
 * - Normalize input bằng trim() trước khi validate
 * - Kiểm tra tất cả requirements
 * - Trả về error message chi tiết & friendly
 *
 * @param password - Raw password input từ user
 * @returns { valid: boolean; errors: string[] }
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 1. Normalize: trim whitespace (nhưng để detect trailing/leading)
  const trimmed = password.trim();

  // 2. Kiểm tra nếu user thực sự input whitespace ở đầu/cuối
  if (trimmed !== password) {
    errors.push(PASSWORD_ERROR_MESSAGES.HAS_WHITESPACE);
  }

  // 3. Kiểm tra độ dài
  if (trimmed.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
    errors.push(`${PASSWORD_ERROR_MESSAGES.TOO_SHORT} (${PASSWORD_CONSTRAINTS.MIN_LENGTH})`);
  }

  if (trimmed.length > PASSWORD_CONSTRAINTS.MAX_LENGTH) {
    errors.push(`${PASSWORD_ERROR_MESSAGES.TOO_LONG} (${PASSWORD_CONSTRAINTS.MAX_LENGTH})`);
  }

  // 4. Kiểm tra whitespace nằm bên trong (tab, newline, etc)
  if (PASSWORD_PATTERNS.WHITESPACE.test(trimmed)) {
    errors.push(PASSWORD_ERROR_MESSAGES.HAS_WHITESPACE);
  }

  // 5. Kiểm tra character set requirements
  if (!PASSWORD_PATTERNS.LOWERCASE.test(trimmed)) {
    errors.push(PASSWORD_ERROR_MESSAGES.NO_LOWERCASE);
  }

  if (!PASSWORD_PATTERNS.UPPERCASE.test(trimmed)) {
    errors.push(PASSWORD_ERROR_MESSAGES.NO_UPPERCASE);
  }

  if (!PASSWORD_PATTERNS.NUMBER.test(trimmed)) {
    errors.push(PASSWORD_ERROR_MESSAGES.NO_NUMBER);
  }

  if (!PASSWORD_PATTERNS.SPECIAL_CHAR.test(trimmed)) {
    errors.push(PASSWORD_ERROR_MESSAGES.NO_SPECIAL_CHAR);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Zod Superrefine validator cho password
 * Dùng trong schema để validation tự động
 *
 * Benefit:
 * - Reusable cho Register, Reset Password, Change Password
 * - Tích hợp với Zod schema validation chain
 * - Support custom error messages & i18n
 *
 * Usage:
 *   password: z.string()
 *     .pipe(passwordValidator())
 */
export function passwordValidator() {
  return z
    .string()
    .min(1, { message: PASSWORD_ERROR_MESSAGES.REQUIRED })
    .transform((val) => val.trim())
    .superRefine((password, ctx) => {
      // Sau khi trim, kiểm tra lại độ dài
      if (password.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.TOO_SHORT,
        });
      }

      if (password.length > PASSWORD_CONSTRAINTS.MAX_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.TOO_LONG,
        });
      }

      // Kiểm tra whitespace
      if (PASSWORD_PATTERNS.WHITESPACE.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.HAS_WHITESPACE,
        });
      }

      // Kiểm tra lowercase
      if (!PASSWORD_PATTERNS.LOWERCASE.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.NO_LOWERCASE,
        });
      }

      // Kiểm tra uppercase
      if (!PASSWORD_PATTERNS.UPPERCASE.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.NO_UPPERCASE,
        });
      }

      // Kiểm tra số
      if (!PASSWORD_PATTERNS.NUMBER.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.NO_NUMBER,
        });
      }

      // Kiểm tra ký tự đặc biệt
      if (!PASSWORD_PATTERNS.SPECIAL_CHAR.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: PASSWORD_ERROR_MESSAGES.NO_SPECIAL_CHAR,
        });
      }
    });
}

/**
 * Schema cho password confirmation (matching)
 * Dùng với superRefine để so sánh 2 password
 *
 * Usage:
 *   RegisterSchema = z.object({
 *     password: passwordValidator(),
 *     passwordConfirm: passwordValidator(),
 *   }).superRefine((data, ctx) => {
 *     if (!passwordMatchValidator(data.password, data.passwordConfirm, ctx)) {
 *       // Error đã được add trong hàm
 *     }
 *   })
 */
export function passwordMatchValidator(
  password: string,
  confirm: string,
  ctx: z.RefinementCtx,
): boolean {
  if (password !== confirm) {
    ctx.addIssue({
      code: 'custom',
      path: ['passwordConfirm'],
      message: PASSWORD_ERROR_MESSAGES.MISMATCH,
    });
    return false;
  }
  return true;
}

/**
 * Validator cho check password khác previous password
 * Dùng khi change/reset password
 *
 * @param newPassword - Password mới
 * @param previousPassword - Password cũ (hashed từ DB)
 * @returns boolean - true nếu khác, false nếu giống
 *
 * Note: Phía server cần hash newPassword & compare với previousPassword
 * (không bao giờ store unhashed password)
 */
export function validatePasswordDifferent(newPassword: string, previousPassword: string): boolean {
  // Simple string comparison (server-side sẽ hash compare)
  return newPassword !== previousPassword;
}

/**
 * Check password có nằm trong breached password database không
 * Nên dùng: HaveIBeenPwned API hoặc similar service
 * (Chỉ implement placeholder ở đây - phía server sẽ gọi API)
 *
 * Server-side implementation example:
 * const response = await fetch(
 *   `https://api.pwnedpasswords.com/range/${hash.substring(0, 5)}`
 * );
 * const breachedHashes = response.text();
 * // Check nếu rest of hash nằm trong breachedHashes
 */
export async function validatePasswordNotBreached(_password: string): Promise<boolean> {
  try {
    void _password;
    // Placeholder - implement thực tế với HaveIBeenPwned API
    // Ví dụ:
    // const hash = await sha1(password).toUpperCase();
    // const prefix = hash.substring(0, 5);
    // const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    // ...

    // Hiện tại: always return true (passed validation)
    // Production: call actual API
    return true;
  } catch (error) {
    // Nếu API fail: allow login (don't block user experience)
    console.error('Password breach check failed:', error);
    return true;
  }
}

export type ValidatePasswordResult = ReturnType<typeof validatePasswordStrength>;

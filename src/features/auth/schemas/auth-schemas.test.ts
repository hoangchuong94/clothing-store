import { describe, expect, it } from 'vitest';
import { LoginSchema, RegisterSchema } from './auth-schemas';

describe('auth validation schemas', () => {
  it('validates a login payload with email and password', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123!',
      remember: true,
    });

    expect(result.success).toBe(true);
  });

  it('fails registration when password and confirmation do not match', () => {
    const result = RegisterSchema.safeParse({
      email: 'new.user@example.com',
      name: 'New User',
      password: 'Password123!',
      passwordConfirm: 'Password1234!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path.includes('passwordConfirm'))).toBe(true);
  });
});

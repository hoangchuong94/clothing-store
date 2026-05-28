import { describe, expect, it } from 'vitest';
import { VerifyEmailTokenSchema, ResendVerificationSchema } from './verification-schemas';

describe('email verification schemas', () => {
  it('accepts a non-empty verification token', () => {
    const result = VerifyEmailTokenSchema.safeParse({ token: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty verification token', () => {
    const result = VerifyEmailTokenSchema.safeParse({ token: '' });
    expect(result.success).toBe(false);
  });

  it('validates resend verification payload with locale', () => {
    const result = ResendVerificationSchema.safeParse({
      email: 'user@example.com',
      locale: 'en',
    });
    expect(result.success).toBe(true);
  });
});

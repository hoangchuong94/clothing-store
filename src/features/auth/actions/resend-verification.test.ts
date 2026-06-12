import { beforeEach, describe, expect, it, vi } from 'vitest';

const rateLimitMock = vi.hoisted(() => ({
  reserveAuthRateLimitAttempt: vi.fn(),
}));

const verificationMock = vi.hoisted(() => ({
  resendVerificationByEmail: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '203.0.113.10' })),
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(async () => 'vi'),
}));

vi.mock('../lib/rate-limit', () => rateLimitMock);

vi.mock('../lib/verification/service', () => verificationMock);

import { resendVerificationEmailAction } from './resend-verification';
import { AUTH_ERROR_CODES } from '../types/auth.types';

const validInput = {
  email: 'USER@example.com',
  locale: 'en',
};

describe('resendVerificationEmailAction', () => {
  beforeEach(() => {
    rateLimitMock.reserveAuthRateLimitAttempt.mockReset();
    verificationMock.resendVerificationByEmail.mockReset();

    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValue({ allowed: true });
    verificationMock.resendVerificationByEmail.mockResolvedValue({ success: true });
  });

  it('returns invalid fields and does not reserve or call the service when validation fails', async () => {
    const result = await resendVerificationEmailAction({
      email: 'not-an-email',
      locale: 'en',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.INVALID_FIELDS,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).not.toHaveBeenCalled();
    expect(verificationMock.resendVerificationByEmail).not.toHaveBeenCalled();
  });

  it('returns a generic rate-limit error when RESEND_VERIFICATION_IP blocks first', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValueOnce({
      allowed: false,
      reason: 'BLOCKED',
      retryAfterSeconds: 60,
    });

    const result = await resendVerificationEmailAction(validInput);

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(1);
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'RESEND_VERIFICATION_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(verificationMock.resendVerificationByEmail).not.toHaveBeenCalled();
  });

  it('returns a generic rate-limit error when RESEND_VERIFICATION_EMAIL blocks before service lookup', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({
        allowed: false,
        reason: 'BLOCKED',
        retryAfterSeconds: 60,
      });

    const result = await resendVerificationEmailAction(validInput);

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'RESEND_VERIFICATION_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'RESEND_VERIFICATION_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
    expect(verificationMock.resendVerificationByEmail).not.toHaveBeenCalled();
  });

  it('reserves IP before email and then calls the resend service with parsed data', async () => {
    const result = await resendVerificationEmailAction(validInput);

    expect(result).toEqual({ success: true });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'RESEND_VERIFICATION_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'RESEND_VERIFICATION_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
    expect(verificationMock.resendVerificationByEmail).toHaveBeenCalledWith(
      'user@example.com',
      'en',
    );
  });

  it('preserves cooldown retryAfter when the resend service returns cooldown', async () => {
    verificationMock.resendVerificationByEmail.mockResolvedValue({
      success: false,
      code: 'RESEND_COOLDOWN',
      retryAfterSeconds: 90,
    });

    const result = await resendVerificationEmailAction(validInput);

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.VERIFICATION_RESEND_COOLDOWN,
      },
      data: {
        retryAfterSeconds: 90,
      },
    });
  });
});

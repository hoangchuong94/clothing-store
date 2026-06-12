import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
}));

const bcryptMock = vi.hoisted(() => ({
  compare: vi.fn(),
}));

const rateLimitMock = vi.hoisted(() => ({
  checkAuthRateLimit: vi.fn(),
  consumeAuthRateLimit: vi.fn(),
  reserveAuthRateLimitAttempt: vi.fn(),
  resetAuthRateLimit: vi.fn(),
}));

vi.mock('@/lib/server/prisma/prisma', () => ({
  default: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '203.0.113.10' })),
}));

vi.mock('../lib/rate-limit', () => rateLimitMock);

import { loginWithCredentials } from './login';
import { AUTH_ERROR_CODES } from '../types/auth.types';

describe('loginWithCredentials', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    bcryptMock.compare.mockReset();
    rateLimitMock.checkAuthRateLimit.mockReset();
    rateLimitMock.consumeAuthRateLimit.mockReset();
    rateLimitMock.reserveAuthRateLimitAttempt.mockReset();
    rateLimitMock.resetAuthRateLimit.mockReset();
    rateLimitMock.checkAuthRateLimit.mockResolvedValue({ allowed: true });
    rateLimitMock.consumeAuthRateLimit.mockResolvedValue({ allowed: true });
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValue({ allowed: true });
    rateLimitMock.resetAuthRateLimit.mockResolvedValue(undefined);
  });

  it('returns invalid fields and does not query when input fails validation', async () => {
    const result = await loginWithCredentials({
      email: 'not-an-email',
      password: '',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.INVALID_FIELDS,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(bcryptMock.compare).not.toHaveBeenCalled();
    expect(rateLimitMock.checkAuthRateLimit).not.toHaveBeenCalled();
    expect(rateLimitMock.consumeAuthRateLimit).not.toHaveBeenCalled();
    expect(rateLimitMock.reserveAuthRateLimitAttempt).not.toHaveBeenCalled();
  });

  it('uses parsed login data for credential checks', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed-password',
      status: 'ACTIVE',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'CUSTOMER',
      },
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: 'Password123!',
      remember: true,
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      include: { role: true },
    });
    expect(bcryptMock.compare).toHaveBeenCalledWith('Password123!', 'hashed-password');
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'LOGIN_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
    expect(rateLimitMock.resetAuthRateLimit).toHaveBeenCalledWith({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
    expect(result).toEqual({
      success: true,
      data: {
        redirectUrl: '/',
      },
    });
  });

  it('returns a generic rate-limit error when LOGIN_EMAIL reservation blocks before querying user', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false, reason: 'BLOCKED', retryAfterSeconds: 60 });

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(bcryptMock.compare).not.toHaveBeenCalled();
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
  });

  it('returns a generic rate-limit error when LOGIN_IP reservation blocks before querying user', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValueOnce({
      allowed: false,
      reason: 'BLOCKED',
      retryAfterSeconds: 60,
    });

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(bcryptMock.compare).not.toHaveBeenCalled();
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(1);
  });

  it('reserves email and IP buckets once when the user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await loginWithCredentials({
      email: 'missing@example.com',
      password: 'Password123!',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'LOGIN_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'missing@example.com',
    });
    expect(rateLimitMock.consumeAuthRateLimit).not.toHaveBeenCalled();
  });

  it('reserves email and IP buckets once when the password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed-password',
      status: 'ACTIVE',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'CUSTOMER',
      },
    });
    bcryptMock.compare.mockResolvedValue(false);

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: 'WrongPassword123!',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
    expect(rateLimitMock.consumeAuthRateLimit).not.toHaveBeenCalled();
    expect(rateLimitMock.resetAuthRateLimit).not.toHaveBeenCalled();
  });

  it('compensates LOGIN_EMAIL when password is correct but email is unverified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed-password',
      status: 'ACTIVE',
      emailVerified: null,
      role: {
        name: 'CUSTOMER',
      },
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
      },
      data: {
        redirectUrl: '/verify-email?email=user%40example.com',
      },
    });
    expect(rateLimitMock.consumeAuthRateLimit).not.toHaveBeenCalled();
    expect(rateLimitMock.resetAuthRateLimit).toHaveBeenCalledWith({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
  });

  it('does not query or compare when IP succeeds but email reservation blocks', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false, reason: 'BLOCKED', retryAfterSeconds: 60 });

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'LOGIN_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(bcryptMock.compare).not.toHaveBeenCalled();
    expect(rateLimitMock.resetAuthRateLimit).not.toHaveBeenCalled();
  });
});

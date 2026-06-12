import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

const bcryptMock = vi.hoisted(() => ({
  hash: vi.fn(),
}));

const rateLimitMock = vi.hoisted(() => ({
  reserveAuthRateLimitAttempt: vi.fn(),
}));

const verificationMock = vi.hoisted(() => ({
  createAndSendVerification: vi.fn(),
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

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(async () => 'vi'),
}));

vi.mock('../lib/rate-limit', () => rateLimitMock);

vi.mock('../lib/verification/service', () => verificationMock);

import { registerUser } from './register';
import { AUTH_ERROR_CODES } from '../types/auth.types';

const validRegistration = {
  name: 'New User',
  email: 'new@example.com',
  password: 'Password123!',
  passwordConfirm: 'Password123!',
};

describe('registerUser', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
    bcryptMock.hash.mockReset();
    rateLimitMock.reserveAuthRateLimitAttempt.mockReset();
    verificationMock.createAndSendVerification.mockReset();

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: validRegistration.email,
    });
    bcryptMock.hash.mockResolvedValue('hashed-password');
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValue({ allowed: true });
    verificationMock.createAndSendVerification.mockResolvedValue(undefined);
  });

  it('returns invalid fields and does not reserve or query when input fails validation', async () => {
    const result = await registerUser({
      ...validRegistration,
      email: 'not-an-email',
      password: '',
      passwordConfirm: '',
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.INVALID_FIELDS,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).not.toHaveBeenCalled();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(bcryptMock.hash).not.toHaveBeenCalled();
  });

  it('returns a generic rate-limit error when REGISTER_IP blocks before reserving email', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValueOnce({
      allowed: false,
      reason: 'BLOCKED',
      retryAfterSeconds: 60,
    });

    const result = await registerUser(validRegistration);

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(1);
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'REGISTER_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(bcryptMock.hash).not.toHaveBeenCalled();
  });

  it('returns a generic rate-limit error when REGISTER_EMAIL blocks before querying user', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({
        allowed: false,
        reason: 'BLOCKED',
        retryAfterSeconds: 60,
      });

    const result = await registerUser(validRegistration);

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'REGISTER_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'REGISTER_EMAIL',
      scope: 'email',
      email: validRegistration.email,
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(bcryptMock.hash).not.toHaveBeenCalled();
  });

  it('creates the user and keeps registration reservations on successful registration', async () => {
    const result = await registerUser(validRegistration);

    expect(result).toEqual({
      success: true,
      data: {
        redirectUrl: '/verify-email?email=new%40example.com',
        email: validRegistration.email,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: validRegistration.email },
    });
    expect(bcryptMock.hash).toHaveBeenCalledWith(validRegistration.password, 12);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: validRegistration.name,
        email: validRegistration.email,
        password: 'hashed-password',
        role: {
          connect: {
            name: 'CUSTOMER',
          },
        },
      },
    });
  });

  it('consumes reservations when the email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: validRegistration.email,
    });

    const result = await registerUser(validRegistration);

    expect(result).toMatchObject({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
      },
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: validRegistration.email },
    });
    expect(bcryptMock.hash).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('reserves REGISTER_IP before REGISTER_EMAIL', async () => {
    await registerUser(validRegistration);

    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'REGISTER_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(2, {
      action: 'REGISTER_EMAIL',
      scope: 'email',
      email: validRegistration.email,
    });
  });
});

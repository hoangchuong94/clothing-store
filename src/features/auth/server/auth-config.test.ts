import { beforeEach, describe, expect, it, vi } from 'vitest';

const capturedAuthConfig = vi.hoisted(() => ({
  value: undefined as any,
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  role: {
    findUnique: vi.fn(),
  },
  emailVerificationToken: {
    updateMany: vi.fn(),
  },
}));

const bcryptMock = vi.hoisted(() => ({
  compare: vi.fn(),
}));

const rateLimitMock = vi.hoisted(() => ({
  reserveAuthRateLimitAttempt: vi.fn(),
  resetAuthRateLimit: vi.fn(),
}));

vi.mock('next-auth', () => ({
  default: vi.fn((config) => {
    capturedAuthConfig.value = config;

    return {
      handlers: {
        GET: vi.fn(),
        POST: vi.fn(),
      },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  }),
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => ({
    id: 'credentials',
    type: 'credentials',
    ...config,
  })),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((config) => ({
    id: 'google',
    type: 'oauth',
    ...config,
  })),
}));

vi.mock('next-auth/providers/github', () => ({
  default: vi.fn((config) => ({
    id: 'github',
    type: 'oauth',
    ...config,
  })),
}));

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock('@/lib/server/prisma/prisma', () => ({
  default: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

vi.mock('../lib/rate-limit', () => rateLimitMock);

import './auth-config';

function credentialsProvider() {
  const provider = capturedAuthConfig.value.providers.find(
    (candidate: { id?: string }) => candidate.id === 'credentials',
  );

  if (!provider) {
    throw new Error('Credentials provider was not registered');
  }

  return provider;
}

function credentialsRequest() {
  return new Request('https://example.com/api/auth/callback/credentials', {
    headers: {
      'x-forwarded-for': '203.0.113.10',
    },
  });
}

describe('Auth.js credentials authorize rate limiting', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.update.mockReset();
    prismaMock.role.findUnique.mockReset();
    prismaMock.emailVerificationToken.updateMany.mockReset();
    bcryptMock.compare.mockReset();
    rateLimitMock.reserveAuthRateLimitAttempt.mockReset();
    rateLimitMock.resetAuthRateLimit.mockReset();
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValue({ allowed: true });
    rateLimitMock.resetAuthRateLimit.mockResolvedValue(undefined);
  });

  it('blocks Auth.js credentials path on LOGIN_IP before Prisma or bcrypt', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt.mockResolvedValueOnce({
      allowed: false,
      reason: 'BLOCKED',
      retryAfterSeconds: 60,
    });

    const result = await credentialsProvider().authorize(
      {
        email: 'user@example.com',
        password: 'Password123!',
      },
      credentialsRequest(),
    );

    expect(result).toBeNull();
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(1);
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenNthCalledWith(1, {
      action: 'LOGIN_IP',
      scope: 'ip',
      ip: '203.0.113.10',
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(bcryptMock.compare).not.toHaveBeenCalled();
  });

  it('blocks Auth.js credentials path on LOGIN_EMAIL before Prisma or bcrypt', async () => {
    rateLimitMock.reserveAuthRateLimitAttempt
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false, reason: 'BLOCKED', retryAfterSeconds: 60 });

    const result = await credentialsProvider().authorize(
      {
        email: 'user@example.com',
        password: 'Password123!',
      },
      credentialsRequest(),
    );

    expect(result).toBeNull();
    expect(rateLimitMock.reserveAuthRateLimitAttempt).toHaveBeenCalledTimes(2);
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
  });

  it('resets LOGIN_EMAIL on successful Auth.js credentials login', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      image: null,
      password: 'hashed-password',
      status: 'ACTIVE',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'CUSTOMER',
      },
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await credentialsProvider().authorize(
      {
        email: 'user@example.com',
        password: 'Password123!',
      },
      credentialsRequest(),
    );

    expect(result).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      role: 'CUSTOMER',
      scopes: ['account', 'cart'],
      isEmailVerified: true,
    });
    expect(rateLimitMock.resetAuthRateLimit).toHaveBeenCalledTimes(1);
    expect(rateLimitMock.resetAuthRateLimit).toHaveBeenCalledWith({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
  });

  it('preserves email-not-verified Auth.js UX while compensating LOGIN_EMAIL', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      image: null,
      password: 'hashed-password',
      status: 'ACTIVE',
      emailVerified: null,
      role: {
        name: 'CUSTOMER',
      },
    });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await credentialsProvider().authorize(
      {
        email: 'user@example.com',
        password: 'Password123!',
      },
      credentialsRequest(),
    );

    expect(result).toBeNull();
    expect(rateLimitMock.resetAuthRateLimit).toHaveBeenCalledWith({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
    });
  });

  it('does not bypass rate limiting when server action and authorize share credential verification', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      image: null,
      password: 'hashed-password',
      status: 'ACTIVE',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'CUSTOMER',
      },
    });
    bcryptMock.compare.mockResolvedValue(true);

    await credentialsProvider().authorize(
      {
        email: 'user@example.com',
        password: 'Password123!',
      },
      credentialsRequest(),
    );

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
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(bcryptMock.compare).toHaveBeenCalledTimes(1);
  });
});

describe('Auth.js session status invalidation', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.update.mockReset();
    prismaMock.role.findUnique.mockReset();
    prismaMock.emailVerificationToken.updateMany.mockReset();
  });

  it('keeps ACTIVE existing sessions usable', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      status: 'ACTIVE',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'ADMIN',
      },
    });

    const token = await capturedAuthConfig.value.callbacks.jwt({
      token: {
        id: 'admin-1',
        role: 'ADMIN',
        scopes: ['admin', 'staff'],
        isEmailVerified: true,
      },
    });

    const session = await capturedAuthConfig.value.callbacks.session({
      session: {
        user: {},
      },
      token,
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'admin-1' },
      select: {
        status: true,
        emailVerified: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    expect(token).toMatchObject({
      id: 'admin-1',
      role: 'ADMIN',
      scopes: ['admin', 'staff'],
      isEmailVerified: true,
      isUserActive: true,
    });
    expect(session.user).toMatchObject({
      id: 'admin-1',
      role: 'ADMIN',
      scopes: ['admin', 'staff'],
      isEmailVerified: true,
    });
  });

  it('invalidates BANNED users with existing sessions', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      status: 'BANNED',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'ADMIN',
      },
    });

    const token = await capturedAuthConfig.value.callbacks.jwt({
      token: {
        id: 'admin-1',
        role: 'ADMIN',
        scopes: ['admin', 'staff'],
        isEmailVerified: true,
      },
    });

    const session = await capturedAuthConfig.value.callbacks.session({
      session: {
        user: {
          id: 'admin-1',
        },
      },
      token,
    });

    expect(token.id).toBeUndefined();
    expect(token.role).toBeUndefined();
    expect(token.scopes).toBeUndefined();
    expect(token.isEmailVerified).toBe(false);
    expect(token.isUserActive).toBe(false);
    expect(session.user).toBeUndefined();
  });

  it('invalidates INACTIVE users with existing sessions', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      status: 'INACTIVE',
      emailVerified: new Date('2026-01-01T00:00:00.000Z'),
      role: {
        name: 'CUSTOMER',
      },
    });

    const token = await capturedAuthConfig.value.callbacks.jwt({
      token: {
        id: 'user-1',
        role: 'CUSTOMER',
        scopes: ['account', 'cart'],
        isEmailVerified: true,
      },
    });

    const session = await capturedAuthConfig.value.callbacks.session({
      session: {
        user: {
          id: 'user-1',
        },
      },
      token,
    });

    expect(token.id).toBeUndefined();
    expect(token.role).toBeUndefined();
    expect(token.scopes).toBeUndefined();
    expect(token.isEmailVerified).toBe(false);
    expect(token.isUserActive).toBe(false);
    expect(session.user).toBeUndefined();
  });
});

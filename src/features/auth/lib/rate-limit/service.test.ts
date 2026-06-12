import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
}));

vi.mock('@/lib/server/prisma/prisma', () => ({
  default: prismaMock,
}));

import {
  checkAuthRateLimit,
  consumeAuthRateLimit,
  createAuthRateLimitContext,
  reserveAuthRateLimitAttempt,
  resetAuthRateLimit,
} from './service';

describe('auth rate-limit service', () => {
  beforeEach(() => {
    prismaMock.$queryRaw.mockReset();
    prismaMock.$executeRaw.mockReset();
  });

  it('creates an email rate-limit context with hash and policy', () => {
    const context = createAuthRateLimitContext({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: ' USER@example.com ',
      secret: 'test-secret',
    });

    expect(context).toMatchObject({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      policy: {
        windowSeconds: 15 * 60,
        threshold: 5,
        blockSeconds: 15 * 60,
      },
    });
    expect(context.keyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(context.keyHash).not.toContain('user@example.com');
  });

  it('creates an IP rate-limit context with hash and policy', () => {
    const context = createAuthRateLimitContext({
      action: 'REGISTER_IP',
      scope: 'ip',
      ip: '203.0.113.10',
      secret: 'test-secret',
    });

    expect(context).toMatchObject({
      action: 'REGISTER_IP',
      scope: 'ip',
      policy: {
        windowSeconds: 60 * 60,
        threshold: 10,
        blockSeconds: 60 * 60,
      },
    });
    expect(context.keyHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('allows when no bucket exists', async () => {
    prismaMock.$queryRaw.mockResolvedValue([]);

    const result = await checkAuthRateLimit({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
      secret: 'test-secret',
    });

    expect(result.allowed).toBe(true);
    expect(prismaMock.$queryRaw).toHaveBeenCalledOnce();
  });

  it('blocks when an active blockedUntil is present', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    prismaMock.$queryRaw.mockResolvedValue([
      {
        count: 6,
        windowExpires: new Date('2026-06-02T00:15:00.000Z'),
        blockedUntil: new Date('2026-06-02T00:10:00.000Z'),
      },
    ]);

    const result = await checkAuthRateLimit(
      {
        action: 'LOGIN_EMAIL',
        scope: 'email',
        email: 'user@example.com',
        secret: 'test-secret',
      },
      now,
    );

    expect(result).toMatchObject({
      allowed: false,
      reason: 'BLOCKED',
      retryAfterSeconds: 600,
    });
  });

  it('records failed attempts with an atomic upsert and returns the row decision', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    prismaMock.$queryRaw.mockResolvedValue([
      {
        count: 1,
        windowExpires: new Date('2026-06-02T00:15:00.000Z'),
        blockedUntil: null,
      },
    ]);

    const result = await consumeAuthRateLimit(
      {
        action: 'LOGIN_IP',
        scope: 'ip',
        ip: '203.0.113.10',
        secret: 'test-secret',
      },
      now,
    );

    expect(result.allowed).toBe(true);
    expect(prismaMock.$queryRaw).toHaveBeenCalledOnce();
  });

  it('allows the threshold attempt after reservation', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    prismaMock.$queryRaw.mockResolvedValue([
      {
        count: 5,
        windowExpires: new Date('2026-06-02T00:15:00.000Z'),
        blockedUntil: null,
      },
    ]);

    const result = await reserveAuthRateLimitAttempt(
      {
        action: 'LOGIN_EMAIL',
        scope: 'email',
        email: 'user@example.com',
        secret: 'test-secret',
      },
      now,
    );

    expect(result.allowed).toBe(true);
  });

  it('blocks threshold plus one after reservation', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    prismaMock.$queryRaw.mockResolvedValue([
      {
        count: 6,
        windowExpires: new Date('2026-06-02T00:15:00.000Z'),
        blockedUntil: new Date('2026-06-02T00:15:00.000Z'),
      },
    ]);

    const result = await reserveAuthRateLimitAttempt(
      {
        action: 'LOGIN_EMAIL',
        scope: 'email',
        email: 'user@example.com',
        secret: 'test-secret',
      },
      now,
    );

    expect(result).toMatchObject({
      allowed: false,
      reason: 'BLOCKED',
      retryAfterSeconds: 900,
    });
  });

  it('resets a bucket by action and hashed key', async () => {
    prismaMock.$executeRaw.mockResolvedValue(1);

    await resetAuthRateLimit({
      action: 'LOGIN_EMAIL',
      scope: 'email',
      email: 'user@example.com',
      secret: 'test-secret',
    });

    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
  });
});

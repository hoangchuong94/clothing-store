import { describe, expect, it } from 'vitest';

import {
  buildEmailRateLimitKey,
  buildIpRateLimitKey,
  getAuthRateLimitSecret,
  hashRateLimitKey,
  normalizeRateLimitEmail,
  normalizeRateLimitIp,
} from './keys';

describe('auth rate-limit keys', () => {
  it('normalizes email and IP values before hashing', () => {
    expect(normalizeRateLimitEmail('  USER@Example.COM ')).toBe('user@example.com');
    expect(normalizeRateLimitIp('  203.0.113.10 ')).toBe('203.0.113.10');
    expect(normalizeRateLimitIp(undefined)).toBe('unknown');
  });

  it('builds stable hashes without exposing raw identifiers', () => {
    const a = buildEmailRateLimitKey('LOGIN_EMAIL', 'USER@example.com', 'test-secret');
    const b = buildEmailRateLimitKey('LOGIN_EMAIL', ' user@example.com ', 'test-secret');

    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toContain('user@example.com');
  });

  it('separates keys by action and scope', () => {
    const emailHash = buildEmailRateLimitKey('LOGIN_EMAIL', 'user@example.com', 'test-secret');
    const registerHash = buildEmailRateLimitKey(
      'REGISTER_EMAIL',
      'user@example.com',
      'test-secret',
    );
    const ipHash = buildIpRateLimitKey('LOGIN_IP', 'user@example.com', 'test-secret');

    expect(emailHash).not.toBe(registerHash);
    expect(emailHash).not.toBe(ipHash);
  });

  it('uses explicit hash input when provided', () => {
    expect(
      hashRateLimitKey({
        action: 'LOGIN_IP',
        value: '203.0.113.10',
        secret: 'test-secret',
      }),
    ).toMatch(/^[a-f0-9]{64}$/);
  });

  it('resolves a dedicated secret before falling back to AUTH_SECRET', () => {
    expect(
      getAuthRateLimitSecret({
        AUTH_RATE_LIMIT_SECRET: 'rate-limit-secret',
        AUTH_SECRET: 'auth-secret',
      }),
    ).toBe('rate-limit-secret');
    expect(getAuthRateLimitSecret({ AUTH_SECRET: 'auth-secret' })).toBe('auth-secret');
  });
});

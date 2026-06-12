import { describe, expect, it } from 'vitest';

import {
  AUTH_RATE_LIMIT_ACTIONS,
  AUTH_RATE_LIMIT_POLICIES,
  RESEND_VERIFICATION_COOLDOWN_SECONDS,
  getAuthRateLimitPolicy,
  isAuthRateLimitAction,
} from './config';

describe('auth rate-limit config', () => {
  it('defines a policy for every supported action', () => {
    for (const action of AUTH_RATE_LIMIT_ACTIONS) {
      expect(AUTH_RATE_LIMIT_POLICIES[action]).toEqual(
        expect.objectContaining({
          windowSeconds: expect.any(Number),
          threshold: expect.any(Number),
          blockSeconds: expect.any(Number),
        }),
      );
    }
  });

  it('uses the final login/register/resend thresholds', () => {
    expect(getAuthRateLimitPolicy('LOGIN_EMAIL')).toMatchObject({
      windowSeconds: 15 * 60,
      threshold: 5,
      blockSeconds: 15 * 60,
    });
    expect(getAuthRateLimitPolicy('LOGIN_IP')).toMatchObject({
      windowSeconds: 15 * 60,
      threshold: 30,
      blockSeconds: 15 * 60,
    });
    expect(getAuthRateLimitPolicy('REGISTER_EMAIL')).toMatchObject({
      windowSeconds: 60 * 60,
      threshold: 3,
      blockSeconds: 60 * 60,
    });
    expect(getAuthRateLimitPolicy('REGISTER_IP')).toMatchObject({
      windowSeconds: 60 * 60,
      threshold: 10,
      blockSeconds: 60 * 60,
    });
    expect(getAuthRateLimitPolicy('RESEND_VERIFICATION_EMAIL')).toMatchObject({
      windowSeconds: 60 * 60,
      threshold: 3,
      blockSeconds: 60 * 60,
    });
    expect(getAuthRateLimitPolicy('RESEND_VERIFICATION_IP')).toMatchObject({
      windowSeconds: 60 * 60,
      threshold: 10,
      blockSeconds: 60 * 60,
    });
    expect(RESEND_VERIFICATION_COOLDOWN_SECONDS).toBe(2 * 60);
  });

  it('validates supported action names', () => {
    expect(isAuthRateLimitAction('LOGIN_EMAIL')).toBe(true);
    expect(isAuthRateLimitAction('LOGIN_USER')).toBe(false);
  });
});

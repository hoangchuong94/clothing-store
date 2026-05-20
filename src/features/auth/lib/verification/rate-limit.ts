import { verificationConfig } from './config';

export type ResendRateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: 'COOLDOWN'; retryAfterSeconds: number }
  | { allowed: false; reason: 'HOURLY_LIMIT' };

interface ResendState {
  verificationResendAt: Date | null;
  verificationResendCount: number;
  verificationResendWindowStart: Date | null;
}

const HOUR_MS = 60 * 60 * 1000;

export function checkResendRateLimit(
  state: ResendState,
  now: Date = new Date(),
): ResendRateLimitResult {
  if (state.verificationResendAt) {
    const cooldownMs = verificationConfig.resendCooldownMinutes * 60 * 1000;
    const elapsed = now.getTime() - state.verificationResendAt.getTime();
    if (elapsed < cooldownMs) {
      return {
        allowed: false,
        reason: 'COOLDOWN',
        retryAfterSeconds: Math.ceil((cooldownMs - elapsed) / 1000),
      };
    }
  }

  let count = state.verificationResendCount;
  let windowStart = state.verificationResendWindowStart;

  if (!windowStart || now.getTime() - windowStart.getTime() >= HOUR_MS) {
    return { allowed: true };
  }

  if (count >= verificationConfig.maxResendsPerHour) {
    return { allowed: false, reason: 'HOURLY_LIMIT' };
  }

  return { allowed: true };
}

export function nextResendState(
  state: ResendState,
  now: Date = new Date(),
): Pick<
  ResendState,
  'verificationResendAt' | 'verificationResendCount' | 'verificationResendWindowStart'
> {
  let count = state.verificationResendCount;
  let windowStart = state.verificationResendWindowStart;

  if (!windowStart || now.getTime() - windowStart.getTime() >= HOUR_MS) {
    windowStart = now;
    count = 1;
  } else {
    count += 1;
  }

  return {
    verificationResendAt: now,
    verificationResendCount: count,
    verificationResendWindowStart: windowStart,
  };
}

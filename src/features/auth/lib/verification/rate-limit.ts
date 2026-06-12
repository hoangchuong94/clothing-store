import { RESEND_VERIFICATION_COOLDOWN_SECONDS } from '../rate-limit/config';

export type ResendCooldownResult =
  | { allowed: true }
  | { allowed: false; reason: 'COOLDOWN'; retryAfterSeconds: number };

interface ResendCooldownState {
  verificationResendAt: Date | null;
}

export function checkResendCooldown(
  state: ResendCooldownState,
  now: Date = new Date(),
): ResendCooldownResult {
  if (state.verificationResendAt) {
    const cooldownMs = RESEND_VERIFICATION_COOLDOWN_SECONDS * 1000;
    const elapsed = now.getTime() - state.verificationResendAt.getTime();
    if (elapsed < cooldownMs) {
      return {
        allowed: false,
        reason: 'COOLDOWN',
        retryAfterSeconds: Math.ceil((cooldownMs - elapsed) / 1000),
      };
    }
  }

  return { allowed: true };
}

export function nextResendCooldownState(
  now: Date = new Date(),
): Pick<ResendCooldownState, 'verificationResendAt'> {
  return {
    verificationResendAt: now,
  };
}

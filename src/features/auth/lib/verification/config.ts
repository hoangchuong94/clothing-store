function parseIntEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const verificationConfig = {
  tokenExpiryHours: parseIntEnv('EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS', 24),
  resendCooldownMinutes: parseIntEnv('EMAIL_VERIFICATION_RESEND_COOLDOWN_MINUTES', 1),
  maxResendsPerHour: parseIntEnv('EMAIL_VERIFICATION_MAX_ATTEMPTS_PER_HOUR', 5),
  tokenByteLength: 32,
} as const;

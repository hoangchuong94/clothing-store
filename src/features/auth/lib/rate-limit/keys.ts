import { createHmac } from 'node:crypto';

import {
  AUTH_RATE_LIMIT_SECRET_ENV,
  type AuthRateLimitAction,
} from './config';

type EnvLike = Record<string, string | undefined>;

export type AuthRateLimitKeyInput = {
  action: AuthRateLimitAction;
  value: string;
  secret?: string;
};

export function normalizeRateLimitEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeRateLimitIp(ip: string | null | undefined): string {
  const value = ip?.trim().toLowerCase();
  return value || 'unknown';
}

export function getAuthRateLimitSecret(env: EnvLike = process.env): string {
  const secret = env[AUTH_RATE_LIMIT_SECRET_ENV] || env.AUTH_SECRET;

  if (!secret) {
    throw new Error(`${AUTH_RATE_LIMIT_SECRET_ENV} or AUTH_SECRET must be configured`);
  }

  return secret;
}

export function hashRateLimitKey({ action, value, secret }: AuthRateLimitKeyInput): string {
  const resolvedSecret = secret ?? getAuthRateLimitSecret();
  return createHmac('sha256', resolvedSecret)
    .update(`${action}:${value}`)
    .digest('hex');
}

export function buildEmailRateLimitKey(
  action: Extract<AuthRateLimitAction, 'LOGIN_EMAIL' | 'REGISTER_EMAIL' | 'RESEND_VERIFICATION_EMAIL'>,
  email: string,
  secret?: string,
): string {
  return hashRateLimitKey({
    action,
    value: normalizeRateLimitEmail(email),
    secret,
  });
}

export function buildIpRateLimitKey(
  action: Extract<AuthRateLimitAction, 'LOGIN_IP' | 'REGISTER_IP' | 'RESEND_VERIFICATION_IP'>,
  ip: string | null | undefined,
  secret?: string,
): string {
  return hashRateLimitKey({
    action,
    value: normalizeRateLimitIp(ip),
    secret,
  });
}

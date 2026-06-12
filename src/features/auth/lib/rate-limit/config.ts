export const AUTH_RATE_LIMIT_SECRET_ENV = 'AUTH_RATE_LIMIT_SECRET';

export const AUTH_RATE_LIMIT_ACTIONS = [
  'LOGIN_EMAIL',
  'LOGIN_IP',
  'REGISTER_EMAIL',
  'REGISTER_IP',
  'RESEND_VERIFICATION_EMAIL',
  'RESEND_VERIFICATION_IP',
] as const;

export type AuthRateLimitAction = (typeof AUTH_RATE_LIMIT_ACTIONS)[number];

export type AuthRateLimitPolicy = {
  windowSeconds: number;
  threshold: number;
  blockSeconds: number;
};

const minutes = (value: number) => value * 60;
const hours = (value: number) => minutes(value * 60);

export const RESEND_VERIFICATION_COOLDOWN_SECONDS = minutes(2);

export const AUTH_RATE_LIMIT_POLICIES = {
  LOGIN_EMAIL: {
    windowSeconds: minutes(15),
    threshold: 5,
    blockSeconds: minutes(15),
  },
  LOGIN_IP: {
    windowSeconds: minutes(15),
    threshold: 30,
    blockSeconds: minutes(15),
  },
  REGISTER_EMAIL: {
    windowSeconds: hours(1),
    threshold: 3,
    blockSeconds: hours(1),
  },
  REGISTER_IP: {
    windowSeconds: hours(1),
    threshold: 10,
    blockSeconds: hours(1),
  },
  RESEND_VERIFICATION_EMAIL: {
    windowSeconds: hours(1),
    threshold: 3,
    blockSeconds: hours(1),
  },
  RESEND_VERIFICATION_IP: {
    windowSeconds: hours(1),
    threshold: 10,
    blockSeconds: hours(1),
  },
} satisfies Record<AuthRateLimitAction, AuthRateLimitPolicy>;

export function isAuthRateLimitAction(value: unknown): value is AuthRateLimitAction {
  return (
    typeof value === 'string' &&
    (AUTH_RATE_LIMIT_ACTIONS as readonly string[]).includes(value)
  );
}

export function getAuthRateLimitPolicy(action: AuthRateLimitAction): AuthRateLimitPolicy {
  return AUTH_RATE_LIMIT_POLICIES[action];
}

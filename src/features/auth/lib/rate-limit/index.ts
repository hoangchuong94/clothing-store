export {
  AUTH_RATE_LIMIT_ACTIONS,
  AUTH_RATE_LIMIT_POLICIES,
  AUTH_RATE_LIMIT_SECRET_ENV,
  RESEND_VERIFICATION_COOLDOWN_SECONDS,
  getAuthRateLimitPolicy,
  isAuthRateLimitAction,
} from './config';
export type { AuthRateLimitAction, AuthRateLimitPolicy } from './config';

export {
  buildEmailRateLimitKey,
  buildIpRateLimitKey,
  getAuthRateLimitSecret,
  hashRateLimitKey,
  normalizeRateLimitEmail,
  normalizeRateLimitIp,
} from './keys';
export type { AuthRateLimitKeyInput } from './keys';

export { extractClientIp } from './request';
export type { HeadersLike } from './request';

export {
  checkAuthRateLimit,
  consumeAuthRateLimit,
  createAuthRateLimitContext,
  reserveAuthRateLimitAttempt,
  resetAuthRateLimit,
} from './service';
export type {
  AuthRateLimitCheckInput,
  AuthRateLimitContext,
  AuthRateLimitResult,
  AuthRateLimitScope,
} from './service';

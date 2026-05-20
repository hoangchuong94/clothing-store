import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { verificationConfig } from './config';

/**
 * Generate a cryptographically secure verification token (plaintext, sent via email only).
 */
export function generateVerificationToken(): string {
  return randomBytes(verificationConfig.tokenByteLength).toString('base64url');
}

/**
 * Hash token with SHA-256 before persisting.
 */
export function hashVerificationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Constant-time comparison of hashed tokens.
 */
export function verifyTokenHash(plainToken: string, storedHash: string): boolean {
  const computed = hashVerificationToken(plainToken);
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getVerificationExpiryDate(): Date {
  const expires = new Date();
  expires.setHours(expires.getHours() + verificationConfig.tokenExpiryHours);
  return expires;
}

'use server';

import { VerifyEmailTokenSchema } from '../schemas/verification-schemas';
import { verifyEmailWithToken } from '../lib/verification/service';

export type VerifyEmailActionResult = {
  status: 'SUCCESS' | 'ALREADY_VERIFIED' | 'INVALID_OR_EXPIRED';
};

export async function verifyEmailAction(
  token: string,
): Promise<VerifyEmailActionResult> {
  const parsed = VerifyEmailTokenSchema.safeParse({ token });

  if (!parsed.success) {
    return { status: 'INVALID_OR_EXPIRED' };
  }

  try {
    return await verifyEmailWithToken(parsed.data.token);
  } catch (error) {
    console.error('Email verification error:', error);
    return { status: 'INVALID_OR_EXPIRED' };
  }
}

/**
 * Server action for programmatic verification (e.g. future forms).
 * Email links should use the /verify-email/confirm page instead.
 */
export async function confirmEmailVerificationAction(token: string): Promise<VerifyEmailActionResult> {
  return verifyEmailAction(token);
}

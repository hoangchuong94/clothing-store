'use server';

import { getLocale } from 'next-intl/server';

import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { ResendVerificationSchema } from '../schemas/verification-schemas';
import { resendVerificationByEmail } from '../lib/verification/service';

export type ResendVerificationData = {
  retryAfterSeconds?: number;
};

export async function resendVerificationEmailAction(
  input: { email: string; locale?: string },
): Promise<AuthResponse<ResendVerificationData>> {
  try {
    const locale = input.locale ?? (await getLocale());
    const parsed = ResendVerificationSchema.safeParse({
      email: input.email,
      locale,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_FIELDS),
      };
    }

    const result = await resendVerificationByEmail(
      parsed.data.email,
      parsed.data.locale,
    );

    if (!result.success) {
      if (result.code === 'RESEND_COOLDOWN') {
        return {
          success: false,
          error: AuthErrorHandler.createError(
            AUTH_ERROR_CODES.VERIFICATION_RESEND_COOLDOWN,
          ),
          data: { retryAfterSeconds: result.retryAfterSeconds },
        };
      }

      return {
        success: false,
        error: AuthErrorHandler.createError(
          AUTH_ERROR_CODES.VERIFICATION_RESEND_LIMIT,
        ),
      };
    }

    // Generic success — prevents email enumeration
    return { success: true };
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      error: AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR),
    };
  }
}

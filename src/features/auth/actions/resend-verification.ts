'use server';

import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { ResendVerificationSchema } from '../schemas/verification-schemas';
import { resendVerificationByEmail } from '../lib/verification/service';
import { reserveAuthRateLimitAttempt } from '../lib/rate-limit';
import { extractClientIp } from '../lib/rate-limit/request';

export type ResendVerificationData = {
  retryAfterSeconds?: number;
};

function createRateLimitError() {
  return AuthErrorHandler.createError(AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED);
}

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

    const requestHeaders = await headers();
    const ip = extractClientIp(requestHeaders);
    const ipRateLimitInput = {
      action: 'RESEND_VERIFICATION_IP' as const,
      scope: 'ip' as const,
      ip,
    };
    const emailRateLimitInput = {
      action: 'RESEND_VERIFICATION_EMAIL' as const,
      scope: 'email' as const,
      email: parsed.data.email,
    };

    const ipReservation = await reserveAuthRateLimitAttempt(ipRateLimitInput);
    if (!ipReservation.allowed) {
      return {
        success: false,
        error: createRateLimitError(),
      };
    }

    const emailReservation = await reserveAuthRateLimitAttempt(emailRateLimitInput);
    if (!emailReservation.allowed) {
      return {
        success: false,
        error: createRateLimitError(),
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

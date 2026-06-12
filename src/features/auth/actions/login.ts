'use server';

import { headers } from 'next/headers';
import { LoginSchema } from '../schemas/auth-schemas';
import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { getRedirectUrlForRole } from '../lib/callback-url';
import { APP_ROUTES } from '../config/app-routes';
import { verifyCredentialsLogin } from '../server/credentials-login';

function createRateLimitError() {
  return AuthErrorHandler.createError(AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED);
}

export async function loginWithCredentials(
  credentials: unknown,
): Promise<AuthResponse<{ redirectUrl?: string }>> {
  try {
    const validatedFields = LoginSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_FIELDS),
      };
    }

    const { email, password } = validatedFields.data;
    const requestHeaders = await headers();
    const result = await verifyCredentialsLogin({ email, password }, requestHeaders);

    if (result.status === 'RATE_LIMIT_EXCEEDED') {
      return {
        success: false,
        error: createRateLimitError(),
      };
    }

    if (result.status === 'INVALID_CREDENTIALS') {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_CREDENTIALS),
      };
    }

    if (result.status === 'EMAIL_NOT_VERIFIED') {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED),
        data: {
          redirectUrl: `${APP_ROUTES.AUTH.VERIFY_EMAIL}?email=${encodeURIComponent(result.email)}`,
        },
      };
    }

    return {
      success: true,
      data: {
        redirectUrl: getRedirectUrlForRole(result.user.role.name),
      },
    };
  } catch (error) {
    console.error('Login error:', error);

    const authError =
      error instanceof Error
        ? AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR, error.message)
        : AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR);

    return {
      success: false,
      error: authError,
    };
  }
}

'use server';

import bcrypt from 'bcryptjs';
import { LoginSchema } from '../schemas/auth-schemas';
import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { getRedirectUrlForRole } from '../lib/callback-url';
import prisma from '@/lib/server/prisma/prisma';
import { isEmailVerified } from '../lib/verification/status';
import { APP_ROUTES } from '../config/app-routes';

export async function loginWithCredentials(
  credentials: LoginSchema,
): Promise<AuthResponse<{ redirectUrl?: string }>> {
  try {
    // Validate input
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_FIELDS),
      };
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        role: true,
      },
    });

    // Check if user exists and is active
    if (!user || !user.password || !user.role || user.status !== 'ACTIVE') {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_CREDENTIALS),
      };
    }

    // Verify password
    const valid = await bcrypt.compare(credentials.password, user.password);
    if (!valid) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_CREDENTIALS),
      };
    }

    if (!isEmailVerified(user.emailVerified)) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED),
        data: {
          redirectUrl: `${APP_ROUTES.AUTH.VERIFY_EMAIL}?email=${encodeURIComponent(user.email ?? credentials.email)}`,
        },
      };
    }

    return {
      success: true,
      data: {
        redirectUrl: getRedirectUrlForRole(user.role.name),
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

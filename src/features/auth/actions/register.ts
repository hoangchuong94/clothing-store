'use server';

import bcrypt from 'bcryptjs';
import { RegisterSchema } from '../schemas/auth-schemas';
import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import prisma from '@/lib/server/prisma/prisma';
import { getRedirectUrlForRole } from '../lib/callback-url';

export async function registerUser(
  credentials: RegisterSchema,
): Promise<AuthResponse<{ redirectUrl: string }>> {
  try {
    if (
      !credentials.name ||
      !credentials.email ||
      !credentials.password ||
      !credentials.passwordConfirm
    ) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_FIELDS),
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS),
      };
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 12);

    const user = await prisma.user.create({
      data: {
        name: credentials.name,
        email: credentials.email,
        password: hashedPassword,
        role: {
          connect: {
            name: 'CUSTOMER',
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.DATABASE_ERROR),
      };
    }

    return {
      success: true,
      data: {
        redirectUrl: getRedirectUrlForRole('CUSTOMER'),
      },
    };
  } catch (error) {
    console.error('Registration error:', error);

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

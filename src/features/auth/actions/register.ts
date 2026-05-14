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
    const validatedFields = RegisterSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_FIELDS),
      };
    }

    const { name, email, password } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: {
          connect: {
            name: 'CUSTOMER',
          },
        },
      },
    });

    return {
      success: true,
      data: {
        redirectUrl: getRedirectUrlForRole('CUSTOMER'),
      },
    };
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error) {
      const prismaError = error as {
        code?: string;
        meta?: { target?: unknown };
      };

      if (
        prismaError.code === 'P2002' &&
        prismaError.meta?.target &&
        JSON.stringify(prismaError.meta.target).includes('email')
      ) {
        return {
          success: false,
          error: AuthErrorHandler.createError(AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS),
        };
      }
    }

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

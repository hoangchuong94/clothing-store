'use server';

import bcrypt from 'bcryptjs';
import { getLocale } from 'next-intl/server';

import { RegisterSchema } from '../schemas/auth-schemas';
import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import prisma from '@/lib/server/prisma/prisma';
import { APP_ROUTES } from '../config/app-routes';
import { createAndSendVerification } from '../lib/verification/service';
import type { EmailLocale } from '@/lib/email/types';

export async function registerUser(
  credentials: RegisterSchema,
): Promise<AuthResponse<{ redirectUrl: string; email: string }>> {
  try {
    const validatedFields = RegisterSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        success: false,
        error: AuthErrorHandler.createError(AUTH_ERROR_CODES.INVALID_FIELDS),
      };
    }

    const { name, email, password } = validatedFields.data;
    const locale = (await getLocale()) as EmailLocale;

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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: {
          connect: {
            name: 'CUSTOMER',
          },
        },
      },
    });

    try {
      await createAndSendVerification(user.id, locale, { skipRateLimit: true });
    } catch (emailError) {
      // Account is created; user can resend from the verify-email page
      console.error('Verification email failed (registration continues):', emailError);
    }

    const verifyUrl = `${APP_ROUTES.AUTH.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`;

    return {
      success: true,
      data: {
        redirectUrl: verifyUrl,
        email,
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

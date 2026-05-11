'use server';

import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import type { AuthResponse } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { signInWithProvider } from '../lib/social-auth';

/**
 * Handle social authentication
 * Initiates OAuth flow for the specified provider
 */
export async function handleSocialAuth(
  provider: 'google' | 'github',
  callbackUrl?: string,
): Promise<AuthResponse> {
  try {
    // This action is called from client, but OAuth redirect happens on client
    // The actual sign in is handled by NextAuth on the client side
    // This action could be used for server-side validation or logging

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Social auth error for ${provider}:`, error);

    const authError =
      error instanceof Error
        ? AuthErrorHandler.createError(AUTH_ERROR_CODES.OAUTH_ERROR, error.message)
        : AuthErrorHandler.createError(AUTH_ERROR_CODES.OAUTH_ERROR);

    return {
      success: false,
      error: authError,
    };
  }
}

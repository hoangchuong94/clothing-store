'use client';

/**
 * useCredentialsAuth hook
 * Shared credentials authentication logic
 */

import { useCallback } from 'react';
import { signIn } from 'next-auth/react';

import type { AuthError } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { AuthLogger } from '../lib/auth-logger';

interface CredentialsResult {
  success: boolean;
  error?: AuthError;
}

/**
 * Authenticate with credentials
 */
async function authenticateCredentials(
  email: string,
  password: string,
): Promise<CredentialsResult> {
  try {
    AuthLogger.info('Attempting credentials authentication', { email });

    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      const error = AuthErrorHandler.mapNextAuthError(signInResult.error);
      AuthLogger.warn('Credentials authentication failed', {
        email,
        error: error.code,
      });
      return { success: false, error };
    }

    AuthLogger.info('Credentials authentication successful', { email });
    return { success: true };
  } catch (err) {
    AuthLogger.error('Credentials authentication error', err, { email });
    return {
      success: false,
      error: AuthErrorHandler.createError(
        AUTH_ERROR_CODES.UNKNOWN_ERROR,
        'An unexpected error occurred',
      ),
    };
  }
}

export function useCredentialsAuth() {
  const authenticate = useCallback(
    (email: string, password: string) => authenticateCredentials(email, password),
    [],
  );

  return { authenticate };
}

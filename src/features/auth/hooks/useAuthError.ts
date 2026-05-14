'use client';

/**
 * useAuthError hook
 * Handles OAuth error parsing and error message formatting
 */

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import type { AuthError } from '../types/auth.types';
import { AuthErrorHandler, isTranslationKey } from '../lib/auth-errors';
import { isOAuthAccountLinkingError } from '../lib/social-auth';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { AuthLogger } from '../lib/auth-logger';

/**
 * Parse OAuth error from URL params
 */
function parseOAuthError(
  searchParams: URLSearchParams | ReturnType<typeof useSearchParams>,
): AuthError | null {
  const error = searchParams.get('error');
  if (!error) return null;

  if (isOAuthAccountLinkingError(error)) {
    return AuthErrorHandler.createError(
      AUTH_ERROR_CODES.ACCOUNT_NOT_LINKED,
      'Email already in use with different provider',
    );
  }

  return AuthErrorHandler.mapNextAuthError(error);
}

export function useAuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<AuthError | null>(() => {
    // Initialize with OAuth error from URL
    const oauthError = parseOAuthError(searchParams);
    if (oauthError) {
      AuthLogger.warn('OAuth error detected in URL', {
        error: oauthError.code,
        provider: searchParams.get('provider') || undefined,
      });
    }
    return oauthError;
  });

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Format error for display
   * Returns translation key or plain message
   */
  const getErrorMessage = useCallback((authError: AuthError | null): string => {
    if (!authError) return '';

    // If it's a translation key, return it for useTranslations
    if (isTranslationKey(authError.message)) {
      return authError.message;
    }

    // Check if the code is a translation key
    if (isTranslationKey(authError.code)) {
      return authError.code;
    }

    // Return raw message
    return authError.message;
  }, []);

  return {
    error,
    setError,
    clearError,
    getErrorMessage,
  };
}

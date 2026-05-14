'use client';

/**
 * useSocialAuth hook
 * Shared social authentication logic for login and register
 */

import { useCallback } from 'react';

import type { AuthError, SocialProvider } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { signInWithProvider } from '../lib/social-auth';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { AuthLogger } from '../lib/auth-logger';

export function useSocialAuth(
  clearError: () => void,
  setSuccess: (value: boolean) => void,
  setError: (error: AuthError | null) => void,
  callbackUrl?: string,
  action: string = 'sign in',
) {
  const onSocialAuth = useCallback(
    async (provider: SocialProvider) => {
      clearError();
      setSuccess(false);

      try {
        await signInWithProvider(provider, callbackUrl);
      } catch (err) {
        AuthLogger.error(`${provider} auth error`, err, { provider, action });
        setError(
          AuthErrorHandler.createError(
            AUTH_ERROR_CODES.OAUTH_ERROR,
            `Failed to ${action} with ${provider}`,
          ),
        );
      }
    },
    [callbackUrl, clearError, setSuccess, setError, action],
  );

  return { onSocialAuth };
}

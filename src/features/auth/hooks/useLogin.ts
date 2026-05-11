'use client';

/**
 * useLogin hook
 * Encapsulates all login logic and state management
 * Keeps LoginForm component pure and focused on presentation
 */

import { useCallback, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';

import { LoginSchema, type LoginSchema as LoginSchemaType } from '../schemas/auth-schemas';
import type { AuthError, UseLoginReturn, SocialProvider } from '../types/auth.types';
import { AuthErrorHandler, isTranslationKey } from '../lib/auth-errors';
import { signInWithProvider, isOAuthAccountLinkingError } from '../lib/social-auth';
import { validateCallbackUrl } from '../lib/callback-url';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { loginWithCredentials } from '../actions/login';

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

/**
 * Custom hook for login functionality
 * Manages form state, auth logic, error handling, and translations
 *
 * @returns Login hook methods and state
 */
export function useLogin(): UseLoginReturn {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);

  // Get callback URL from params and validate
  const callbackUrl = validateCallbackUrl(searchParams.get('callbackUrl'));

  // Check for OAuth errors in URL
  const initialOAuthError = parseOAuthError(searchParams);
  if (initialOAuthError && !error) {
    setError(initialOAuthError);
  }

  /**
   * Initialize form with validation
   */
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle form submission with credentials
   */
  const onSubmit = useCallback(
    async (values: LoginSchemaType) => {
      clearError();
      setSuccess(false);

      startTransition(async () => {
        try {
          const result = await loginWithCredentials(values);

          if (!result.success) {
            setError(result.error || AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR));
            return;
          }

          // Server validation successful, now establish NextAuth session
          const signInResult = await signIn('credentials', {
            email: values.email,
            password: values.password,
            redirect: false,
          });

          if (signInResult?.error) {
            setError(AuthErrorHandler.mapNextAuthError(signInResult.error));
            return;
          }

          // Mark as successful before redirect
          setSuccess(true);

          // Redirect after short delay for UX feedback
          const redirectUrl = result.data?.redirectUrl || callbackUrl;
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        } catch (err) {
          console.error('Login error:', err);
          setError(
            AuthErrorHandler.createError(
              AUTH_ERROR_CODES.UNKNOWN_ERROR,
              'An unexpected error occurred',
            ),
          );
        }
      });
    },
    [callbackUrl, clearError],
  );

  /**
   * Handle social provider authentication
   */
  const onSocialAuth = useCallback(
    async (provider: SocialProvider) => {
      clearError();
      setSuccess(false);

      try {
        // Use native NextAuth signIn which handles redirects
        await signInWithProvider(provider, callbackUrl);
      } catch (err) {
        console.error(`${provider} auth error:`, err);
        setError(
          AuthErrorHandler.createError(
            AUTH_ERROR_CODES.OAUTH_ERROR,
            `Failed to sign in with ${provider}`,
          ),
        );
      }
    },
    [callbackUrl, clearError],
  );

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
    // Form methods
    register: form.register,
    handleSubmit: form.handleSubmit,
    formState: {
      errors: form.formState.errors,
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
    },

    // State
    isLoading: isPending,
    error,
    success,

    // Methods
    onSubmit,
    onSocialAuth,
    clearError,
    getErrorMessage,
  };
}

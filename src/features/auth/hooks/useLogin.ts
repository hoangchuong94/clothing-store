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

import { LoginSchema, type LoginSchema as LoginSchemaType } from '../schemas/auth-schemas';
import type { UseLoginReturn } from '../types/auth.types';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { useRouter } from '@/i18n/navigation';
import { useSocialAuth, useAuthError, useAuthRedirect, useCredentialsAuth } from './index';
import { loginWithCredentials } from '../actions/login';
import { validateCallbackUrl } from '../lib/callback-url';
import { AuthLogger } from '../lib/auth-logger';

/**
 * Custom hook for login functionality
 * Manages form state, auth logic, error handling, and translations
 *
 * @returns Login hook methods and state
 */
export function useLogin(): UseLoginReturn {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  // Get callback URL from params and validate
  const callbackUrl = validateCallbackUrl(searchParams.get('callbackUrl'));

  // Use shared hooks
  const { error, setError, clearError, getErrorMessage } = useAuthError();
  const router = useRouter();
  const { redirectAfterAuth } = useAuthRedirect();
  const { authenticate } = useCredentialsAuth();

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
   * Handle form submission with credentials
   */
  const performLogin = useCallback(
    async (values: LoginSchemaType) => {
      clearError();
      setSuccess(false);

      try {
        AuthLogger.info('Starting login process', { email: values.email });

        const result = await loginWithCredentials(values);

        if (!result.success) {
          if (
            result.error &&
            AuthErrorHandler.isError(result.error, AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED)
          ) {
            const verifyUrl = result.data?.redirectUrl;
            if (verifyUrl) {
              router.push(verifyUrl);
              return;
            }
          }
          setError(result.error || AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR));
          return;
        }

        // Server validation successful, now establish NextAuth session
        const authResult = await authenticate(values.email, values.password);

        if (!authResult.success) {
          setError(authResult.error || null);
          return;
        }

        // Mark as successful before redirect
        setSuccess(true);

        // Redirect after short delay for UX feedback
        const redirectUrl = result.data?.redirectUrl || callbackUrl;
        redirectAfterAuth(redirectUrl);
      } catch (err) {
        AuthLogger.error('Login error', err, { email: values.email });
        setError(
          AuthErrorHandler.createError(
            AUTH_ERROR_CODES.UNKNOWN_ERROR,
            'An unexpected error occurred',
          ),
        );
      }
    },
    [callbackUrl, clearError, authenticate, redirectAfterAuth, router, setError],
  );

  const onSubmit = useCallback(
    async (values: LoginSchemaType): Promise<void> => {
      startTransition(() => {
        void performLogin(values);
      });
    },
    [performLogin],
  );

  const { onSocialAuth } = useSocialAuth(clearError, setSuccess, setError, callbackUrl, 'sign in');

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

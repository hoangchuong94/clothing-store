'use client';

/**
 * useRegister hook
 * Encapsulates all registration logic and state management
 * Keeps RegisterForm component pure and focused on presentation
 */

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';

import { RegisterSchema, type RegisterSchema as RegisterSchemaType } from '../schemas/auth-schemas';
import type { AuthError, UseRegisterReturn, SocialProvider } from '../types/auth.types';
import { AuthErrorHandler, isTranslationKey } from '../lib/auth-errors';
import { signInWithProvider } from '../lib/social-auth';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { registerUser } from '../actions/register';

/**
 * Custom hook for registration functionality
 * Manages form state, auth logic, error handling, and translations
 *
 * @returns Register hook methods and state
 */
export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Initialize form with validation
   */
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle form submission with registration
   */
  const onSubmit = useCallback(
    async (values: RegisterSchemaType) => {
      clearError();
      setSuccess(false);

      startTransition(async () => {
        try {
          const result = await registerUser(values);

          if (!result.success) {
            setError(result.error || AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR));
            return;
          }

          // Registration successful, attempt automatic sign in
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

          // Redirect after successful registration and sign in
          const redirectUrl = result.data?.redirectUrl || '/';
          setTimeout(() => {
            router.push(redirectUrl);
          }, 500);
        } catch (err) {
          console.error('Registration error:', err);
          setError(
            AuthErrorHandler.createError(
              AUTH_ERROR_CODES.UNKNOWN_ERROR,
              'An unexpected error occurred',
            ),
          );
        }
      });
    },
    [clearError, router],
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
        await signInWithProvider(provider);
      } catch (err) {
        console.error(`${provider} auth error:`, err);
        setError(
          AuthErrorHandler.createError(
            AUTH_ERROR_CODES.OAUTH_ERROR,
            `Failed to sign up with ${provider}`,
          ),
        );
      }
    },
    [clearError],
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
    control: form.control,
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

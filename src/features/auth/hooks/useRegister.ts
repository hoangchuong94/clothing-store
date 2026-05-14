'use client';

/**
 * useRegister hook
 * Encapsulates all registration logic and state management
 * Keeps RegisterForm component pure and focused on presentation
 */

import { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { RegisterSchema, type RegisterSchema as RegisterSchemaType } from '../schemas/auth-schemas';
import type { UseRegisterReturn } from '../types/auth.types';
import { AUTH_ERROR_CODES } from '../types/auth.types';
import { AuthErrorHandler } from '../lib/auth-errors';
import { useSocialAuth, useAuthError, useAuthRedirect, useCredentialsAuth } from './index';
import { registerUser } from '../actions/register';
import { AuthLogger } from '../lib/auth-logger';

/**
 * Custom hook for registration functionality
 * Manages form state, auth logic, error handling, and translations
 *
 * @returns Register hook methods and state
 */
export function useRegister(): UseRegisterReturn {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  // Use shared hooks
  const { error, setError, clearError, getErrorMessage } = useAuthError();
  const { redirectAfterAuth } = useAuthRedirect();
  const { authenticate } = useCredentialsAuth();

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
   * Handle form submission with registration
   */
  const performRegistration = useCallback(
    async (values: RegisterSchemaType) => {
      clearError();
      setSuccess(false);

      try {
        AuthLogger.info('Starting registration process', { email: values.email });

        const result = await registerUser(values);

        if (!result.success) {
          setError(result.error || AuthErrorHandler.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR));
          return;
        }

        // Registration successful, attempt automatic sign in
        const authResult = await authenticate(values.email, values.password);

        if (!authResult.success) {
          setError(authResult.error || null);
          return;
        }

        // Mark as successful before redirect
        setSuccess(true);

        // Redirect after successful registration and sign in
        const redirectUrl = result.data?.redirectUrl || '/';
        redirectAfterAuth(redirectUrl);
      } catch (err) {
        AuthLogger.error('Registration error', err, { email: values.email });
        setError(
          AuthErrorHandler.createError(
            AUTH_ERROR_CODES.UNKNOWN_ERROR,
            'An unexpected error occurred',
          ),
        );
      }
    },
    [clearError, authenticate, redirectAfterAuth, setError],
  );

  const onSubmit = useCallback(
    async (values: RegisterSchemaType): Promise<void> => {
      startTransition(() => {
        void performRegistration(values);
      });
    },
    [performRegistration],
  );

  const { onSocialAuth } = useSocialAuth(clearError, setSuccess, setError, undefined, 'sign up');

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

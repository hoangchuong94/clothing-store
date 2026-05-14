'use client';

import { useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { SocialButtons } from './SocialButtons';
import { AuthErrorAlert } from './AuthError';
import { AuthSuccessAlert } from './AuthSuccess';
import { useRegister, usePasswordStrength } from '../hooks';

/**
 * Pure presentation component for user registration
 * Handles form rendering and user interactions only
 * All business logic is delegated to useRegister hook
 */
export function RegisterForm() {
  const t = useTranslations('auth');
  const {
    register,
    handleSubmit,
    control,
    formState,
    isLoading,
    error,
    success,
    onSubmit,
    onSocialAuth: handleSocialAuth,
    clearError,
  } = useRegister();

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const passwordStrength = usePasswordStrength(passwordValue);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && <AuthErrorAlert error={error} onDismiss={clearError} />}

      {/* Success Alert */}
      {success && <AuthSuccessAlert message={t('signup.successMessage')} />}

      <div className="grid gap-4">
        {/* Name Field */}
        <div>
          <Label htmlFor="register-name">{t('signup.name')}</Label>
          <Input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder={t('form.placeholderName')}
            {...register('name')}
            aria-invalid={Boolean(formState.errors.name)}
            aria-describedby={formState.errors.name ? 'register-name-error' : undefined}
            className="mt-2 border border-slate-300 dark:border-slate-700"
            disabled={isLoading}
          />
          {formState.errors.name?.message && (
            <p id="register-name-error" className="mt-2 text-sm text-rose-500">
              {t(formState.errors.name.message as string)}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor="register-email">{t('signup.email')}</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder={t('form.placeholderEmail')}
            {...register('email')}
            aria-invalid={Boolean(formState.errors.email)}
            aria-describedby={formState.errors.email ? 'register-email-error' : undefined}
            className="mt-2 border border-slate-300 dark:border-slate-700"
            disabled={isLoading}
          />
          {formState.errors.email?.message && (
            <p id="register-email-error" className="mt-2 text-sm text-rose-500">
              {t(formState.errors.email.message as string)}
            </p>
          )}
        </div>

        {/* Password Field with Strength Indicator */}
        <div>
          <PasswordInput
            id="register-password"
            label={t('signup.password')}
            placeholder={t('form.placeholderPasswordCreate')}
            autoComplete="new-password"
            register={register('password')}
            error={
              formState.errors.password ? t(formState.errors.password.message as string) : undefined
            }
            disabled={isLoading}
            className="border border-slate-300 dark:border-slate-700"
          />
          {passwordValue && <PasswordStrength strength={passwordStrength} />}
        </div>

        {/* Confirm Password Field */}
        <PasswordInput
          id="register-confirm-password"
          label={t('signup.confirmPassword')}
          placeholder={t('form.placeholderPasswordRepeat')}
          autoComplete="new-password"
          register={register('passwordConfirm')}
          error={
            formState.errors.passwordConfirm
              ? t(formState.errors.passwordConfirm.message as string)
              : undefined
          }
          disabled={isLoading}
          className="border border-slate-300 dark:border-slate-700"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!formState.isValid || isLoading}
        className="w-full rounded-3xl bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500 px-5 py-6 text-base font-semibold tracking-tight text-white shadow-[0_20px_60px_rgba(99,102,241,0.22)] transition-all duration-200 hover:shadow-[0_24px_72px_rgba(99,102,241,0.28)]"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{t('form.creatingAccount')}</span>
          </div>
        ) : (
          <>
            <span>{t('signup.button')}</span>
            <ArrowRight className="ml-auto h-5 w-5" aria-hidden="true" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('form.orContinueWith')}
        </span>
        <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
      </div>

      {/* Social Buttons */}
      <SocialButtons
        onGoogle={() => handleSocialAuth('google')}
        onGitHub={() => handleSocialAuth('github')}
        disabled={isLoading}
      />
    </form>
  );
}

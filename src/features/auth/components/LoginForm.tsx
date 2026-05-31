'use client';

/**
 * LoginForm component
 * Production-grade authentication form
 *
 * Pure presentational component focused on UI/UX
 * All business logic delegated to useLogin hook
 * All error handling managed by dedicated components
 */

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { useLogin } from '../hooks/useLogin';
import { SocialButtons } from './SocialButtons';
import { AuthErrorAlert } from './AuthError';
import { AuthSuccessAlert } from './AuthSuccess';

/**
 * LoginForm component
 *
 * Features:
 * - Fully typed with TypeScript
 * - Accessibility-first (ARIA labels, semantic HTML)
 * - Responsive design
 * - Loading states
 * - Error/success feedback
 * - Social authentication
 * - Translation support
 *
 * Architecture:
 * - Pure presentational component
 * - All logic in useLogin hook
 * - Reusable error/success components
 * - Clean separation of concerns
 */
export function LoginForm() {
  const t = useTranslations('auth');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    isLoading,
    error,
    success,
    onSubmit,
    onSocialAuth,
    clearError,
  } = useLogin();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-5">
      {/* Error Alert */}
      {error && <AuthErrorAlert error={error} onDismiss={clearError} />}

      {/* Success Alert */}
      {success && <AuthSuccessAlert message={t('signin.successMessage')} />}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          {t('signin.email')}
        </Label>

        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('form.placeholderEmail')}
          disabled={isLoading}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
          className="border-input border focus:border-teal-400 focus:ring-teal-400/40"
        />

        {errors.email && (
          <p id="email-error" role="alert" className="text-xs font-medium text-rose-500">
            {t(errors.email.message as string)}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          {t('signin.password')}
        </Label>

        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder={t('form.placeholderPassword')}
          disabled={isLoading}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
          className="border-input border focus:border-teal-400 focus:ring-teal-400/40"
        />

        {errors.password && (
          <p id="password-error" role="alert" className="text-xs font-medium text-rose-500">
            {t(errors.password.message as string)}
          </p>
        )}
      </div>

      {/* Remember & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            disabled={isLoading}
            {...register('remember')}
            aria-label={t('form.rememberMe')}
          />
          <Label
            htmlFor="remember"
            className="text-muted-foreground cursor-pointer text-sm font-normal"
          >
            {t('form.rememberMe')}
          </Label>
        </div>

        <Link
          href="/forgot-password"
          className="text-muted-foreground text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-300"
        >
          {t('form.forgotPassword')}
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full rounded-3xl bg-linear-to-r from-teal-500 via-sky-500 to-indigo-500 px-5 py-6 text-base font-semibold tracking-tight text-white shadow-[0_20px_60px_rgba(20,184,166,0.22)] transition-all duration-200 hover:shadow-[0_24px_72px_rgba(20,184,166,0.28)]"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{t('signin.loading')}</span>
          </div>
        ) : (
          <>
            <span>{t('signin.button')}</span>
            <ArrowRight className="ml-auto h-5 w-5" aria-hidden="true" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="border-border flex-1 border-t" />
        <span className="text-muted-foreground text-xs">{t('form.orContinue')}</span>
        <div className="border-border flex-1 border-t" />
      </div>

      {/* Social Buttons */}
      <SocialButtons
        onGoogle={() => onSocialAuth('google')}
        onGitHub={() => onSocialAuth('github')}
        disabled={isLoading}
      />
    </form>
  );
}

export default LoginForm;

'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '../../config/app-routes';
import { ResendVerificationForm } from './ResendVerificationForm';

interface VerifyEmailErrorProps {
  reason?: string;
}

export function VerifyEmailError({ reason }: VerifyEmailErrorProps) {
  const t = useTranslations('auth');

  const title =
    reason === 'already-verified'
      ? t('verification.alreadyVerifiedTitle')
      : t('verification.errorTitle');

  const description =
    reason === 'already-verified'
      ? t('verification.alreadyVerifiedDescription')
      : t('verification.errorDescription');

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50">
          <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      {reason !== 'already-verified' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="mb-4 text-sm font-medium">{t('verification.resendTitle')}</h2>
          <ResendVerificationForm />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href={APP_ROUTES.AUTH.SIGN_IN}>{t('verification.backToSignIn')}</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={APP_ROUTES.AUTH.VERIFY_EMAIL}>{t('verification.pendingTitle')}</Link>
        </Button>
      </div>
    </div>
  );
}

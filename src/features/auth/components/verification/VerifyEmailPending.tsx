'use client';

import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '../../config/app-routes';
import { ResendVerificationForm } from './ResendVerificationForm';

interface VerifyEmailPendingProps {
  email?: string;
}

export function VerifyEmailPending({ email }: VerifyEmailPendingProps) {
  const t = useTranslations('auth');

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/50">
          <MailCheck className="h-7 w-7 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('verification.pendingTitle')}</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {email
            ? t('verification.pendingDescriptionWithEmail', { email })
            : t('verification.pendingDescription')}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <h2 className="mb-4 text-sm font-medium text-slate-900 dark:text-slate-100">
          {t('verification.resendTitle')}
        </h2>
        <ResendVerificationForm defaultEmail={email} />
      </div>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        <Link href={APP_ROUTES.AUTH.SIGN_IN} className="font-medium text-violet-600 hover:underline">
          {t('verification.backToSignIn')}
        </Link>
      </p>
    </div>
  );
}

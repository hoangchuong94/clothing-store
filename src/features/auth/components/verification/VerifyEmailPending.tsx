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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm dark:bg-amber-400/10 dark:text-amber-300">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('verification.pendingTitle')}</h1>
        <p className="text-muted-foreground text-sm leading-6">
          {email
            ? t('verification.pendingDescriptionWithEmail', { email })
            : t('verification.pendingDescription')}
        </p>
      </div>

      <div className="border-border bg-card rounded-2xl border p-6">
        <h2 className="text-foreground mb-4 text-sm font-medium">
          {t('verification.resendTitle')}
        </h2>
        <ResendVerificationForm defaultEmail={email} />
      </div>

      <p className="text-muted-foreground text-center text-sm">
        <Link
          href={APP_ROUTES.AUTH.SIGN_IN}
          className="font-medium text-teal-600 hover:underline dark:text-teal-300"
        >
          {t('verification.backToSignIn')}
        </Link>
      </p>
    </div>
  );
}

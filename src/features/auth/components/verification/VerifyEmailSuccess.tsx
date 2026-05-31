'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '../../config/app-routes';

export function VerifyEmailSuccess() {
  const t = useTranslations('auth');

  return (
    <div className="mx-auto w-full max-w-md space-y-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm dark:bg-teal-400/10 dark:text-teal-300">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t('verification.successTitle')}</h1>
        <p className="text-muted-foreground text-sm leading-6">
          {t('verification.successDescription')}
        </p>
      </div>
      <Button
        asChild
        className="w-full bg-linear-to-r from-teal-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/25"
      >
        <Link href={APP_ROUTES.AUTH.SIGN_IN}>{t('verification.signInNow')}</Link>
      </Button>
    </div>
  );
}

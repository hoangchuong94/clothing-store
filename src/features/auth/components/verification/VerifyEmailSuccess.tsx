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
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
        <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t('verification.successTitle')}</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {t('verification.successDescription')}
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href={APP_ROUTES.AUTH.SIGN_IN}>{t('verification.signInNow')}</Link>
      </Button>
    </div>
  );
}

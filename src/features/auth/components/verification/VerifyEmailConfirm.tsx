'use client';

import { useCallback, useTransition } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { verifyEmailAction } from '../../actions/verify-email';
import { APP_ROUTES } from '../../config/app-routes';

interface VerifyEmailConfirmProps {
  token: string;
}

/**
 * Verification runs only after explicit user action (not on page load)
 * so email link scanners cannot consume single-use tokens.
 */
export function VerifyEmailConfirm({ token }: VerifyEmailConfirmProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = useCallback(() => {
    startTransition(async () => {
      const result = await verifyEmailAction(token);

      if (result.status === 'SUCCESS' || result.status === 'ALREADY_VERIFIED') {
        router.push(APP_ROUTES.AUTH.VERIFY_EMAIL_SUCCESS);
        return;
      }

      router.push(`${APP_ROUTES.AUTH.VERIFY_EMAIL_ERROR}?reason=invalid`);
    });
  }, [router, token]);

  return (
    <div className="mx-auto w-full max-w-md space-y-8 text-center">
      <div className="space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/50">
          <MailCheck className="h-7 w-7 text-violet-600 dark:text-violet-400" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('verification.confirmTitle')}</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {t('verification.confirmDescription')}
        </p>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={isPending}
        onClick={handleConfirm}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            {t('verification.confirming')}
          </>
        ) : (
          t('verification.confirmButton')
        )}
      </Button>
    </div>
  );
}

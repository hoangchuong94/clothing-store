'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resendVerificationEmailAction } from '../../actions/resend-verification';
import { ResendVerificationSchema, type ResendVerificationInput } from '../../schemas/verification-schemas';
import { AUTH_ERROR_CODES } from '../../types/auth.types';
import { AuthErrorHandler } from '../../lib/auth-errors';
import { useAuthError } from '../../hooks/useAuthError';

interface ResendVerificationFormProps {
  defaultEmail?: string;
}

export function ResendVerificationForm({ defaultEmail = '' }: ResendVerificationFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const { getErrorMessage } = useAuthError();

  const form = useForm<ResendVerificationInput>({
    resolver: zodResolver(ResendVerificationSchema),
    defaultValues: {
      email: defaultEmail,
      locale: locale as ResendVerificationInput['locale'],
    },
  });

  const onSubmit = useCallback(
    (values: ResendVerificationInput) => {
      startTransition(async () => {
        const result = await resendVerificationEmailAction({
          email: values.email,
          locale: values.locale,
        });

        if (result.success) {
          toast.success(t('verification.resendSuccess'));
          return;
        }

        if (
          result.error &&
          AuthErrorHandler.isError(result.error, AUTH_ERROR_CODES.VERIFICATION_RESEND_COOLDOWN)
        ) {
          const seconds = result.data?.retryAfterSeconds ?? 60;
          setCooldownSeconds(seconds);
          toast.error(t('verification.resendCooldown', { seconds }));
          return;
        }

        if (
          result.error &&
          AuthErrorHandler.isError(result.error, AUTH_ERROR_CODES.VERIFICATION_RESEND_LIMIT)
        ) {
          toast.error(t('verification.resendLimit'));
          return;
        }

        toast.error(getErrorMessage(result.error ?? null));
      });
    },
    [getErrorMessage, t],
  );

  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const disabled = isPending || (cooldownSeconds !== null && cooldownSeconds > 0);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="resend-email">{t('signup.email')}</Label>
        <Input
          id="resend-email"
          type="email"
          autoComplete="email"
          placeholder={t('form.placeholderEmail')}
          className="mt-2"
          disabled={disabled}
          {...form.register('email')}
        />
        {form.formState.errors.email?.message && (
          <p className="mt-2 text-sm text-rose-500">
            {t(form.formState.errors.email.message as string)}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={disabled}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('verification.resending')}
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            {t('verification.resendButton')}
          </>
        )}
      </Button>
    </form>
  );
}

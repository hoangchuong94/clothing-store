'use client';

import { GithubIcon, GoogleIcon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface SocialButtonsProps {
  onGoogle?: () => void;
  onGitHub?: () => void;
  disabled?: boolean;
}

export function SocialButtons({ onGoogle, onGitHub, disabled = false }: SocialButtonsProps) {
  const t = useTranslations('auth');

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        size="default"
        disabled={disabled}
        className="w-full gap-2 rounded-3xl border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        onClick={onGoogle}
      >
        <GoogleIcon className="h-4 w-4" />
        {t('social.continueWithGoogle')}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="default"
        disabled={disabled}
        className="w-full gap-2 rounded-3xl border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        onClick={onGitHub}
      >
        <GithubIcon className="h-4 w-4" />
        {t('social.continueWithGitHub')}
      </Button>
    </div>
  );
}

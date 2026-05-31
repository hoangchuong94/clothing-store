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
        className="border-border bg-background/80 text-foreground w-full gap-2 rounded-3xl hover:border-teal-400/50 hover:bg-teal-500/10"
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
        className="border-border bg-background/80 text-foreground w-full gap-2 rounded-3xl hover:border-indigo-400/50 hover:bg-indigo-500/10"
        onClick={onGitHub}
      >
        <GithubIcon className="h-4 w-4" />
        {t('social.continueWithGitHub')}
      </Button>
    </div>
  );
}

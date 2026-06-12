import type { Metadata } from 'next';
import { Ban, Home, LogIn } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ForbiddenPage() {
  const t = await getTranslations('auth.forbidden');

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm dark:bg-rose-400/10 dark:text-rose-300">
        <Ban className="h-7 w-7" aria-hidden />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm leading-6">{t('description')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild className="bg-linear-to-r from-teal-500 to-indigo-500 text-white">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" aria-hidden />
            {t('home')}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signin">
            <LogIn className="mr-2 h-4 w-4" aria-hidden />
            {t('signIn')}
          </Link>
        </Button>
      </div>
    </div>
  );
}

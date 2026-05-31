'use client';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { AuthTabs, getActiveAuthTab } from '@/features/auth/components/AuthTabs';
import { Sparkles, ShieldCheck } from '@/components/ui/icon';

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  const t = useTranslations('auth');
  const pathname = usePathname();
  const activeTab = getActiveAuthTab(pathname);

  const pageHeading = activeTab === 'login' ? t('form.loginHeading') : t('form.registerHeading');

  return (
    <main className="bg-background text-foreground relative flex min-h-screen items-center overflow-hidden p-4 transition-colors duration-500">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_88%_22%,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(244,63,94,0.12),transparent_34%)]" />

      <div className="border-border bg-card/90 relative mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2rem] border shadow-[0_40px_120px_rgba(20,184,166,0.12)] backdrop-blur-xl sm:gap-6 md:grid-cols-[1.15fr_1fr]">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.18),transparent_30%),linear-gradient(135deg,theme(colors.card),rgba(245,158,11,0.1),theme(colors.card))] relative order-last overflow-hidden rounded-[2rem] p-8 shadow-2xl shadow-teal-500/10 sm:p-10 md:order-first">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 via-amber-400 to-rose-500" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="text-muted-foreground flex items-center gap-3 text-sm font-medium tracking-[0.3em] uppercase">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-amber-300/50 bg-amber-50 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                  <Sparkles className="h-5 w-5" />
                </span>
                {t('hero.badge')}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  <span className="from-foreground to-foreground bg-linear-to-r via-teal-600 bg-clip-text text-transparent dark:via-teal-300">
                    {t('hero.title')}
                  </span>
                </h1>
                <p className="text-muted-foreground max-w-md text-base leading-7">
                  {t('hero.description')}
                </p>
              </div>
            </div>

            <div className="border-border bg-background/70 grid gap-4 rounded-[1.75rem] border p-6 shadow-xl shadow-teal-500/10 backdrop-blur-xl">
              <div className="text-foreground flex items-center gap-3 text-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                {t('hero.secureByDesign')}
              </div>
              <ul className="text-muted-foreground space-y-3 text-sm">
                <li>• {t('hero.feature1')}</li>
                <li>• {t('hero.feature2')}</li>
                <li>• {t('hero.feature3')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative z-50 flex flex-col gap-4 p-6 sm:p-8 md:order-last">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-semibold tracking-[0.24em] uppercase">
                {t('header.welcomeBack')}
              </p>
              <h2 className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
                {pageHeading}
              </h2>
            </div>
          </div>

          <AuthTabs activeTab={activeTab} />

          <div className="border-border bg-background/75 space-y-5 rounded-[2rem] border p-6 shadow-[0_20px_70px_rgba(20,184,166,0.08)] backdrop-blur-xl">
            {children}
          </div>

          <div className="text-muted-foreground flex gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs">{t('footer.onboarding')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

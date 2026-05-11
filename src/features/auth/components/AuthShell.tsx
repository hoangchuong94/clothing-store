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
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_18%)] p-4 text-slate-950 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2rem] border border-slate-900/5 bg-white/80 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:gap-6 md:grid-cols-[1.15fr_1fr] dark:border-white/10 dark:bg-slate-950/80 dark:shadow-none">
        <div className="order-last rounded-[2rem] bg-linear-to-br from-slate-100 via-slate-200 to-purple-200 p-8 text-slate-950 shadow-2xl shadow-slate-950/20 sm:p-10 md:order-first dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 dark:text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.25),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_20%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.25),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_20%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm font-medium tracking-[0.3em] text-slate-600 uppercase dark:text-slate-300">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-white/5">
                  <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-300" />
                </span>
                {t('hero.badge')}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                  {t('hero.title')}
                </h1>
                <p className="max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
                  {t('hero.description')}
                </p>
              </div>
            </div>
            <div className="grid gap-4 rounded-[1.75rem] border border-slate-300 bg-slate-50 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-slate-100">
                  <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-100" />
                </span>
                {t('hero.secureByDesign')}
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
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
              <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase dark:text-slate-400">
                {t('header.welcomeBack')}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                {pageHeading}
              </h2>
            </div>
          </div>

          <AuthTabs activeTab={activeTab} />

          <div className="space-y-5 rounded-[2rem] border border-slate-200/70 bg-slate-50/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80 dark:shadow-none">
            {children}
          </div>

          <div className="flex gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
            <p className="text-xs text-slate-400">{t('footer.onboarding')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

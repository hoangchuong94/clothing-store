'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type AuthTab = 'login' | 'register';

const authTabItems: Array<{
  value: AuthTab;
  route: '/signin' | '/signup';
  labelKey: 'tabs.login' | 'tabs.register';
}> = [
  { value: 'login', route: '/signin', labelKey: 'tabs.login' },
  { value: 'register', route: '/signup', labelKey: 'tabs.register' },
];

const transition = { duration: 0.28, ease: 'easeOut' as const };

export function getActiveAuthTab(pathname: string): AuthTab {
  const normalizedPath = pathname.replace(/\/+$|^\/+/g, '');
  const segment = normalizedPath.split('/').pop();

  if (segment === 'signup') {
    return 'register';
  }

  return 'login';
}

interface AuthTabsProps {
  activeTab: AuthTab;
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
  const t = useTranslations('auth');

  return (
    <div className="rounded-full bg-slate-100 p-1.5 dark:bg-slate-900/95">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100/80 p-1 shadow-sm shadow-slate-950/5 dark:bg-slate-950/80 dark:shadow-none">
        {authTabItems.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.route}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-all',
                active
                  ? 'bg-white text-slate-950 shadow-sm shadow-slate-950/10 dark:bg-slate-950 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              )}
            >
              {t(tab.labelKey)}
              {active && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 rounded-full bg-white/90 dark:bg-slate-950"
                  transition={transition}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

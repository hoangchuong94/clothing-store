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
    <div className="bg-muted rounded-full p-1.5">
      <div className="bg-background/80 grid grid-cols-2 gap-1 rounded-full p-1 shadow-sm shadow-teal-500/10">
        {authTabItems.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.route}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative isolate flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-all',
                active
                  ? 'text-teal-700 shadow-sm shadow-teal-500/10 dark:text-teal-200'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(tab.labelKey)}
              {active && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 -z-10 rounded-full border border-teal-400/30 bg-teal-500/10"
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

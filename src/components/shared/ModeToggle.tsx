'use client';

import * as React from 'react';
import { Moon, Sun, Check } from '@/components/ui/icon';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const t = useTranslations('header');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const saveTheme = (value: 'light' | 'dark' | 'system') => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', value);
    }
    setTheme(value);
  };

  React.useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setTheme(stored);
      } else {
        setTheme('system');
      }
    }
  }, [setTheme]);

  const activeLabel = !mounted
    ? t('theme.toggle', { theme: t('theme.system') })
    : theme === 'system' || !theme
      ? t('theme.current', { theme: t('theme.system'), mode: resolvedTheme || t('theme.light') })
      : theme === 'dark'
        ? t('theme.current', { theme: t('theme.dark'), mode: t('theme.dark') })
        : t('theme.current', { theme: t('theme.light'), mode: t('theme.light') });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('theme.toggle', { theme: activeLabel })}
          title={t('theme.toggle', { theme: activeLabel })}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => saveTheme('light')}
          className="flex items-center justify-between gap-3"
        >
          {t('theme.light')}
          {theme === 'light' && <Check className="h-4 w-4 text-green-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => saveTheme('dark')}
          className="flex items-center justify-between gap-3"
        >
          {t('theme.dark')}
          {theme === 'dark' && <Check className="h-4 w-4 text-green-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => saveTheme('system')}
          className="flex items-center justify-between gap-3"
        >
          {t('theme.system')}
          {theme === 'system' && <Check className="h-4 w-4 text-green-500" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

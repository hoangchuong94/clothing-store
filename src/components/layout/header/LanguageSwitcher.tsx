'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Globe, Check } from '@/components/ui/icon';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const t = useTranslations('header');
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleChange = (locale: string) => {
    router.push(pathname, { locale });
  };

  const getLanguageName = (locale: string) => {
    return locale === 'en' ? 'English' : locale === 'vi' ? 'Tieng Viet' : locale.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md p-2 transition-colors hover:bg-teal-500/10 focus-visible:ring-2 focus-visible:outline-none"
          aria-label={t('language.toggle') || 'Change language'}
          title={getLanguageName(currentLocale)}
        >
          <Globe className="h-5 w-5" />
          <span className="text-xs font-bold uppercase">{currentLocale}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleChange(locale)}
            className="flex items-center justify-between gap-3"
          >
            {getLanguageName(locale)}
            {currentLocale === locale && <Check className="h-4 w-4 text-teal-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { usePathname, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { navItems } from './config';

export function NavMenu() {
  const t = useTranslations('header');
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item) => {
        const href = `${item.href}`;
        const isActive = pathname.includes(item.href);

        return (
          <Link key={item.id} href={href} className="group relative">
            <div
              className={`font-heading relative px-4 py-2.5 text-xs tracking-widest uppercase transition-all duration-300 ${
                isActive ? 'text-foreground' : ''
              }`}
            >
              {t(item.labelKey)}

              {/* Active Indicator */}
              {isActive && (
                <span
                  className="absolute right-0 bottom-0 left-0 h-1 rounded-full bg-linear-to-r from-teal-500 via-amber-400 to-rose-500"
                  style={{ transformOrigin: '0.5' }}
                />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

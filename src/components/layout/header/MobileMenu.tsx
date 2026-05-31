'use client';

import { useState, useEffect } from 'react';
import { Menu, CloseIcon } from '@/components/ui/icon';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { navItems } from './config';
import { SearchBar } from './SearchBar';
import { LanguageSwitcher } from './LanguageSwitcher';

export function MobileMenu() {
  const t = useTranslations('header');
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-teal-500/10 focus-visible:ring-2 focus-visible:outline-none md:hidden"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="border-border bg-background fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-full max-w-sm border-l shadow-2xl shadow-teal-500/10 md:hidden"
      >
        <div className="h-1 bg-linear-to-r from-teal-500 via-amber-400 to-rose-500" />
        <nav className="flex flex-col gap-2 p-4 sm:gap-1 sm:p-4">
          {navItems.map((item, index) => {
            const href = `/${item.href}`;
            const isActive = pathname.includes(item.href);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-base font-bold tracking-widest uppercase sm:px-3 sm:py-2 sm:text-sm ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-200'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              </motion.div>
            );
          })}

          <div className="border-border my-6 border-t pt-6 sm:my-4 sm:pt-4">
            <SearchBar />
          </div>

          <div className="border-border flex items-center justify-between border-t pt-6 sm:pt-4">
            <span className="text-muted-foreground text-sm font-medium sm:text-xs">Language</span>
            <LanguageSwitcher />
          </div>
        </nav>
      </motion.div>
    </>
  );
}

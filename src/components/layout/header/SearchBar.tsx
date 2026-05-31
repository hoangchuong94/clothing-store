'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, CloseIcon } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const t = useTranslations('header');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
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
        onClick={() => setIsOpen(true)}
        className="text-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-teal-500/10 focus-visible:ring-2 focus-visible:outline-none"
        aria-label={t('action.search')}
      >
        <Search className="h-5 w-5" />
      </button>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              />

              {/* Search Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-label="Search"
              >
                <div className="border-border/50 bg-background/95 relative w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl ring-1 shadow-teal-500/10 ring-teal-500/10 backdrop-blur-xl">
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 via-amber-400 to-rose-500" />
                  {/* Search Icon and Input */}
                  <div className="flex items-center gap-4 px-8 py-6 sm:py-8">
                    <div className="shrink-0">
                      <Search className="text-muted-foreground h-7 w-7" />
                    </div>
                    <motion.input
                      ref={inputRef}
                      type="text"
                      placeholder={t('action.search')}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-foreground placeholder:text-muted-foreground/70 w-full rounded-lg border-0 bg-transparent px-2 py-1 text-xl font-medium transition-all focus:border-transparent focus:ring-2 focus:ring-teal-500/50 focus-visible:ring-0 focus-visible:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Handle search submission
                          console.log('Search:', (e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-muted-foreground shrink-0 rounded-full p-2"
                      aria-label={t('action.close')}
                    >
                      <CloseIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Suggested Searches */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="border-border/50 bg-muted/30 border-t px-8 py-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-teal-500"></div>
                      <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                        Popular searches
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {['Dresses', 'Shirts', 'Shoes', 'Jackets', 'Accessories', 'Sale'].map(
                        (item) => (
                          <button
                            key={item}
                            onClick={() => {
                              inputRef.current!.value = item;
                              inputRef.current?.focus();
                            }}
                            className="border-border/50 bg-background/50 text-foreground rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-teal-400/50 hover:bg-teal-500/10"
                          >
                            {item}
                          </button>
                        ),
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

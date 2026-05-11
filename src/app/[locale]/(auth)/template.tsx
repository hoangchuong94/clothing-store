'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from '@/i18n/navigation';
import * as React from 'react';

const transition = { duration: 0.28, ease: 'easeOut' as const };

export default function AuthenticationTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={transition}
        className="relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('home.hero');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="bg-background relative min-h-screen overflow-hidden pt-16 sm:pt-20 lg:pt-32">
      <div className="bg-[radial-gradient(circle_at_18%_20%,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_52%_72%,rgba(244,63,94,0.1),transparent_34%),linear-gradient(to_bottom,theme(colors.background),theme(colors.muted/0.3),theme(colors.background))] absolute inset-0 -z-10" />

      <svg
        className="text-muted-foreground absolute inset-0 -z-10 opacity-10"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-50/80 px-4 py-2 text-amber-900 shadow-sm backdrop-blur dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm font-medium">{t('badge')}</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            <span className="from-foreground to-foreground bg-linear-to-r via-teal-600 bg-clip-text text-transparent dark:via-teal-300">
              {t('headline1')}
            </span>
            <br />
            <span className="mt-2 bg-linear-to-r from-rose-500 via-amber-500 to-teal-500 bg-clip-text text-transparent">
              {t('headline2')}
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mt-6 text-base sm:text-lg md:text-xl lg:max-w-2xl lg:text-2xl xl:mx-auto"
          >
            {t('description')}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-teal-500 via-sky-500 to-indigo-500 px-6 py-4 font-bold text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/25 sm:w-auto sm:px-8"
            >
              {t('primaryCta')}
              <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-background text-foreground w-full rounded-lg border border-teal-500/30 px-6 py-4 font-bold transition-all duration-300 hover:bg-teal-500/10 sm:w-auto sm:px-8"
            >
              {t('secondaryCta')}
            </motion.button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-16 flex justify-center"
          >
            <div className="text-muted-foreground">
              <div className="text-sm font-medium">{t('scrollIndicator')}</div>
              <svg
                className="mx-auto mt-2 h-5 w-5 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

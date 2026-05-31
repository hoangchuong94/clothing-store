'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronRight, Zap } from '@/components/ui/icon';

export function PromotionBanner() {
  const t = useTranslations('home.promotionBanner');

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="border-border bg-background relative border-t py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-lg shadow-teal-500/10"
        >
          <div className="bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.16),transparent_32%),linear-gradient(120deg,theme(colors.card),rgba(245,158,11,0.12),theme(colors.card))] absolute inset-0 -z-10" />

          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_60%,rgba(255,255,255,0.2)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_40%_60%,rgba(20,184,166,0.12)_0%,transparent_50%)]"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="border-border absolute -top-20 -right-20 h-40 w-40 rounded-full border"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="border-border absolute -bottom-10 -left-10 h-32 w-32 rounded-full border"
          />

          <motion.div
            variants={containerVariants}
            className="relative px-6 py-12 sm:px-12 sm:py-16 md:py-20"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <Zap size={28} className="text-amber-500" />
              <span className="text-sm font-bold tracking-widest text-teal-700 uppercase dark:text-teal-200">
                {t('badge')}
              </span>
            </motion.div>

            <motion.h3
              variants={itemVariants}
              className="text-foreground mt-6 text-4xl font-black sm:text-5xl md:text-6xl"
            >
              {t('headline1')}
              <br />
              <span className="bg-linear-to-r from-teal-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                {t('headline2')}
              </span>
            </motion.h3>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground mt-4 max-w-2xl text-lg sm:text-xl"
            >
              {t('description')} <span className="text-foreground font-bold">{t('code')}</span>
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-teal-500 to-indigo-500 px-8 py-4 font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-xl hover:shadow-teal-500/25"
              >
                {t('primaryCta')}
                <ChevronRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-background text-foreground rounded-lg border border-teal-500/30 px-8 py-4 font-bold transition-all hover:bg-teal-500/10"
              >
                {t('secondaryCta')}
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3"
            >
              {[
                { label: t('stats.products'), value: '2000+' },
                { label: t('stats.discount'), value: '40%' },
                { label: t('stats.endsIn'), value: '5 Days' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/40 bg-white/70 px-4 py-3 text-center backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40"
                >
                  <div className="text-2xl font-bold text-teal-700 sm:text-3xl dark:text-teal-200">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

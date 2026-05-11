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
    <section className="relative bg-white py-16 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative overflow-hidden rounded-2xl shadow-xl"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            {/* Gradient riêng cho light & dark */}
            <div className="absolute inset-0 bg-linear-to-r from-cyan-200 via-purple-200 to-pink-200 opacity-90 dark:from-cyan-500 dark:via-purple-500 dark:to-pink-500" />

            {/* Overlay cho light mode */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm dark:hidden" />

            {/* Animated glow */}
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(255,255,255,0.25)_0%,transparent_50%)]"
            />
          </div>

          {/* Animated Shapes */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 h-40 w-40 rounded-full border border-white/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border border-white/30"
          />

          {/* Content */}
          <motion.div
            variants={containerVariants}
            className="relative px-6 py-12 sm:px-12 sm:py-16 md:py-20"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <Zap size={28} className="text-purple-600 dark:text-white" />
              <span className="text-sm font-bold tracking-widest text-slate-800 uppercase dark:text-white/90">
                {t('badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h3
              variants={itemVariants}
              className="mt-6 text-4xl font-black sm:text-5xl md:text-6xl"
            >
              <span className="text-slate-900 dark:text-white">{t('headline1')}</span>
              <br />
              <span className="bg-linear-to-r from-slate-900 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-white dark:via-cyan-100 dark:to-blue-200">
                {t('headline2')}
              </span>
            </motion.h3>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-2xl text-lg text-slate-700 sm:text-xl dark:text-white/90"
            >
              {t('description')}{' '}
              <span className="font-bold text-slate-900 dark:text-white">{t('code')}</span>
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl dark:bg-white dark:text-purple-600"
              >
                {t('primaryCta')}
                <ChevronRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border-2 border-slate-900 px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-900/10 dark:border-white dark:text-white dark:hover:bg-white/10"
              >
                {t('secondaryCta')}
              </motion.button>
            </motion.div>

            {/* Stats */}
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
                  className="rounded-lg bg-white/70 px-4 py-3 text-center backdrop-blur-md dark:bg-white/15"
                >
                  <div className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-600 dark:text-white/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

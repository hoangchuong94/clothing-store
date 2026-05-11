'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { testimonials } from '@/features/products/data/ui';
import { Quote } from '@/components/ui/icon';

export function TestimonialsSection() {
  const t = useTranslations('home.testimonials');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative bg-white py-20 sm:py-32 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-300 bg-linear-to-r from-pink-100 to-purple-100 px-4 py-2 shadow-sm dark:border-pink-400 dark:from-pink-500/20 dark:to-purple-500/20 dark:shadow-lg dark:shadow-pink-500/20">
            <span className="relative flex h-2 w-2 rounded-full bg-pink-500">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
            </span>
            <span className="text-sm font-bold tracking-widest text-pink-600 uppercase dark:text-pink-300">
              {t('badge')}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-black sm:text-5xl md:text-6xl">
            <span className="bg-linear-to-r from-slate-900 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              {t('title')}
            </span>
          </h2>

          {/* Description */}
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('description')}</p>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{
                y: -6,
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
              }}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-purple-300 sm:p-8 dark:border-slate-700 dark:bg-linear-to-r dark:from-slate-800 dark:to-slate-900"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 -z-10 bg-linear-to-r from-cyan-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Quote icon */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0.6 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className="inline-block rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-cyan-500/20 dark:text-cyan-400"
              >
                <Quote size={22} />
              </motion.div>

              {/* Stars */}
              <div className="mt-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-lg text-yellow-400">
                    ★
                  </span>
                ))}
              </div>

              {/* Content */}
              <p className="mt-4 text-base text-slate-700 sm:text-lg dark:text-slate-300">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8"
        >
          {[
            { number: '50k+', label: t('trust.customers') },
            { number: '98%', label: t('trust.satisfaction') },
            { number: '150+', label: t('trust.countries') },
            { number: '24/7', label: t('trust.support') },
          ].map((badge, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="text-2xl font-black text-purple-600 sm:text-3xl dark:text-cyan-400">
                {badge.number}
              </div>
              <div className="mt-2 text-sm font-medium text-slate-600 sm:mt-3 dark:text-slate-400">
                {badge.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

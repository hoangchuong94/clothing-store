'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { testimonials } from '@/features/products/data/ui';
import { Quote, Star } from '@/components/ui/icon';

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
    <section className="border-border bg-background relative border-t py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/50 bg-indigo-50/80 px-4 py-2 text-indigo-900 shadow-sm dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-100">
            <span className="relative flex h-2 w-2 rounded-full bg-indigo-500">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            </span>
            <span className="text-sm font-bold tracking-widest uppercase">{t('badge')}</span>
          </div>

          <h2 className="text-foreground text-4xl font-black sm:text-5xl md:text-6xl">
            {t('title')}
          </h2>

          <p className="text-muted-foreground mt-4 text-lg">{t('description')}</p>
        </motion.div>

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
              whileHover={{ y: -6 }}
              className="group border-border bg-card text-card-foreground relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/15 sm:p-8"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-400 via-amber-400 to-rose-400 opacity-80" />
              <motion.div
                initial={{ scale: 0.85, opacity: 0.6 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className="inline-block rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-200"
              >
                <Quote size={22} />
              </motion.div>

              <div className="mt-4 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              <p className="text-muted-foreground mt-4 text-base sm:text-lg">
                {testimonial.content}
              </p>

              <div className="border-border mt-6 flex items-center gap-3 border-t pt-6">
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
                  <div className="text-foreground font-bold">{testimonial.author}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
              className="border-border bg-card text-card-foreground rounded-lg border p-4 text-center shadow-sm transition-all hover:border-teal-400/40 hover:shadow-md hover:shadow-teal-500/10 sm:p-6"
            >
              <div className="text-2xl font-black text-teal-600 sm:text-3xl dark:text-teal-300">
                {badge.number}
              </div>
              <div className="text-muted-foreground mt-2 text-sm font-medium sm:mt-3">
                {badge.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

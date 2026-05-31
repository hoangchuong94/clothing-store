'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { categories } from '@/features/products/data/ui';
import { ArrowRight } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';

export function CategoriesSection() {
  const t = useTranslations('home.categories');

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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="border-border bg-background relative border-t py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/50 bg-teal-50/80 px-3 py-1 text-xs font-bold text-teal-900 shadow-sm sm:mb-3 sm:px-4 sm:py-2 sm:text-sm dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
              </span>
              {t('badge')}
            </p>

            {/* Title */}
            <h2 className="text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-foreground">{t('title')}</span>
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mt-3 text-base sm:mt-4 sm:text-lg">
              {t('description')}
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="group border-border bg-card relative h-48 overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/15 sm:h-56 lg:h-64"
            >
              {/* Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-teal-950/80 via-slate-950/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-teal-950/85" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-black text-white drop-shadow sm:text-3xl"
                >
                  {category.name}
                </motion.h3>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 font-bold text-teal-950 shadow-sm"
                >
                  {t('explore')} <ArrowRight size={18} />
                </motion.div>
              </div>

              {/* Badge */}
              <div className="absolute top-3 right-3 rounded-lg border border-white/30 bg-white/85 px-3 py-1 text-xs font-bold text-teal-950 backdrop-blur-sm">
                {index + 1} / {categories.length}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

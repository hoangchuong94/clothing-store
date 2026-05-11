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
    <section className="relative bg-white py-20 sm:py-32 dark:bg-slate-950">
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
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-linear-to-r from-cyan-100 to-blue-100 px-3 py-1 text-xs font-bold text-cyan-700 shadow-sm sm:mb-3 sm:px-4 sm:py-2 sm:text-sm dark:border-cyan-500/50 dark:bg-cyan-500/10 dark:text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              {t('badge')}
            </p>

            {/* Title */}
            <h2 className="text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                {t('title')}
              </span>
            </h2>

            {/* Description */}
            <p className="mt-3 text-base text-slate-600 sm:mt-4 sm:text-lg dark:text-slate-400">
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
              className="group relative h-48 overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl sm:h-56 lg:h-64 dark:bg-slate-800"
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
              <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-slate-950/80 dark:via-slate-950/40" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-white"
                >
                  {category.name}
                </motion.h3>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-4 py-2 font-bold text-white"
                >
                  {t('explore')} <ArrowRight size={18} />
                </motion.div>
              </div>

              {/* Badge */}
              <div className="absolute top-3 right-3 rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                {index + 1} / {categories.length}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

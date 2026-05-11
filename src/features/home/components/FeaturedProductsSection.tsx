'use client';

import { motion } from 'framer-motion';
import { featuredProducts } from '@/features/products/data/ui';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Flame } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';

export function FeaturedProductsSection() {
  const t = useTranslations('home.featured');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section className="relative bg-white py-20 sm:py-32 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            {/* Badge */}
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-300 bg-linear-to-r from-orange-100 to-red-100 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm sm:mb-3 sm:px-4 sm:py-2 sm:text-sm dark:border-orange-500/50 dark:bg-orange-500/10 dark:text-orange-300">
              <Flame size={16} />
              <span className="font-bold tracking-widest uppercase">
                <span className="relative mr-2 inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                </span>
                {t('badge')}
              </span>
            </div>

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

          {/* Desktop Button */}
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="hidden w-full rounded-lg border-2 border-cyan-500 px-4 py-3 font-bold text-cyan-600 transition-all hover:bg-cyan-50 sm:block sm:w-auto sm:px-6 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
          >
            {t('viewAll')}
          </motion.button>
        </div>

        {/* Products */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>

        {/* Mobile Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-center sm:hidden"
        >
          <button className="w-full rounded-lg border-2 border-cyan-500 py-3 font-bold text-cyan-600 transition-all hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-500/10">
            {t('viewAllMobile')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

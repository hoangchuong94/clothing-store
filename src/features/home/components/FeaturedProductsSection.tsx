'use client';

import { motion } from 'framer-motion';
import { Product } from '@/features/products/types';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Flame } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';

interface FeaturedProductsSectionProps {
  products: Product[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
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
    <section className="border-border bg-background relative border-t py-20 sm:py-32">
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
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-300/50 bg-rose-50/80 px-3 py-1 text-xs font-bold text-rose-900 shadow-sm sm:mb-3 sm:px-4 sm:py-2 sm:text-sm dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
              <Flame size={16} className="text-rose-500" />
              <span className="font-bold tracking-widest uppercase">
                <span className="relative mr-2 inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                </span>
                {t('badge')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-foreground">{t('title')}</span>
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mt-3 text-base sm:mt-4 sm:text-lg">
              {t('description')}
            </p>
          </motion.div>

          {/* Desktop Button */}
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-background text-foreground hidden w-full rounded-lg border border-rose-500/30 px-4 py-3 font-bold transition-all hover:bg-rose-500/10 sm:block sm:w-auto sm:px-6"
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
          {products.map((product, index) => (
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
          <button className="bg-background text-foreground w-full rounded-lg border border-rose-500/30 py-3 font-bold transition-all hover:bg-rose-500/10">
            {t('viewAllMobile')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

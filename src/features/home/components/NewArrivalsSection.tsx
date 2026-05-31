'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Product } from '@/features/products/types';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Zap } from '@/components/ui/icon';
interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const t = useTranslations('home.newArrivals');

  return (
    <section
      className="border-border bg-background relative border-t py-20 sm:py-32"
      aria-label="New Arrivals scroll container"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 lg:mb-16"
        >
          {/* Badge */}
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-50/80 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm sm:mb-3 sm:px-4 sm:py-2 sm:text-sm dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            <Zap size={16} className="text-amber-500" />
            <span className="font-bold tracking-widest uppercase">
              <span className="relative mr-2 inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
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

        {/* Divider */}
        <div className="mb-8 h-px bg-linear-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
  index?: number;
  actions?: ReactNode;
}

export function ProductCard({ product, index = 0, actions }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
      },
    },
  };

  return (
    <motion.div variants={containerVariants} className="group h-full">
      <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 py-0 shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-slate-950/30">
        <div className="relative h-72 w-full overflow-hidden rounded-t-3xl bg-slate-100 dark:bg-slate-900/75">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge ? (
            <div className="absolute top-4 left-4 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950 uppercase dark:text-slate-950">
              {product.badge}
            </div>
          ) : null}
          {discount > 0 ? (
            <div className="absolute top-4 right-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white uppercase">
              -{discount}%
            </div>
          ) : null}
        </div>

        <CardHeader className="gap-2 px-5 py-4">
          <div className="flex items-center justify-between gap-2 text-xs tracking-[0.15em] text-slate-500 uppercase dark:text-slate-400">
            <span>{product.category}</span>
            {product.rating ? <span>{product.rating.toFixed(1)} ★</span> : null}
          </div>

          <h3 className="line-clamp-2 text-lg leading-snug font-semibold text-slate-950 dark:text-slate-50">
            {product.name}
          </h3>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 px-5 pb-4">
          <div className="flex items-center gap-3">
            <p className="text-xl font-bold text-slate-950 dark:text-slate-50">
              ${product.price.toFixed(2)}
            </p>
            {product.originalPrice ? (
              <span className="text-sm text-slate-500 line-through dark:text-slate-400">
                ${product.originalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {product.reviews ?? 0} reviews
          </p>
        </CardContent>

        {actions ? <div className="mt-auto px-5 pb-4">{actions}</div> : null}
      </Card>
    </motion.div>
  );
}

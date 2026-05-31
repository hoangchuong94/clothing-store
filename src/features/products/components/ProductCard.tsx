'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from '@/components/ui/icon';

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
      <Card className="group border-border bg-card text-card-foreground relative flex h-full flex-col overflow-hidden rounded-2xl border py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10">
        <div className="bg-muted relative h-72 w-full overflow-hidden rounded-t-2xl">
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
            <div className="absolute top-4 left-4 rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm">
              {product.badge}
            </div>
          ) : null}
          {discount > 0 ? (
            <div className="absolute top-4 right-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm">
              -{discount}%
            </div>
          ) : null}
        </div>

        <CardHeader className="gap-2 px-5 py-4">
          <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs tracking-[0.15em] uppercase">
            <span>{product.category}</span>
            {product.rating ? (
              <span className="inline-flex items-center gap-1 text-amber-500">
                {product.rating.toFixed(1)}
                <Star size={12} fill="currentColor" />
              </span>
            ) : null}
          </div>

          <h3 className="text-foreground line-clamp-2 text-lg leading-snug font-semibold">
            {product.name}
          </h3>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 px-5 pb-4">
          <div className="flex items-center gap-3">
            <p className="text-foreground text-xl font-bold">${product.price.toFixed(2)}</p>
            {product.originalPrice ? (
              <span className="text-muted-foreground text-sm line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>

          <p className="text-muted-foreground text-sm">{product.reviews ?? 0} reviews</p>
        </CardContent>

        {actions ? <div className="mt-auto px-5 pb-4">{actions}</div> : null}
      </Card>
    </motion.div>
  );
}

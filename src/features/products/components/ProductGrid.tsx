import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ReactNode } from 'react';

interface ProductGridProps {
  products: Product[];
  renderAction?: (product: Product) => ReactNode;
}

export async function ProductGrid({ products, renderAction }: ProductGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          actions={renderAction?.(product)}
        />
      ))}
    </div>
  );
}

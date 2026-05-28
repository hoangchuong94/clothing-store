import { PRODUCTS } from '../facades/product-source';
import type { Product } from '@/features/products/types';
import type { ProductRepository } from './product-repository';

export class StaticProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    try {
      const { recordRead } = await import('@/lib/server/metrics/product-repo-metrics');
      recordRead('STATIC', { operation: 'list', route: 'unknown' });
    } catch {}
    return PRODUCTS;
  }

  async getById(productId: string): Promise<Product | null> {
    try {
      const { recordRead } = await import('@/lib/server/metrics/product-repo-metrics');
      recordRead('STATIC', { operation: 'getById', route: 'unknown' });
    } catch {}
    const product = PRODUCTS.find((p) => p.id === productId);
    return product || null;
  }

  async getByIds(productIds: string[]): Promise<Product[]> {
    try {
      const { recordRead } = await import('@/lib/server/metrics/product-repo-metrics');
      recordRead('STATIC', { operation: 'getByIds', route: 'unknown' });
    } catch {}
    const uniqueIds = [...new Set(productIds.filter(Boolean))];
    return uniqueIds
      .map((productId) => PRODUCTS.find((p) => p.id === productId))
      .filter((product): product is Product => product != null);
  }
}

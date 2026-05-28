import type { Product } from '@/features/products/types';

export interface ProductRepository {
  /**
   * List all available products.
   */
  list(): Promise<Product[]>;

  /**
   * Get a product by canonical id (matches `Product.id` and cart `productId`).
   */
  getById(productId: string): Promise<Product | null>;

  /**
   * Get products for a set of canonical ids (matches cart `productId` values).
   */
  getByIds(productIds: string[]): Promise<Product[]>;
}

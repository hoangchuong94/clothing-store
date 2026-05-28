import type { Product } from '../types';
import { createProductRepository } from './repositories/create-product-repository';

const repository = createProductRepository();

export async function getAllProducts(): Promise<Product[]> {
  return repository.list();
}

export async function getProductById(productId: string): Promise<Product | undefined> {
  const p = await repository.getById(productId);
  return p ?? undefined;
}

export async function getProducts(productIds: string[]): Promise<Product[]> {
  return repository.getByIds(productIds);
}

export async function checkStock(
  productId: string,
  quantity: number,
): Promise<{ isAvailable: boolean; available: number }> {
  const product = await repository.getById(productId);
  const available = product?.stock ?? 0;
  return {
    isAvailable: available >= quantity,
    available,
  };
}

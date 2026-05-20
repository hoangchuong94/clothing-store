/**
 * Cart database operations — persisted via Prisma (UserServerCart).
 * Public API unchanged for server actions and PR2 client lifecycle.
 */

import prisma from '@/lib/server/prisma/prisma';
import type { Cart, CartItem } from '@/features/cart/types';
import type { Prisma } from '@/generated/prisma/client';

function parseCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as CartItem[];
}

function rowToCart(row: { items: unknown; lastUpdated: Date }): Cart {
  return {
    items: parseCartItems(row.items),
    lastUpdated: row.lastUpdated.getTime(),
  };
}

function itemsToJson(items: CartItem[]): Prisma.InputJsonValue {
  return items as unknown as Prisma.InputJsonValue;
}

// Re-export product functions for backward compatibility
export {
  getProductById as getProduct,
  getProducts,
  checkStock,
  getAllProducts,
} from '@/features/products/server/data';

/**
 * Get user cart from database
 */
export async function getUserCart(userId: string): Promise<Cart | null> {
  const row = await prisma.userServerCart.findUnique({
    where: { userId },
  });

  if (!row) {
    return null;
  }

  return rowToCart(row);
}

/**
 * Save user cart (upsert)
 */
export async function saveUserCart(userId: string, cart: Cart): Promise<void> {
  const lastUpdated = new Date(cart.lastUpdated ?? Date.now());

  await prisma.userServerCart.upsert({
    where: { userId },
    create: {
      userId,
      items: itemsToJson(cart.items),
      lastUpdated,
    },
    update: {
      items: itemsToJson(cart.items),
      lastUpdated,
    },
  });
}

/**
 * Delete user cart
 */
export async function deleteUserCart(userId: string): Promise<void> {
  await prisma.userServerCart.deleteMany({
    where: { userId },
  });
}

/**
 * @deprecated Dev-only helper; no longer simulates failures against in-memory store.
 */
export async function simulateRandomError(_probability: number = 0.01): Promise<void> {
  return;
}

/**
 * Clear user cart (alias for deleteUserCart)
 */
export async function clearUserCart(userId: string): Promise<void> {
  await deleteUserCart(userId);
}

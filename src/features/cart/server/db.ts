/**
 * Cart Database Operations
 * User cart persistence and retrieval
 * In production, this would be real Prisma queries
 */

import { Cart } from '@/features/cart/types';

/**
 * Simulated user cart database
 * In production: would be persisted in Prisma database
 * Keys are userId, values are cart data
 */
const USER_CARTS_DB: Record<string, Cart> = {
  'user-001': {
    items: [
      {
        id: 'cart-item-001',
        productId: 'prod-001',
        name: 'Classic Cotton T-Shirt',
        priceSnapshot: 29.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        stock: 150,
        variants: [
          { id: 'size', name: 'Size', value: 'M' },
          { id: 'color', name: 'Color', value: 'Black' },
        ],
        variantId: 'size-M-color-Black',
      },
    ],
    lastUpdated: Date.now(),
  },
};

// Re-export product functions for backward compatibility
export {
  getProductById as getProduct,
  getProducts,
  checkStock,
  getAllProducts,
} from '@/features/products/server/data';

/**
 * Get user cart from simulated DB
 * In production: Prisma query
 */
export async function getUserCart(userId: string): Promise<Cart | null> {
  // Simulate DB delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  return USER_CARTS_DB[userId] || null;
}

/**
 * Save user cart to simulated DB
 * In production: Prisma upsert/update
 */
export async function saveUserCart(userId: string, cart: Cart): Promise<void> {
  // Simulate DB delay and potential failure
  await new Promise((resolve) => setTimeout(resolve, 60));

  USER_CARTS_DB[userId] = {
    ...cart,
    lastUpdated: Date.now(),
  };
}

/**
 * Delete user cart from simulated DB
 * In production: Prisma delete
 */
export async function deleteUserCart(userId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  delete USER_CARTS_DB[userId];
}

/**
 * Simulate potential server errors
 * In production: handle actual DB errors
 */
export async function simulateRandomError(probability: number = 0.01): Promise<void> {
  if (Math.random() < probability) {
    throw new Error('Simulated database error - please try again');
  }
}

/**
 * Clear all user data (for testing/debugging)
 * In production: probably wouldn't expose this
 */
export async function clearUserCart(userId: string): Promise<void> {
  await deleteUserCart(userId);
}

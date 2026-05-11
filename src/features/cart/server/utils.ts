/**
 * Server-side cart utility functions
 * Business logic for cart operations (merging, validation, etc.)
 */

import { Cart, CartItem } from '@/features/cart/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique cart item ID
 */
export function generateCartItemId(): string {
  return uuidv4();
}

/**
 * Merge guest cart with existing user cart
 * Rules:
 * - If product exists in both: sum quantities (respect stock)
 * - If product only in guest: add to user cart
 * - If product only in user: keep as is
 * - Use newer priceSnapshot if quantities are different
 */
export function mergeCartsLogic(userCart: CartItem[], guestCart: CartItem[]): CartItem[] {
  // Create maps for easier lookup
  const userCartMap = new Map<string, CartItem>(userCart.map((item) => [item.id, item]));
  const guestCartMap = new Map<string, CartItem>(guestCart.map((item) => [item.id, item]));

  // Create a set of all product+variant combinations
  const processedKeys = new Set<string>();
  const mergedItems: CartItem[] = [];

  // Helper to create unique key for product variant combination
  const getKey = (item: CartItem): string => {
    return `${item.productId}__${item.variantId || 'no-variant'}`;
  };

  // Process guest cart items
  for (const guestItem of guestCart) {
    const key = getKey(guestItem);
    const userItem = userCart.find((item) => getKey(item) === key);

    if (userItem) {
      // Merge quantities: sum them up but respect stock
      const mergedQuantity = Math.min(userItem.quantity + guestItem.quantity, userItem.stock);

      mergedItems.push({
        ...userItem,
        quantity: mergedQuantity,
        // Use the most recent price snapshot (assume guest item is more recent)
        priceSnapshot: guestItem.priceSnapshot,
      });
    } else {
      // Guest item not in user cart, add it
      mergedItems.push({
        ...guestItem,
        id: generateCartItemId(), // Generate new ID for consistency
      });
    }

    processedKeys.add(key);
  }

  // Add remaining user cart items that weren't in guest cart
  for (const userItem of userCart) {
    const key = getKey(userItem);
    if (!processedKeys.has(key)) {
      mergedItems.push(userItem);
    }
  }

  return mergedItems;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): {
  itemCount: number;
  totalPrice: number;
  items: CartItem[];
} {
  let totalPrice = 0;
  let itemCount = 0;

  for (const item of items) {
    const itemTotal = item.priceSnapshot * item.quantity;
    totalPrice += itemTotal;
    itemCount += item.quantity;
  }

  return {
    itemCount,
    totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimals
    items,
  };
}

/**
 * Create empty cart
 */
export function createEmptyCart(): Cart {
  return {
    items: [],
    lastUpdated: Date.now(),
  };
}

/**
 * Validate if item quantities are within stock limits
 */
export function validateCartItems(items: CartItem[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const item of items) {
    if (item.quantity > item.stock) {
      errors.push(`Item "${item.name}" exceeds available stock (${item.stock})`);
    }
    if (item.quantity < 1) {
      errors.push(`Item "${item.name}" has invalid quantity`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

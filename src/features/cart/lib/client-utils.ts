/**
 * Client-side Cart Utilities
 * localStorage synchronization and merging logic
 */

'use client';

import { CartItem, Cart } from '@/features/cart/types';

const STORAGE_KEY = 'clothing-store-cart';
const STORAGE_TIMESTAMP_KEY = 'clothing-store-cart-timestamp';

/**
 * Save cart to localStorage
 * Called after every cart update
 */
export function saveCartToLocalStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

/**
 * Load cart from localStorage
 * Called on app initialization
 */
export function loadCartFromLocalStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCartFromLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
}

/**
 * Get cart timestamp from localStorage
 * Useful for determining cache validity
 */
export function getCartTimestamp(): number | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Failed to get cart timestamp:', error);
    return null;
  }
}

/**
 * Check if localStorage is available
 * Handles cases where localStorage is disabled or not available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error: unknown) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}

/**
 * Merge guest cart with server cart items
 * Client-side merge logic (similar to server-side but for client state)
 *
 * Rules:
 * - If same product+variant in both: sum quantities (respect stock)
 * - If only in guest: add to result
 * - If only in server: keep as is
 * - Use most recent price snapshot
 */
export function mergeGuestAndServerCart(
  guestItems: CartItem[],
  serverItems: CartItem[],
): CartItem[] {
  const serverMap = new Map<string, CartItem>(serverItems.map((item) => [getItemKey(item), item]));

  const mergedItems: CartItem[] = [];
  const processedKeys = new Set<string>();

  // Process guest items
  for (const guestItem of guestItems) {
    const key = getItemKey(guestItem);
    const serverItem = serverMap.get(key);

    if (serverItem) {
      // Merge: sum quantities but respect stock
      const mergedQuantity = Math.min(guestItem.quantity + serverItem.quantity, serverItem.stock);

      mergedItems.push({
        ...serverItem,
        quantity: mergedQuantity,
        priceSnapshot: guestItem.priceSnapshot, // Use guest (more recent)
      });
    } else {
      // Only in guest cart
      mergedItems.push(guestItem);
    }

    processedKeys.add(key);
  }

  // Add server items not in guest cart
  for (const [key, serverItem] of serverMap) {
    if (!processedKeys.has(key)) {
      mergedItems.push(serverItem);
    }
  }

  return mergedItems;
}

/**
 * Create unique key for cart item
 * Used to identify same product+variant combination
 */
function getItemKey(item: CartItem): string {
  return `${item.productId}__${item.variantId || 'no-variant'}`;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate subtotal, tax, and total
 * Useful for cart summary displays
 */
export function calculateCartSummary(
  items: CartItem[],
  taxRate: number = 0.08, // 8% tax
): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { subtotal, tax, total };
}

/**
 * Validate cart item quantity against stock
 */
export function isQuantityValid(item: CartItem, newQuantity: number): boolean {
  return newQuantity > 0 && newQuantity <= item.stock;
}

/**
 * Get maximum quantity available for item
 */
export function getMaxQuantity(item: CartItem): number {
  return item.stock;
}

/**
 * Convert cart items to cart object
 */
export function itemsToCart(items: CartItem[]): Cart {
  return {
    items,
    lastUpdated: Date.now(),
  };
}

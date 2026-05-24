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
 * - Re-resolve price, name, image from server product data (security)
 */
export function mergeCartsLogic(
  userCart: CartItem[],
  guestCart: CartItem[],
  products: Map<string, { name: string; price: number; image: string }>,
): CartItem[] {
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

    // Get server product data for security
    const productData = products.get(guestItem.productId);

    if (!productData) {
      // Skip items with invalid products
      continue;
    }

    if (userItem) {
      // Merge quantities: sum them up but respect stock
      const mergedQuantity = Math.min(userItem.quantity + guestItem.quantity, userItem.stock);

      mergedItems.push({
        ...userItem,
        quantity: mergedQuantity,
        // Re-resolve from server product data (security: ignore client values)
        name: productData.name,
        priceSnapshot: productData.price,
        image: productData.image,
      });
    } else {
      // Guest item not in user cart, add it with server data
      mergedItems.push({
        ...guestItem,
        id: generateCartItemId(), // Generate new ID for consistency
        // Re-resolve from server product data (security: ignore client values)
        name: productData.name,
        priceSnapshot: productData.price,
        image: productData.image,
      });
    }

    processedKeys.add(key);
  }

  // Add remaining user cart items that weren't in guest cart
  for (const userItem of userCart) {
    const key = getKey(userItem);
    if (!processedKeys.has(key)) {
      // Also re-resolve user cart items from server data
      const productData = products.get(userItem.productId);
      if (productData) {
        mergedItems.push({
          ...userItem,
          name: productData.name,
          priceSnapshot: productData.price,
          image: productData.image,
        });
      } else {
        // Keep item even if product not found (backward compatibility)
        mergedItems.push(userItem);
      }
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
 * Find cart item by ID
 */
export function findCartItem(cart: Cart, cartItemId: string): CartItem | undefined {
  return cart.items.find((item) => item.id === cartItemId);
}

/**
 * Find cart item by product and variant
 * Useful for checking if product is already in cart
 */
export function findCartItemByProduct(
  cart: Cart,
  productId: string,
  variantId?: string,
): CartItem | undefined {
  return cart.items.find(
    (item) =>
      item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId),
  );
}

/**
 * Validate cart item (check stock, etc.)
 */
export function validateCartItem(item: CartItem): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (item.quantity <= 0) {
    errors.push('Quantity must be positive');
  }

  if (item.quantity > item.stock) {
    errors.push(`Only ${item.stock} items available in stock`);
  }

  if (!item.productId || !item.name) {
    errors.push('Product information is incomplete');
  }

  if (item.priceSnapshot <= 0) {
    errors.push('Price must be positive');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate entire cart
 */
export function validateCart(cart: Cart): {
  isValid: boolean;
  errors: Record<string, string[]>;
} {
  const errors: Record<string, string[]> = {};

  for (const item of cart.items) {
    const validation = validateCartItem(item);
    if (!validation.isValid) {
      errors[item.id] = validation.errors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Filter out invalid items from cart
 * Useful for recovering from corrupted cart data
 */
export function sanitizeCart(cart: Cart): Cart {
  return {
    ...cart,
    items: cart.items.filter((item) => {
      const validation = validateCartItem(item);
      return validation.isValid;
    }),
  };
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0;
}

/**
 * Get cart item count
 */
export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

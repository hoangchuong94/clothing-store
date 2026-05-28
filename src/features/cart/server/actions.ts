/**
 * Server Actions for Cart Operations
 * All requests validated with Zod
 * Consistent response format with success/error handling
 * Used with Redux for optimistic updates
 *
 * Security notes:
 * - In production: verify user authentication
 * - All inputs validated with Zod
 * - Consider adding rate limiting
 * - Log cart modifications for audit trail
 */

'use server';

import { CartActionResponse, CartItem, Cart } from '@/features/cart/types';
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  RemoveCartItemSchema,
  ClearCartSchema,
  MergeCartSchema,
} from './schemas';
import {
  mergeCartsLogic,
  generateCartItemId,
  findCartItemByProduct,
  findCartItem,
  createEmptyCart,
} from './utils';
import {
  getProduct,
  getProducts,
  getUserCart,
  saveUserCart,
  deleteUserCart,
  checkStock,
} from './db';
import { getCurrentUserSession } from '@/lib/server/actions/auth';

/**
 * Add product to cart
 * Supports guest (localStorage) and authenticated users (server storage)
 * Validates stock before adding
 * Returns optimistic update data
 */
export async function addToCart(input: unknown): Promise<CartActionResponse<CartItem>> {
  try {
    // Validate input
    const validatedInput = AddToCartSchema.parse(input);

    // Check if product exists and stock is available
    const product = await getProduct(validatedInput.productId);
    if (!product) {
      return {
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      };
    }

    // Validate stock
    const stockCheck = await checkStock(validatedInput.productId, validatedInput.quantity);

    if (!stockCheck.isAvailable) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `Only ${stockCheck.available} items available`,
        },
      };
    }

    // Get current user session (for determining cart storage)
    const session = await getCurrentUserSession();

    // Create cart item with server-derived product data (security: ignore client values)
    const cartItem: CartItem = {
      id: generateCartItemId(),
      productId: validatedInput.productId,
      name: product.name,
      priceSnapshot: product.price,
      quantity: validatedInput.quantity,
      image: product.image,
      // Server-authoritative stock snapshot (never trust client value).
      stock: stockCheck.available,
      variants: validatedInput.variants,
      variantId: validatedInput.variantId,
    };

    // If authenticated: save to server cart
    if (session.isAuthenticated && session.userId) {
      const userCart = (await getUserCart(session.userId)) || createEmptyCart();

      // Check if product with same variant already exists
      const existingItem = findCartItemByProduct(
        userCart,
        validatedInput.productId,
        validatedInput.variantId,
      );

      if (existingItem) {
        const requestedTotalQuantity = existingItem.quantity + validatedInput.quantity;
        const totalStockCheck = await checkStock(validatedInput.productId, requestedTotalQuantity);

        if (!totalStockCheck.isAvailable) {
          return {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `Only ${totalStockCheck.available} items available`,
            },
          };
        }

        existingItem.quantity = requestedTotalQuantity;
        existingItem.stock = totalStockCheck.available;

        const updatedCart: Cart = {
          items: userCart.items,
          lastUpdated: Date.now(),
        };

        await saveUserCart(session.userId, updatedCart);
        return { success: true, data: existingItem };
      }

      // Add new item
      userCart.items.push(cartItem);
      await saveUserCart(session.userId, userCart);
    }

    // For guest users, cart is managed in Redux + localStorage on client side
    // Return the item for optimistic update

    return {
      success: true,
      data: cartItem,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
        },
      };
    }

    console.error('addToCart error:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add item to cart',
      },
    };
  }
}

/**
 * Update cart item quantity
 * Validates stock availability before updating
 */
export async function updateCartItem(input: unknown): Promise<CartActionResponse<CartItem>> {
  try {
    const validatedInput = UpdateCartItemSchema.parse(input);

    const session = await getCurrentUserSession();

    // If authenticated: update server cart
    if (session.isAuthenticated && session.userId) {
      const userCart = await getUserCart(session.userId);
      if (!userCart) {
        return {
          success: false,
          error: {
            code: 'CART_NOT_FOUND',
            message: 'Cart not found',
          },
        };
      }

      const cartItem = findCartItem(userCart, validatedInput.cartItemId);
      if (!cartItem) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in cart',
          },
        };
      }

      // Check stock
      const stockCheck = await checkStock(cartItem.productId, validatedInput.quantity);

      if (!stockCheck.isAvailable) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Only ${stockCheck.available} items available`,
          },
        };
      }

      // Update quantity
      cartItem.quantity = validatedInput.quantity;
      cartItem.stock = stockCheck.available;
      await saveUserCart(session.userId, userCart);

      return { success: true, data: cartItem };
    }

    // For guest users: handled on client side with localStorage
    // Return success for optimistic update
    return {
      success: true,
      data: {
        id: validatedInput.cartItemId,
        productId: '',
        name: '',
        priceSnapshot: 0,
        quantity: validatedInput.quantity,
        image: '',
        stock: 0,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
        },
      };
    }

    console.error('updateCartItem error:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update cart item',
      },
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(input: unknown): Promise<CartActionResponse<boolean>> {
  try {
    const validatedInput = RemoveCartItemSchema.parse(input);

    const session = await getCurrentUserSession();

    if (session.isAuthenticated && session.userId) {
      const userCart = await getUserCart(session.userId);
      if (!userCart) {
        return {
          success: false,
          error: {
            code: 'CART_NOT_FOUND',
            message: 'Cart not found',
          },
        };
      }

      const initialLength = userCart.items.length;
      userCart.items = userCart.items.filter((item) => item.id !== validatedInput.cartItemId);

      if (userCart.items.length === initialLength) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in cart',
          },
        };
      }

      await saveUserCart(session.userId, userCart);
    }

    return { success: true, data: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
        },
      };
    }

    console.error('removeCartItem error:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to remove item from cart',
      },
    };
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(input: unknown): Promise<CartActionResponse<boolean>> {
  try {
    ClearCartSchema.parse(input);

    const session = await getCurrentUserSession();

    if (session.isAuthenticated && session.userId) {
      await deleteUserCart(session.userId);
    }

    return { success: true, data: true };
  } catch (error) {
    console.error('clearCart error:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to clear cart',
      },
    };
  }
}

/**
 * Merge guest cart with server cart
 * Called when user logs in after browsing as guest
 * Re-resolves all prices from server product data for security
 */
export async function mergeCart(input: unknown): Promise<CartActionResponse<Cart>> {
  try {
    const validatedInput = MergeCartSchema.parse(input);

    const session = await getCurrentUserSession();

    if (!session.isAuthenticated || !session.userId) {
      return {
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'User must be authenticated to merge cart',
        },
      };
    }

    // Get existing user cart
    let userCart = (await getUserCart(session.userId)) || createEmptyCart();

    // Collect all unique product IDs from both carts
    const productIds = new Set<string>();
    userCart.items.forEach((item) => productIds.add(item.productId));
    validatedInput.guestCart.forEach((item) => productIds.add(item.productId));

    // Fetch all products from server
    const products = await getProducts(Array.from(productIds));

    // Create product map for quick lookup
    const productMap = new Map<string, { name: string; price: number; image: string }>(
      products.map((p) => [p.id, { name: p.name, price: p.price, image: p.image }]),
    );

    // Merge carts using merge logic with server product data
    const mergedItems = mergeCartsLogic(userCart.items, validatedInput.guestCart, productMap);

    userCart = {
      items: mergedItems,
      lastUpdated: Date.now(),
    };

    // Save merged cart
    await saveUserCart(session.userId, userCart);

    return { success: true, data: userCart };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
        },
      };
    }

    console.error('mergeCart error:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to merge cart',
      },
    };
  }
}

/**
 * Get user's server cart
 * Used to sync cart state when user logs in
 */
export async function getUserServerCart(): Promise<CartActionResponse<Cart>> {
  try {
    const session = await getCurrentUserSession();

    if (!session.isAuthenticated || !session.userId) {
      return {
        success: true,
        data: createEmptyCart(),
      };
    }

    const cart = (await getUserCart(session.userId)) || createEmptyCart();

    return { success: true, data: cart };
  } catch (error) {
    console.error('getUserServerCart error:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch cart',
      },
    };
  }
}

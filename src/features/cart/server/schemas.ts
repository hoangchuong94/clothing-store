/**
 * Zod validation schemas for cart operations
 * Ensures type-safe server action inputs
 */

import { z } from 'zod';

/**
 * Variant schema - supports multiple variant attributes
 */
export const CartItemVariantSchema = z.object({
  id: z.string().min(1, 'Variant ID is required'),
  name: z.string().min(1, 'Variant name is required'),
  value: z.string().min(1, 'Variant value is required'),
});

/**
 * Add to cart validation
 * Ensures all required fields are present and valid
 */
export const AddToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required').max(255),
  priceSnapshot: z
    .number()
    .positive('Price must be positive')
    .finite('Price must be a finite number'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be at least 1')
    .max(999, 'Quantity cannot exceed 999'),
  image: z.string().url('Image must be a valid URL'),
  stock: z.number().int('Stock must be an integer').nonnegative('Stock cannot be negative'),
  variants: CartItemVariantSchema.array().optional(),
  variantId: z.string().optional(),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;

/**
 * Update cart item validation
 * Ensures quantity is valid
 */
export const UpdateCartItemSchema = z.object({
  cartItemId: z.string().min(1, 'Cart item ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be at least 1')
    .max(999, 'Quantity cannot exceed 999'),
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

/**
 * Remove cart item validation
 */
export const RemoveCartItemSchema = z.object({
  cartItemId: z.string().min(1, 'Cart item ID is required'),
});

export type RemoveCartItemInput = z.infer<typeof RemoveCartItemSchema>;

/**
 * Clear cart validation (typically just needs userId for server carts)
 */
export const ClearCartSchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional(),
});

export type ClearCartInput = z.infer<typeof ClearCartSchema>;

/**
 * Merge cart validation
 * Used when guest user logs in to merge localStorage cart with server cart
 */
export const MergeCartSchema = z.object({
  guestCart: z.array(
    z.object({
      id: z.string(),
      productId: z.string(),
      name: z.string(),
      priceSnapshot: z.number(),
      quantity: z.number(),
      image: z.string(),
      stock: z.number(),
      variants: CartItemVariantSchema.array().optional(),
      variantId: z.string().optional(),
    }),
  ),
  userId: z.string().min(1, 'User ID is required'),
});

export type MergeCartInput = z.infer<typeof MergeCartSchema>;

/**
 * Stock validation schema
 * Used to check if quantity is available
 */
export const StockValidationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be at least 1'),
  variantId: z.string().optional(),
});

export type StockValidationInput = z.infer<typeof StockValidationSchema>;

/**
 * Cart System Type Definitions
 * Domain-specific cart types are centralized in the cart feature.
 */

import { Product } from '../products/types';

export interface CartItemVariant {
  id: string;
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceSnapshot: number;
  quantity: number;
  image: string;
  stock: number;
  variants?: CartItemVariant[];
  variantId?: string;
}

export interface Cart {
  items: CartItem[];
  lastUpdated?: number;
}

export interface UserSession {
  userId?: string;
  isAuthenticated: boolean;
}

export interface CartActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AddToCartPayload {
  productId: string;
  name: string;
  priceSnapshot: number;
  quantity: number;
  image: string;
  stock: number;
  variants?: CartItemVariant[];
  variantId?: string;
}

export interface UpdateCartItemPayload {
  cartItemId: string;
  quantity: number;
}

export interface RemoveCartItemPayload {
  cartItemId: string;
}

export interface MergeCartPayload {
  guestCart: CartItem[];
  userId: string;
}

export interface CartTotals {
  itemCount: number;
  totalPrice: number;
  itemsCount: number;
}

export interface StockValidationResult {
  isValid: boolean;
  availableQuantity: number;
  message?: string;
}

/**
 * Redux Slice for Cart State Management
 * Handles:
 * - Optimistic updates with rollback on error
 * - localStorage synchronization
 * - Loading and error states
 * - Support for both guest and authenticated users
 */

'use client';

import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { CartItem, CartTotals } from '@/features/cart/types';

/**
 * Cart state structure
 */
interface CartState {
  items: CartItem[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  lastUpdated: number | null;

  // Optimistic update tracking
  previousState: CartItem[] | null;
  isOptimisticUpdate: boolean;
}

const initialState: CartState = {
  items: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
  previousState: null,
  isOptimisticUpdate: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Initialize cart from localStorage or server
     */
    initializeCart: (state, action: PayloadAction<{ items: CartItem[]; timestamp: number }>) => {
      state.items = action.payload.items;
      state.lastUpdated = action.payload.timestamp;
      state.error = null;
      state.status = 'idle';
    },

    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Optimistic: Add item to cart
     * Saves previous state for rollback
     */
    addToCartOptimistic: (state, action: PayloadAction<CartItem>) => {
      state.previousState = [...state.items];
      state.isOptimisticUpdate = true;

      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          (action.payload.variantId
            ? item.variantId === action.payload.variantId
            : !item.variantId),
      );

      if (existingItem) {
        // Update quantity of existing item
        existingItem.quantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          existingItem.stock,
        );
      } else {
        // Add new item
        state.items.push(action.payload);
      }

      state.lastUpdated = Date.now();
    },

    /**
     * Success: Confirm add to cart
     */
    addToCartSuccess: (state, action: PayloadAction<CartItem>) => {
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'idle';
      state.error = null;

      // Update with server data if different
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        Object.assign(existingItem, action.payload);
      }
    },

    /**
     * Error: Rollback add to cart
     */
    addToCartError: (state, action: PayloadAction<string>) => {
      if (state.previousState) {
        state.items = state.previousState;
      }
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'error';
      state.error = action.payload;
    },

    /**
     * Optimistic: Update item quantity
     */
    updateCartItemOptimistic: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      state.previousState = [...state.items];
      state.isOptimisticUpdate = true;

      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = Math.min(action.payload.quantity, item.stock);
        state.lastUpdated = Date.now();
      }
    },

    /**
     * Success: Confirm update
     */
    updateCartItemSuccess: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'idle';
      state.error = null;

      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    /**
     * Error: Rollback update
     */
    updateCartItemError: (state, action: PayloadAction<string>) => {
      if (state.previousState) {
        state.items = state.previousState;
      }
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'error';
      state.error = action.payload;
    },

    /**
     * Optimistic: Remove item from cart
     */
    removeCartItemOptimistic: (state, action: PayloadAction<string>) => {
      state.previousState = [...state.items];
      state.isOptimisticUpdate = true;

      state.items = state.items.filter((item) => item.id !== action.payload);
      state.lastUpdated = Date.now();
    },

    /**
     * Success: Confirm removal
     */
    removeCartItemSuccess: (state) => {
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'idle';
      state.error = null;
    },

    /**
     * Error: Rollback removal
     */
    removeCartItemError: (state, action: PayloadAction<string>) => {
      if (state.previousState) {
        state.items = state.previousState;
      }
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'error';
      state.error = action.payload;
    },

    /**
     * Clear entire cart
     */
    clearCartOptimistic: (state) => {
      state.previousState = [...state.items];
      state.isOptimisticUpdate = true;
      state.items = [];
      state.lastUpdated = Date.now();
    },

    /**
     * Success: Confirm clear
     */
    clearCartSuccess: (state) => {
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'idle';
      state.error = null;
    },

    /**
     * Error: Rollback clear
     */
    clearCartError: (state, action: PayloadAction<string>) => {
      if (state.previousState) {
        state.items = state.previousState;
      }
      state.previousState = null;
      state.isOptimisticUpdate = false;
      state.status = 'error';
      state.error = action.payload;
    },

    /**
     * Merge guest cart with server cart
     * Called when user logs in
     */
    mergeCartSuccess: (state, action: PayloadAction<{ items: CartItem[] }>) => {
      state.items = action.payload.items;
      state.lastUpdated = Date.now();
      state.status = 'idle';
      state.error = null;
      state.previousState = null;
      state.isOptimisticUpdate = false;
    },

    /**
     * Error during merge
     */
    mergeCartError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },

    /**
     * Set loading state
     */
    setLoading: (state) => {
      state.status = 'loading';
    },

    /**
     * Sync cart from external source (localStorage, server)
     * Used on app initialization
     */
    syncCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.lastUpdated = Date.now();
    },
  },
});

export const {
  initializeCart,
  clearError,
  addToCartOptimistic,
  addToCartSuccess,
  addToCartError,
  updateCartItemOptimistic,
  updateCartItemSuccess,
  updateCartItemError,
  removeCartItemOptimistic,
  removeCartItemSuccess,
  removeCartItemError,
  clearCartOptimistic,
  clearCartSuccess,
  clearCartError,
  mergeCartSuccess,
  mergeCartError,
  setLoading,
  syncCart,
} = cartSlice.actions;

/**
 * Selectors
 */

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartStatus = (state: RootState) => state.cart.status;

export const selectCartError = (state: RootState) => state.cart.error;

export const selectCartIsLoading = (state: RootState) => state.cart.status === 'loading';

export const selectCartIsOptimisticUpdate = (state: RootState) => state.cart.isOptimisticUpdate;

export const selectCartTotals = createSelector(
  (state: RootState) => state.cart.items,
  (items): CartTotals => {
    let itemCount = 0;
    let totalPrice = 0;

    for (const item of items) {
      itemCount += item.quantity;
      totalPrice += item.priceSnapshot * item.quantity;
    }

    return {
      itemCount,
      totalPrice: Math.round(totalPrice * 100) / 100,
      itemsCount: itemCount,
    };
  },
);

export const selectCartItemCount = (state: RootState): number => {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

export const selectCartTotalPrice = (state: RootState): number => {
  return (
    Math.round(
      state.cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0) * 100,
    ) / 100
  );
};

export const selectCartIsEmpty = (state: RootState): boolean => {
  return state.cart.items.length === 0;
};

export const selectLastUpdated = (state: RootState) => state.cart.lastUpdated;

export default cartSlice.reducer;

/**
 * useAddToCart - Add to cart with optimistic updates
 * Handles optimistic updates with server action confirmation
 * Includes error handling and rollback
 */

'use client';

import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/client/redux/store';
import {
  addToCartOptimistic,
  addToCartSuccess,
  addToCartError,
} from '@/lib/client/redux/cartSlice';
import { addToCart as addToCartAction } from '@/lib/server/actions/cart';
import { CartItem, AddToCartPayload } from '@/features/cart/types';

interface UseAddToCartOptions {
  onSuccess?: (item: CartItem) => void;
  onError?: (error: string) => void;
}

export function useAddToCart(options?: UseAddToCartOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const addItem = useCallback(
    async (payload: AddToCartPayload) => {
      setIsLoading(true);

      try {
        // 1. Optimistic update - immediately update UI
        const optimisticItem: CartItem = {
          id: `temp-${Date.now()}`,
          ...payload,
        };

        dispatch(addToCartOptimistic(optimisticItem));

        // 2. Server action - validate and persist
        const response = await addToCartAction(payload);

        if (response.success && response.data) {
          // 3. Confirm with server data
          dispatch(addToCartSuccess(response.data));
          options?.onSuccess?.(response.data);
          return { success: true, data: response.data };
        } else {
          // Error from server - rollback optimistic update
          const errorMessage = response.error?.message || 'Failed to add item';
          dispatch(addToCartError(errorMessage));
          options?.onError?.(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        dispatch(addToCartError(errorMessage));
        options?.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, options],
  );

  return {
    addItem,
    isLoading,
  };
}

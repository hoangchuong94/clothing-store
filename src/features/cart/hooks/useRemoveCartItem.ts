/**
 * useRemoveCartItem - Remove item from cart
 * Handles optimistic removal with rollback on error
 */

'use client';

import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/client/redux/store';
import {
  removeCartItemOptimistic,
  removeCartItemSuccess,
  removeCartItemError,
} from '@/lib/client/redux/cartSlice';
import { removeCartItem as removeCartItemAction } from '@/lib/server/actions/cart';

interface UseRemoveCartItemOptions {
  onSuccess?: (cartItemId: string) => void;
  onError?: (error: string) => void;
}

export function useRemoveCartItem(options?: UseRemoveCartItemOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const removeItem = useCallback(
    async (cartItemId: string) => {
      setIsLoading(true);

      try {
        // 1. Optimistic update - remove immediately
        dispatch(removeCartItemOptimistic(cartItemId));

        // 2. Server action - confirm removal
        const response = await removeCartItemAction({ cartItemId });

        if (response.success) {
          dispatch(removeCartItemSuccess());
          options?.onSuccess?.(cartItemId);
          return { success: true };
        } else {
          // Error - rollback
          const errorMessage = response.error?.message || 'Failed to remove item';
          dispatch(removeCartItemError(errorMessage));
          options?.onError?.(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        dispatch(removeCartItemError(errorMessage));
        options?.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, options],
  );

  return {
    removeItem,
    isLoading,
  };
}

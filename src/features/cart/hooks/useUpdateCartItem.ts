/**
 * useUpdateCartItem - Update cart item quantity
 * Handles optimistic updates with debouncing
 */

'use client';

import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/features/cart/lib/redux/store';
import {
  updateCartItemOptimistic,
  updateCartItemSuccess,
  updateCartItemError,
} from '@/features/cart/lib/redux/cartSlice';
import { updateCartItem as updateCartItemAction } from '@/features/cart/server/actions';

interface UseUpdateCartItemOptions {
  debounceMs?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useUpdateCartItem(options?: UseUpdateCartItemOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        // 1. Optimistic update
        dispatch(updateCartItemOptimistic({ id: cartItemId, quantity }));

        // 2. Clear any pending debounced action
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // 3. Debounce server action to avoid rapid calls
        debounceRef.current = setTimeout(async () => {
          try {
            const response = await updateCartItemAction({
              cartItemId,
              quantity,
            });

            if (response.success) {
              dispatch(updateCartItemSuccess({ id: cartItemId, quantity }));
              options?.onSuccess?.();
            } else {
              const errorMessage = response.error?.message || 'Failed to update quantity';
              dispatch(updateCartItemError(errorMessage));
              options?.onError?.(errorMessage);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'An unexpected error occurred';
            dispatch(updateCartItemError(errorMessage));
            options?.onError?.(errorMessage);
          }
        }, options?.debounceMs || 500);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        dispatch(updateCartItemError(errorMessage));
        options?.onError?.(errorMessage);
      }
    },
    [dispatch, options],
  );

  const cancelPending = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  return {
    updateQuantity,
    cancelPending,
  };
}

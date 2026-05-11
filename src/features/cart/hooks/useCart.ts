/**
 * useCart - Main cart hook
 * Provides cart state and basic operations
 */

'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/features/cart/lib/redux/store';
import {
  selectCartItems,
  selectCartError,
  selectCartIsLoading,
  selectCartTotals,
  selectCartIsEmpty,
  selectCartTotalPrice,
  selectCartItemCount,
  clearError,
} from '@/features/cart/lib/redux/cartSlice';

export function useCart() {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector(selectCartItems);
  const error = useSelector(selectCartError);
  const isLoading = useSelector(selectCartIsLoading);
  const totals = useSelector(selectCartTotals);
  const isEmpty = useSelector(selectCartIsEmpty);
  const totalPrice = useSelector(selectCartTotalPrice);
  const itemCount = useSelector(selectCartItemCount);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    items,
    error,
    isLoading,
    isEmpty,
    itemCount,
    totalPrice,
    totals,
    clearError: handleClearError,
  };
}

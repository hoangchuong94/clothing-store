/**
 * useCartPersistence - Sync cart with localStorage
 * Handles initialization and persistence across page reloads
 */

'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/features/cart/lib/redux/store';
import { initializeCart } from '@/features/cart/lib/redux/cartSlice';
import {
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
  isLocalStorageAvailable,
} from '@/features/cart/lib/client-utils';
import { selectCartItems } from '@/features/cart/lib/redux/cartSlice';

/**
 * Initialize cart from localStorage on app mount
 */
export function useCartInitialization() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isLocalStorageAvailable()) return;

    const savedCart = loadCartFromLocalStorage();
    dispatch(
      initializeCart({
        items: savedCart,
        timestamp: Date.now(),
      }),
    );
  }, [dispatch]);
}

/**
 * Sync cart state with localStorage on updates
 */
export function useCartSync() {
  const items = useSelector(selectCartItems);

  useEffect(() => {
    if (!isLocalStorageAvailable()) return;

    // Save to localStorage whenever items change
    saveCartToLocalStorage(items);
  }, [items]);
}

/**
 * Combined hook for full cart persistence
 */
export function useCartPersistence() {
  useCartInitialization();
  useCartSync();
}

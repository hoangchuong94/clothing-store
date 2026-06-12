'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/features/cart/lib/redux/store';
import { store } from '@/features/cart/lib/redux/store';
import {
  mergeCartSuccess,
  mergeCartError,
  setLoading,
  syncCart,
  selectCartItems,
} from '@/features/cart/lib/redux/cartSlice';
import { mergeCart, getUserServerCart } from '@/features/cart/server/actions';
import { loadCartFromLocalStorage } from '@/features/cart/lib/client-utils';

const syncDoneKey = (userId: string) => `cart-auth-sync-done-${userId}`;
const syncLockKey = (userId: string) => `cart-auth-sync-lock-${userId}`;

function clearSyncSessionKeys(userId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(syncDoneKey(userId));
  sessionStorage.removeItem(syncLockKey(userId));
}

function isSyncLocked(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(syncLockKey(userId)) === '1';
}

function setSyncLock(userId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(syncLockKey(userId), '1');
}

function releaseSyncLock(userId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(syncLockKey(userId));
}

function markSyncDone(userId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(syncDoneKey(userId), '1');
}

function isSyncDone(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(syncDoneKey(userId)) === '1';
}

/**
 * Syncs Redux/localStorage cart with server cart when NextAuth session becomes authenticated.
 * Guest mode: no server sync; localStorage remains the source (via useCartPersistence).
 */
export function useCartAuthSync(): void {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const syncedUserIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);
  const prevStatusRef = useRef<string | null>(null);
  const lastAuthenticatedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      if (lastAuthenticatedUserIdRef.current) {
        clearSyncSessionKeys(lastAuthenticatedUserIdRef.current);
      }
      syncedUserIdRef.current = null;
      isSyncingRef.current = false;
      lastAuthenticatedUserIdRef.current = null;
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      return;
    }

    lastAuthenticatedUserIdRef.current = userId;

    if (syncedUserIdRef.current === userId || isSyncingRef.current || isSyncLocked(userId)) {
      return;
    }

    // Reload / remount: already synced this browser tab — skip duplicate merge.
    if (isSyncDone(userId) && prevStatus !== 'unauthenticated') {
      syncedUserIdRef.current = userId;
      return;
    }

    const isLoginTransition = prevStatus === 'unauthenticated';

    const runSync = async () => {
      isSyncingRef.current = true;
      setSyncLock(userId);
      dispatch(setLoading());

      try {
        const reduxItems = selectCartItems(store.getState());
        const localItems = loadCartFromLocalStorage();
        const guestCart = reduxItems.length > 0 ? reduxItems : localItems;

        const shouldMergeGuest = isLoginTransition && guestCart.length > 0;

        const response = shouldMergeGuest
          ? await mergeCart({ guestCart })
          : await getUserServerCart();

        if (response.success && response.data) {
          if (shouldMergeGuest) {
            dispatch(mergeCartSuccess({ items: response.data.items }));
          } else {
            dispatch(syncCart(response.data.items));
          }
          syncedUserIdRef.current = userId;
          markSyncDone(userId);
        } else {
          dispatch(mergeCartError(response.error?.message ?? 'Failed to sync cart'));
        }
      } catch (error) {
        dispatch(
          mergeCartError(error instanceof Error ? error.message : 'Failed to sync cart'),
        );
      } finally {
        isSyncingRef.current = false;
        releaseSyncLock(userId);
      }
    };

    void runSync();
  }, [status, session?.user?.id, dispatch]);
}

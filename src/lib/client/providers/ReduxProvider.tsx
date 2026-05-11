/**
 * Redux Provider Component
 * Wraps app with Redux store
 */

'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/features/cart/lib/redux/store';
import { useCartPersistence } from '@/features/cart/hooks';

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * Cart Persistence Wrapper
 * Initializes and syncs cart with localStorage
 */
function CartPersistenceWrapper({ children }: { children: React.ReactNode }) {
  useCartPersistence();
  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <CartPersistenceWrapper>{children}</CartPersistenceWrapper>
    </Provider>
  );
}

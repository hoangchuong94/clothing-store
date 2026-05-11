'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useHeaderState, CartState, AuthState } from '@/features/user/hooks/useHeaderState';

interface HeaderContextType {
  cart: CartState;
  updateCartItems: (items: number) => void;
  auth: AuthState;
  login: (user: { name: string; email: string }) => void;
  logout: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const headerState = useHeaderState();

  return <HeaderContext.Provider value={headerState}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
}

import { useState, useCallback } from 'react';

export interface CartState {
  items: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  user?: {
    name: string;
    email: string;
  };
}

export function useHeaderState() {
  const [cart, setCart] = useState<CartState>({
    items: 3,
  });

  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    user: undefined,
  });

  const updateCartItems = useCallback((items: number) => {
    setCart({ items });
  }, []);

  const login = useCallback((user: { name: string; email: string }) => {
    setAuth({ isLoggedIn: true, user });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, user: undefined });
  }, []);

  return {
    cart,
    updateCartItems,
    auth,
    login,
    logout,
  };
}

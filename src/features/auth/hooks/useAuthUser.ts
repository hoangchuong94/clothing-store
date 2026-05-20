'use client';

import { useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type UseAuthUserReturn = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
};

/**
 * Client-side auth adapter — single source for UI session state.
 * Wraps NextAuth `useSession`; guest is `user: null` (not fake local state).
 */
export function useAuthUser(): UseAuthUserReturn {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';

  const user: AuthUser | null =
    session?.user?.id != null
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null;

  const isAuthenticated = status === 'authenticated' && user !== null;

  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}

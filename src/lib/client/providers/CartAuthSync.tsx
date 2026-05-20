'use client';

import { useCartAuthSync } from '@/features/cart/hooks/useCartAuthSync';

type CartAuthSyncProps = {
  children: React.ReactNode;
};

/**
 * Runs cart ↔ server sync inside SessionProvider (mounted from AuthProviders).
 */
export function CartAuthSync({ children }: CartAuthSyncProps) {
  useCartAuthSync();
  return <>{children}</>;
}

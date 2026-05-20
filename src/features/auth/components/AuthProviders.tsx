'use client';

import { SessionProvider } from 'next-auth/react';
import { CartAuthSync } from '@/lib/client/providers/CartAuthSync';

type AuthenticationProvidersProps = {
  children: React.ReactNode;
};

export function AuthenticationProviders({ children }: AuthenticationProvidersProps) {
  return (
    <SessionProvider>
      <CartAuthSync>{children}</CartAuthSync>
    </SessionProvider>
  );
}

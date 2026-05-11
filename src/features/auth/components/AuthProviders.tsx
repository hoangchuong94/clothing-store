'use client';

import { SessionProvider } from 'next-auth/react';

type AuthenticationProvidersProps = {
  children: React.ReactNode;
};

export function AuthenticationProviders({ children }: AuthenticationProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

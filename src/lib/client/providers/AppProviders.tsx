'use client';

import { AuthenticationProviders } from '@/features/auth';
import { ReduxProvider } from './ReduxProvider';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider>
      <AuthenticationProviders>{children}</AuthenticationProviders>
    </ReduxProvider>
  );
}

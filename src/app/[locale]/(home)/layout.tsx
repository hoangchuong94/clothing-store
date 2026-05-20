'use client';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';

function HeaderWithAuth() {
  const { isAuthenticated, isLoading, logout } = useAuthUser();

  // While session is loading, show guest UI (login icon) — avoids flash/crash.
  const isLoggedIn = isAuthenticated && !isLoading;

  return <Header isLoggedIn={isLoggedIn} onLogout={logout} />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderWithAuth />
      <main>{children}</main>
      <Footer />
    </>
  );
}

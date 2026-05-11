'use client';

import { Footer } from '@/components/layout/footer';
import { Header, HeaderProvider, useHeader } from '@/components/layout/header';

function HeaderWithState() {
  const { cart, auth, logout } = useHeader();

  return <Header isLoggedIn={auth.isLoggedIn} onLogout={logout} />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderProvider>
        <HeaderWithState />
        <main>{children}</main>
      </HeaderProvider>
      <Footer />
    </>
  );
}
